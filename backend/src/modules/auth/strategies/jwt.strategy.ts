// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '../auth.service'
import { UserEntity } from '../../../common/entities/user.entity'
import { UnauthorizedException } from '@nestjs/common'
import * as Express from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your-secret-key', // Use from config
      passReqToCallback: true,
    })
  }

  async validate(request: Express.Request, payload: any): Promise<UserEntity> {
    const token = request.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    const user = await this.authService.getUserFromToken(token)
    if (!user) {
      throw new UnauthorizedException('Invalid token')
    }

    return user
  }
}
