import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { User } from './entity/user.entity'
import { UserService } from './users.service'
import { ParseIntPipe } from '@nestjs/common'
import { UpdateUserDto } from './dtos/UpdateUser.dto'
import { Role } from 'src/common/constant/enum.constant'
import { CheckEmail } from 'src/common/dtos/checkEmail.dto '
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { RedisService } from 'src/common/redis/redis.service'
import { Auth } from 'src/common/decerator/auth.decerator'
import { UserResponse } from './dtos/UserResponse.dto'

@Resolver(() => User)
export class UserResolver {
  constructor (
    private usersService: UserService,
    private readonly redisService: RedisService,
  ) {}

  @Query(returns => UserResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async getUserById (
    @Args('id', ParseIntPipe) id: number,
  ): Promise<UserResponse> {
    const userCacheKey = `user:${id}`
    const cachedUser = await this.redisService.get(userCacheKey)
    if (cachedUser instanceof User) {
      return { data: cachedUser }
    }

    return { data: await this.usersService.findById(id) }
  }

  @Query(returns => UserResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async getUserByEmail (
    @Args('email') checkEmail: CheckEmail,
  ): Promise<UserResponse> {
    const email: string = checkEmail.email
    const userCacheKey = `user:${email}`
    const cachedUser = await this.redisService.get(userCacheKey)
    if (cachedUser instanceof User) {
      return { data: cachedUser }
    }

    return { data: await this.usersService.findByEmail(email) }
  }

  @Query(returns => UserResponse)
  async getUserByUserName (
    @Args('userName') userName: string,
  ): Promise<UserResponse> {
    const userCacheKey = `user:${userName}`
    const cachedUser = await this.redisService.get(userCacheKey)
    if (cachedUser instanceof User) {
      return { data: cachedUser }
    }

    return { data: await this.usersService.findByUserName(userName) }
  }

  @Mutation(returns => UserResponse)
  @Auth(Role.ADMIN, Role.MANAGER)
  async updateUser (
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<UserResponse> {
    return { data: await this.usersService.updateUser(updateUserDto, user?.id) }
  }

  @Query(returns => String)
  @Auth(Role.ADMIN, Role.MANAGER)
  async deleteUser (@CurrentUser() user: CurrentUserDto) {
    return await this.usersService.deleteUser(user.id)
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
