import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UserRepository } from '../../common/repositories/user.repository'
import { TokenRepository } from '../../common/repositories/token.repository'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UserEntity } from '../../common/entities/user.entity'
import { Role, DEFAULT_PERMISSIONS } from '../../common/enums/roles.enum'
import { LoggerService } from '../../common/logger/logger.service'

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new LoggerService('AuthService');
  }

  //Function to register a new user with default permissions.
  async register(registerDto: RegisterDto): Promise<UserEntity> {
    this.logger.log(`Registering new user with email: ${registerDto.email}`);
    this.logger.debug(`Registration data: ${JSON.stringify(registerDto)}`);
    
    const hashedPassword = await bcrypt.hash(registerDto.password, 10)
    
    try {
      const user = await this.userRepository.createUser({
        ...registerDto,
        password: hashedPassword,
        roles: registerDto.roles,
        permissions: Object.fromEntries(
          DEFAULT_PERMISSIONS[registerDto.roles[0]].map((permission) => [permission, true]),
        ),
      })
      this.logger.log(`User registered successfully: ${user.id}`);
      return user;
    } catch (error: any) {
      this.logger.error(`Failed to register user: ${error.message || 'Unknown error'}`, error.stack || '');
      throw error;
    }
  }

  //Function to update the permissions of a user.
  async updatePermissions(userId: string, permissions: Record<string, boolean>): Promise<UserEntity> {
    this.logger.log(`Updating permissions for user: ${userId}`);
    
    const user = await this.userRepository.findOneById(userId)
    if (!user) {
      this.logger.warn(`User not found for permission update: ${userId}`);
      throw new NotFoundException('User not found')
    }
    
    user.permissions = permissions
    const updatedUser = await this.userRepository.repository.save(user);
    this.logger.log(`Permissions updated for user: ${userId}`);
    return updatedUser;
  }

  async login(loginDto: LoginDto): Promise<{ 
    accessToken: string; 
    refreshToken: string;
    user: {
      id: number;
      email: string;
      roles: Role[];
      permissions: Record<string, boolean>;
      createdAt: Date;
      updatedAt: Date;
    };
  }> {
    this.logger.log(`Login attempt for user: ${loginDto.email}`);
    
    const user = await this.userRepository.findByEmail(loginDto.email)

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      this.logger.warn(`Failed login attempt for user: ${loginDto.email}`);
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
    
    this.logger.log(`User logged in successfully: ${user.id}`);
    return { 
      accessToken, 
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
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
