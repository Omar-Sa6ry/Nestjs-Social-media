import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entity/user.entity'
import { UploadService } from 'src/common/queue/services/upload.service'
import { UpdateUserDto } from './dtos/updateUser.dto'
import { EmailIsWrong, EmailUsed } from 'src/common/constant/messages.constant'
import { Role } from 'src/common/constant/enum.constant'
import { unlinkSync } from 'fs'
// import { CACHE_MANAGER } from '@nestjs/cache-manager'
import * as fs from 'fs'
// import { Cache } from 'cache-manager'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class UserService {
  constructor (
    private readonly uploadService: UploadService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findById (id: number) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      return new NotFoundException(`User with this ${id} not found`)
    }

    const userCacheKey = `user:${user.id}`
    // await this.cacheManager.set(userCacheKey, user, 3600)

    return user
  }

  async findByEmail (email: string) {
    const user = await this.userRepository.findOne({ where: { email } })
    if (!user) {
      return new NotFoundException(`User with ${email} not found`)
    }
    const userCacheKey = `user:${user.email}`
    // await this.cacheManager.set(userCacheKey, user, 3600)

    return user
  }

  async updateUser (updateUserDto: UpdateUserDto, id: number) {
    const query = this.userRepository.manager.connection.createQueryRunner()
    await query.startTransaction()
    try {
      const user = await this.userRepository.findOne({ where: { id } })
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`)
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        })
        if (existingUser) {
          throw new BadRequestException(EmailUsed)
        }
      }

      Object.assign(user, updateUserDto)

      if (updateUserDto.avatar) {
        const oldPath = user.avatar
        const filename = await this.uploadService.uploadImage(
          updateUserDto.avatar,
        )
        if (typeof filename === 'string') {
          user.avatar = filename

          if (oldPath && fs.existsSync(oldPath)) {
            unlinkSync(oldPath)
          }
        }
      }

      const userCacheKey = `user:${user.email}`
      // await this.cacheManager.set(userCacheKey, user)

      await this.userRepository.save(user)
      await query.commitTransaction()
      return user
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async deleteUser (email: string) {
    const user = await this.findByEmail(email)
    if (!(user instanceof User)) {
      throw new NotFoundException(EmailIsWrong)
    }

    await this.userRepository.remove(user)
    return `User with email : ${email} deleted Successfully`
  }

  async editUserRole (email: string) {
    const user = await this.findByEmail(email)
    if (!(user instanceof User)) {
      throw new NotFoundException(EmailIsWrong)
    }

    user.role = Role.ADMIN
    await this.userRepository.save(user)
    return `User with email : ${user.email} updated Successfully`
  }
}
