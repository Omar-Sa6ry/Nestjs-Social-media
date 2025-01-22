import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { UserService } from '../users/users.service'
import { GenerateToken } from '../../common/config/jwt.service'
import { User } from '../users/entity/user.entity'
import { MoreThan, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { HashPassword } from './utils/hashPassword'
import { randomBytes } from 'crypto'
import { ChangePasswordDto } from './dtos/changePassword.dto'
import { ResetPasswordDto } from './dtos/resetPassword.dto'
import { LoginDto } from './dtos/login.dto'
import { ComparePassword } from './utils/comparePassword'
import { CheckEmail } from 'src/common/dtos/checkEmail.dto '
import { Role } from 'src/common/constant/enum.constant'
import { CreateUserDto } from './dtos/createUserData.dto'
import {
  EmailIsWrong,
  EndOfEmail,
  InvalidToken,
  IsnotAdmin,
  IsnotCompany,
  IsnotManager,
  OldPasswordENewPassword,
  SamePassword,
} from 'src/common/constant/messages.constant'
import { SendEmailService } from 'src/common/queue/services/sendemail.service'
import { CreateImagDto } from 'src/common/dtos/createImage.dto'
import { UploadService } from 'src/common/queue/services/upload.service'

@Injectable()
export class AuthService {
  constructor (
    private userService: UserService,
    private generateToken: GenerateToken,
    private readonly sendEmailService: SendEmailService,
    private readonly uploadService: UploadService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async register (createUserDto: CreateUserDto, avatar?: CreateImagDto) {
    const { userName, phone, email } = createUserDto
    if (!email.endsWith('@gmail.com')) {
      throw new BadRequestException(EndOfEmail)
    }
    const query = this.userRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const user = await this.userRepository.create({
        userName,
        email,
        phone,
        password: await HashPassword(createUserDto.password),
      })
      await this.userRepository.save(user)

      if (avatar.name) {
        const filename = await this.uploadService.uploadImage(avatar)
        if (typeof filename === 'string') {
          user.avatar = filename
        }
      }

      await this.userRepository.save(user)
      await this.sendEmailService.sendEmail(
        email,
        'Register in App',
        `You registered successfully in the App`,
      )

      const token = await this.generateToken.jwt(user?.email, user?.id)
      const result = { user, token }
      const userCacheKey = `user:${email}`
      // await this.cacheManager.set(userCacheKey, result, 3600)

      return result
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async login (loginDto: LoginDto) {
    const { email, password } = loginDto
    const user = await this.userService.findByEmail(email.toLowerCase())
    if (!(user instanceof User)) {
      throw new NotFoundException(EmailIsWrong)
    }

    await ComparePassword(password, user?.password)
    const token = await this.generateToken.jwt(user?.email, user?.id)
    const userCacheKey = `user:${email}`
    // await this.cacheManager.set(userCacheKey, { user, token }, 3600)

    return { user, token }
  }

  async forgotPassword (forgotPasswordDto: CheckEmail) {
    const lowerEmail = forgotPasswordDto.email.toLowerCase()
    const user = await this.userService.findByEmail(lowerEmail)
    if (!(user instanceof User)) {
      throw new NotFoundException(EmailIsWrong)
    }
    if (user.role !== Role.USER) {
      throw new BadRequestException(IsnotAdmin + ', you cannot edit this user')
    }

    const token = randomBytes(32).toString('hex')
    user.resetToken = token
    user.resetTokenExpiry = new Date(Date.now() + 900000) // 15 minutes
    const link = `http://localhost:3000/grapql/reset-password?token=${token}`
    await this.userRepository.save(user)

    await this.sendEmailService.sendEmail(
      lowerEmail,
      'Forgot Password',
      `click here to be able to change your password ${link}`,
    )

    return `${user.userName} ,Message sent successfully for your gmail`
  }

  async resetPassword (resetPassword: ResetPasswordDto) {
    const query = this.userRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const { password, token } = resetPassword
      const user = await this.userRepository.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: MoreThan(new Date(Date.now())),
        },
      })
      if (!user) {
        throw new BadRequestException(InvalidToken)
      }

      user.password = await HashPassword(password)
      await this.userRepository.save(user)
      return `${user.userName} ,your password is Updated Successfully`
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async changePassword (email: string, changePassword: ChangePasswordDto) {
    const query = this.userRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const { password, newPassword } = changePassword
      if (password === newPassword) {
        throw new BadRequestException(SamePassword)
      }

      const user = await this.userService.findByEmail(email)
      if (!(user instanceof User)) {
        throw new NotFoundException(EmailIsWrong)
      }
      if (user.password === (await HashPassword(password))) {
        throw new BadRequestException(OldPasswordENewPassword)
      }

      user.password = await HashPassword(newPassword)
      await this.userRepository.save(user)
      return `${user.userName} ,your password is Updated Successfully`
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async adminLogin (loginDto: LoginDto) {
    const { email, password } = loginDto
    const user = await this.userService.findByEmail(email.toLowerCase())
    if (!(user instanceof User)) {
      throw new NotFoundException(EmailIsWrong)
    }

    if (user.role !== (Role.ADMIN || Role.MANAGER)) {
      throw new UnauthorizedException(IsnotAdmin)
    }
    await ComparePassword(password, user?.password)
    const token = await this.generateToken.jwt(user?.email, user?.id)
    const userCacheKey = `user:${email}`
    // await this.cacheManager.set(userCacheKey, { user, token }, 3600)

    return { user, token }
  }

  async companyLogin (loginDto: LoginDto) {
    const { email, password } = loginDto
    const user = await this.userService.findByEmail(email.toLowerCase())
    if (!(user instanceof User)) {
      throw new NotFoundException(EmailIsWrong)
    }

    if (user.role !== (Role.COMPANY || Role.MANAGER)) {
      throw new UnauthorizedException(IsnotCompany)
    }
    await ComparePassword(password, user?.password)
    const token = await this.generateToken.jwt(user?.email, user?.id)
    const userCacheKey = `user:${email}`
    // await this.cacheManager.set(userCacheKey, { user, token }, 3600)

    return { user, token }
  }

  async managerLogin (loginDto: LoginDto) {
    const { email, password } = loginDto
    const user = await this.userService.findByEmail(email.toLowerCase())
    if (!(user instanceof User)) {
      throw new NotFoundException(EmailIsWrong)
    }

    if (user.role === Role.MANAGER) {
      throw new UnauthorizedException(IsnotManager)
    }
    await ComparePassword(password, user?.password)
    const token = await this.generateToken.jwt(user?.email, user?.id)
    const userCacheKey = `user:${email}`
    // await this.cacheManager.set(userCacheKey, { user, token }, 3600)

    return { user, token }
  }
}
