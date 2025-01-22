import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { User } from './entity/user.entity'
import { UserService } from './users.service'
import { ParseIntPipe, UseGuards } from '@nestjs/common'
import { UpdateUserDto } from './dtos/updateUser.dto'
import { Role } from 'src/common/constant/enum.constant'
import { CheckEmail } from 'src/common/dtos/checkEmail.dto '
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { RedisService } from 'src/common/redis/redis.service'
import { Auth } from 'src/common/decerator/auth.decerator'

@Resolver(() => User)
export class UserResolver {
  constructor (
    private usersService: UserService,
    private readonly redisService: RedisService,
  ) {}

  @Query(returns => User)
  @Auth(Role.ADMIN, Role.MANAGER)
  async getUserById (@Args('id', ParseIntPipe) id: number) {
    const userCacheKey = `user:${id}`
    const cachedUser = await this.redisService.get(userCacheKey)
    if (cachedUser) {
      return { user: cachedUser }
    }

    return await this.usersService.findById(id)
  }

  @Query(returns => User)
  @Auth(Role.ADMIN, Role.MANAGER)
  async getUserByEmail (@Args('email') checkEmail: CheckEmail) {
    const email: string = checkEmail.email
    const userCacheKey = `user:${email}`
    const cachedUser = await this.redisService.get(userCacheKey)
    if (cachedUser) {
      return { user: cachedUser }
    }

    return await this.usersService.findByEmail(email)
  }

  @Query(returns => User)
  async getUserByUserName (@Args('userName') userName: string) {
    const userCacheKey = `user:${userName}`
    const cachedUser = await this.redisService.get(userCacheKey)
    if (cachedUser) {
      return { user: cachedUser }
    }

    return await this.usersService.findByUserName(userName)
  }

  @Mutation(returns => User)
  @Auth(Role.ADMIN, Role.MANAGER)
  async updateUser (
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return await this.usersService.updateUser(updateUserDto, user?.id)
  }

  @Query(returns => String)
  @Auth(Role.ADMIN, Role.MANAGER)
  async deleteUser (@CurrentUser() user: CurrentUserDto) {
    return await this.usersService.deleteUser(user.email)
  }

  @Mutation(returns => String)
  @Auth(Role.ADMIN, Role.MANAGER)
  async UpdateUserRole (
    @Args('checkEmail') checkEmail: CheckEmail,
    @Args('companyId', ParseIntPipe) companyId: number,
  ) {
    const email = checkEmail.email
    return await this.usersService.editUserRole(email)
  }
}
