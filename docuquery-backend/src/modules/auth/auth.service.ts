import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UserRepository } from '../../common/repositories/user.repository'
import { TokenRepository } from '../../common/repositories/token.repository'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UserEntity } from '../../common/entities/user.entity'
import { Role, DEFAULT_PERMISSIONS } from '../../common/enums/roles.enum'

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  //Function to register a new user with default permissions.
  async register(registerDto: RegisterDto): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10)
    const user = await this.userRepository.createUser({
      ...registerDto,
      password: hashedPassword,
      roles: registerDto.roles as Role[],
      permissions: Object.fromEntries(
        DEFAULT_PERMISSIONS[registerDto.roles[0]].map((permission) => [permission, true]),
      ),
    })
    return user
  }

  //Function to update the permissions of a user.
  async updatePermissions(userId: string, permissions: Record<string, boolean>): Promise<UserEntity> {
    const user = await this.userRepository.findOneById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    user.permissions = permissions
    return this.userRepository.repository.save(user)
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(loginDto.email)

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Create access token
    const accessToken = this.jwtService.sign(
      {
        email: user.email,
        sub: user.id,
        roles: user.roles,
        permissions: user.permissions,
      },
      { expiresIn: '1h' },
    )

    // Create refresh token
    const refreshToken = await this.tokenRepository.createRefreshToken(user)

    return { accessToken, refreshToken: refreshToken.token }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const token = await this.tokenRepository.repository.findOne({ where: { token: refreshToken } })
    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const user = await this.userRepository.repository.findOne({ where: { id: token.user.id } })
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // Revoke old refresh token
    await this.tokenRepository.revokeRefreshToken(refreshToken)

    // Create new access token
    const accessToken = this.jwtService.sign(
      {
        email: user.email,
        sub: user.id,
        roles: user.roles,
        permissions: user.permissions,
      },
      { expiresIn: '1h' },
    )

    // Create new refresh token
    await this.tokenRepository.createRefreshToken(user)

    return { accessToken }
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOneById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Revoke all refresh tokens
    await this.tokenRepository.revokeAllRefreshTokens(user)

    // Clear any session data if needed
    // This is optional depending on your session management
  }

  async hasPermission(user: UserEntity, permission: string): Promise<boolean> {
    return user.hasPermission(permission)
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return !(await this.tokenRepository.isTokenValid(token))
  }

  async validateUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.repository.findOne({
      where: { id: parseInt(userId) },
      relations: ['tokens'],
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  // Return user from token
  async getUserFromToken(token: string): Promise<UserEntity> {
    try {
      // Decode the token to get the user ID
      const decoded = this.jwtService.decode(token) as { sub: string }
      const userId = decoded.sub

      // Load user with relations
      const user = await this.userRepository.repository.findOne({
        where: { id: parseInt(userId) },
        relations: ['tokens'],
      })

      if (!user) {
        throw new NotFoundException('User not found')
      }

      return user
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
