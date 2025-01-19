import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { User } from './entity/user.entity'
import { UserService } from './users.service'
import { Inject, ParseIntPipe, UseGuards } from '@nestjs/common'
import { UpdateUserDto } from './dtos/updateUser.dto'
// import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager'
// import { Cache } from 'cache-manager'
import { RoleGuard } from 'src/common/guard/role.guard'
import { Role } from 'src/common/constant/enum.constant'
import { Roles } from 'src/common/decerator/roles'
import { CheckEmail } from 'src/common/dtos/checkEmail.dto '
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'

@Resolver(() => User)
export class UserResolver {
  constructor (
    private usersService: UserService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Query(returns => User)
  @UseGuards(RoleGuard)
  @Roles(Role.USER)
  async getUserById (@Args('id', ParseIntPipe) id: number) {
    // const userCacheKey = `user:${id}`
    // const cachedUser = await this.cacheManager.get(userCacheKey)
    // if (cachedUser) {
    //   return { user: cachedUser, token: 'cached_token' }
    // }

    return await this.usersService.findById(id)
  }

  @Query(returns => User)
  @UseGuards(RoleGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  async getUserByEmail (@Args('checkEmail') checkEmail: CheckEmail) {
    const email: string = checkEmail.email
    // const userCacheKey = `user:${email}`
    // const cachedUser = await this.cacheManager.get(userCacheKey)
    // if (cachedUser) {
    //   return { user: cachedUser, token: 'cached_token' }
    // }

    return await this.usersService.findByEmail(email)
  }

  @Mutation(returns => User)
  @UseGuards(RoleGuard)
  @Roles(Role.USER)
  async updateUser (
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return await this.usersService.updateUser(updateUserDto, user?.id)
  }

  @Query(returns => String)
  @UseGuards(RoleGuard)
  @Roles(Role.USER)
  async deleteUser (@CurrentUser() user: CurrentUserDto) {
    return await this.usersService.deleteUser(user.email)
  }

  @Mutation(returns => String)
  @UseGuards(RoleGuard)
  @Roles(Role.USER)
  async UpdateUserRole (
    @Args('checkEmail') checkEmail: CheckEmail,
    @Args('companyId', ParseIntPipe) companyId: number,
  ) {
    const email = checkEmail.email
    return await this.usersService.editUserRole(email)
  }
}
