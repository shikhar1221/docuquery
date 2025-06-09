// guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { Permission } from '../enums/permissions.enum'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [context.getHandler()])

    if (!requiredPermissions) {
      return true
    }

    const request = context.switchToHttp().getRequest()

    try {
      const user = request.user // Added to request by JwtAuthGuard

      if (!user.permissions) {
        throw new ForbiddenException('User permissions not found')
      }

      const hasRequiredPermission = requiredPermissions.every((permission) => user.permissions[permission] === true)
      if (!hasRequiredPermission) {
        throw new ForbiddenException('Insufficient permission')
      }

      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
