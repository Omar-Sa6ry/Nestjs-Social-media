import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { Inject, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { User } from '../users/entity/user.entity'
import { AuthResponse } from './dtos/AuthRes.dto'
import { CreateUserDto } from './dtos/createUserData.dto'
import { LoginDto } from './dtos/login.dto'
import { ResetPasswordDto } from './dtos/resetPassword.dto'
import { ChangePasswordDto } from './dtos/changePassword.dto'
// import { CACHE_MANAGER } from '@nestjs/cache-manager'
// import { Cache } from 'cache-manager'
import { CreateImagDto } from '../upload/dtos/createImage.dto'
import { CheckEmail } from 'src/common/dtos/checkEmail.dto '
import { RoleGuard } from 'src/common/guard/role.guard'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Role } from 'src/common/constant/enum.constant'
import { Roles } from 'src/common/decerator/roles'
import { NoToken } from 'src/common/constant/messages.constant'

@Resolver(of => User)
export class AuthResolver {
  constructor (
    private authService: AuthService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Mutation(returns => AuthResponse)
  async register (
    @Args('createUserDto') createUserDto: CreateUserDto,
    @Args('avatar') avatar: CreateImagDto,
  ) {
    // const userCacheKey = `user:${createUserDto.email}`
    // const cachedUser = await this.cacheManager.get(userCacheKey)

    // if (cachedUser) {
    //   return { result: cachedUser }
    // }

    return await this.authService.register(createUserDto, avatar)
  }

  @Mutation(returns => AuthResponse)
  async login (@Args('loginDto') loginDto: LoginDto) {
    // const userCacheKey = `user:${loginDto.email}`
    // const cachedUser = await this.cacheManager.get(userCacheKey)

    // if (cachedUser) {
    //   return { result: cachedUser }
    // }

    return await this.authService.login(loginDto)
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
  @UseGuards(RoleGuard)
  @Roles(Role.USER)
  async changePassword (
    @CurrentUser() user: CurrentUserDto,
    @Args('changePasswordDto') changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user?.email, changePasswordDto)
  }

  @Mutation(returns => AuthResponse)
  async adminLogin (@Args('loginDto') loginDto: LoginDto) {
    // const userCacheKey = `user:${loginDto.email}`
    // const cachedUser = await this.cacheManager.get(userCacheKey)

    // if (cachedUser) {
    //   return { result: cachedUser }
    // }

    return await this.authService.adminLogin(loginDto)
  }

  @Mutation(returns => AuthResponse)
  async managerLogin (@Args('loginDto') loginDto: LoginDto) {
    // const userCacheKey = `user:${loginDto.email}`
    // const cachedUser = await this.cacheManager.get(userCacheKey)

    // if (cachedUser) {
    //   return { result: cachedUser }
    // }

    return await this.authService.managerLogin(loginDto)
  }

  @Mutation(returns => AuthResponse)
  async companyLogin (@Args('loginDto') loginDto: LoginDto) {
    // const userCacheKey = `user:${loginDto.email}`
    // const cachedUser = await this.cacheManager.get(userCacheKey)

    // if (cachedUser) {
    //   return { result: cachedUser }
    // }

    return await this.authService.companyLogin(loginDto)
  }

  @Mutation(() => Boolean)
  @UseGuards(RoleGuard)
  @Roles(Role.USER)
  async logout (@Context('req') req): Promise<boolean> {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      throw new Error(NoToken)
    }
    return true
  }
}
