// nestjs-project/src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { Role } from '../enums/roles.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler()])

    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()

    try {
      const user = request.user // Added to request by JwtAuthGuard

      if (!user.roles) {
        throw new ForbiddenException('User roles not found')
      }

      const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role))
      if (!hasRequiredRole) {
        throw new ForbiddenException('Insufficient role permissions')
      }

      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
