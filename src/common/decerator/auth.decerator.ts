import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { Role } from '../constant/enum.constant'
import { RoleGuard } from '../guard/role.guard'

export function Auth (...roles: Role[]) {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RoleGuard))
}
