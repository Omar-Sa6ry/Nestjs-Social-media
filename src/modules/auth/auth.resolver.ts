import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { User } from '../users/entity/user.entity'
import { AuthOutPut, AuthResponse } from './dtos/AuthRes.dto'
import { CreateUserDto } from './dtos/CreateUserData.dto'
import { LoginDto } from './dtos/Login.dto'
import { ResetPasswordDto } from './dtos/ResetPassword.dto'
import { ChangePasswordDto } from './dtos/ChangePassword.dto'
import { CreateImagDto } from '../../common/dtos/createImage.dto'
import { CheckEmail } from 'src/common/dtos/checkEmail.dto '
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Role } from 'src/common/constant/enum.constant'
import { NoToken } from 'src/common/constant/messages.constant'
import { RedisService } from 'src/common/redis/redis.service'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Query } from '@nestjs/common'

@Resolver(of => User)
export class AuthResolver {
  constructor (
    private readonly redisService: RedisService,
    private authService: AuthService,
  ) {}

  @Mutation(returns => AuthResponse)
  async register (
    @Args('fcmToken') fcmToken: string,
    @Args('createUserDto') createUserDto: CreateUserDto,
    @Args('avatar') avatar: CreateImagDto,
  ): Promise<AuthResponse> {
    return {
      statusCode: 201,
      data: await this.authService.register(fcmToken, createUserDto, avatar),
    }
  }

  @Mutation(returns => AuthResponse)
  async login (
    @Args('fcmToken') fcmToken: string,
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser instanceof AuthOutPut) {
      return { data: cachedUser }
    }

    return { data: await this.authService.login(fcmToken, loginDto) }
  }

  @Mutation(returns => String)
  async forgotPassword (@Args('checkEmail') checkEmail: CheckEmail) {
    await this.authService.forgotPassword(checkEmail)
  }

  @Mutation(returns => String)
  async resetPassword (
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(resetPasswordDto)
  }

  @Mutation(returns => String)
  @Auth(Role.ADMIN, Role.MANAGER)
  async changePassword (
    @CurrentUser() user: CurrentUserDto,
    @Args('changePasswordDto') changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user?.id, changePasswordDto)
  }

  @Mutation(returns => AuthResponse)
  async adminLogin (
    @Args('fcmToken') fcmToken: string,
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser instanceof AuthOutPut) {
      return { data: cachedUser }
    }

    return { data: await this.authService.adminLogin(loginDto) }
  }

  @Mutation(returns => AuthResponse)
  async managerLogin (
    @Args('fcmToken') fcmToken: string,
    @Args('loginDto') loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const userCacheKey = `user:${loginDto.email}`
    const cachedUser = await this.redisService.get(userCacheKey)

    if (cachedUser instanceof AuthOutPut) {
      return { data: cachedUser }
    }

    return { data: await this.authService.managerLogin(loginDto) }
  }

  @Mutation(() => Boolean)
  @Auth(Role.ADMIN, Role.MANAGER)
  async logout (@Context('req') req): Promise<boolean> {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      throw new Error(NoToken)
    }
    return true
  }
}
