// guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { Role } from '../enums/roles.enum'
import { Permission } from '../enums/permissions.enum'
import { AuthService } from '../../modules/auth/auth.service'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtAuthGuard extends PassportAuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler())

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const token = request.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      const user = await this.authService.getUserFromToken(token)
      request.user = user // Attach user to request for other guards

      // Verify token
      await this.jwtService.verify(token)
      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
