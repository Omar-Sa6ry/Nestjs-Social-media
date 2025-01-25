import { UserService } from 'src/modules/users/users.service'
import { User } from 'src/modules/users/entity/user.entity'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { NoToken } from '../constant/messages.constant'
import { Role } from '../constant/enum.constant'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
@Injectable()
export class RoleGuard implements CanActivate {
  constructor (
    private jwtService: JwtService,
    private userService: UserService,
    private reflector: Reflector,
  ) {}

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext()
    const request = ctx.req

    const token = await this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException(NoToken)
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })

      if (payload.id && payload.email) {
        const user = await this.userService.findById(payload.id)
        if (!(user instanceof User)) {
          throw new NotFoundException(
            'User with id ' + payload.id + ' not found',
          )
        }
        const requiredRoles = await this.reflector.get<Role[]>(
          'roles',
          context.getHandler(),
        )

        if (requiredRoles && requiredRoles.includes(user.role)) {
          request['user'] = {
            id: payload.id,
          }
        } else {
          throw new UnauthorizedException('Invalid token Paylod')
        }
      } else {
        throw new UnauthorizedException('Invalid token payload')
      }
    } catch {
      throw new UnauthorizedException('Invalid token')
    }

    return true
  }

  extractTokenFromHeader (request: Request): string | null {
    const [type, token] = request.headers['authorization']?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }
}
