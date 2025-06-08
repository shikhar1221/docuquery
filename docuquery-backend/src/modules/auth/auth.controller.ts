// src/auth/auth.controller.ts
import { Controller, Post, Body, Delete, Req, UseGuards, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtService } from '@nestjs/jwt'
import { LoggerService } from '../../common/logger/logger.service'

interface ErrorWithMessage {
  message?: string;
  stack?: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('AuthController');
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration request received for email: ${registerDto.email}`);
    this.logger.debug(`Registration payload: ${JSON.stringify(registerDto)}`);
    
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`User registered successfully: ${result.id}`);
      return result;
    } catch (error) {
      const err = error as ErrorWithMessage;
      this.logger.error(`Registration failed: ${err.message || 'Unknown error'}`, err.stack || '');
      throw error;
    }
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User logged in successfully.',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token'
        },
        refreshToken: {
          type: 'string',
          description: 'JWT refresh token'
        },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'User ID'
            },
            email: {
              type: 'string',
              description: 'User email'
            },
            roles: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['admin', 'viewer', 'editor']
              },
              description: 'User roles'
            },
            permissions: {
              type: 'object',
              description: 'User permissions'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        }
      }
    }
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login request received for email: ${loginDto.email}`);
    
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`Login successful for user: ${loginDto.email}`);
      return result;
    } catch (error) {
      const err = error as ErrorWithMessage;
      this.logger.warn(`Login failed for user ${loginDto.email}: ${err.message || 'Unknown error'}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User logged out successfully.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  @ApiBearerAuth()
  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    this.logger.log('Logout request received');
    
    if (!token) {
      this.logger.warn('Logout attempt without token');
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Authentication required. Please provide a valid token.',
        error: 'Unauthorized'
      })
    }

    try {
      const decoded = this.jwtService.decode(token) as { sub: string, email: string };
      const userId = decoded.sub;
      this.logger.log(`Processing logout for user ID: ${userId}`);
      
      await this.authService.logout(userId);
      this.logger.log(`User successfully logged out: ${userId}`);
      
      return { message: 'Successfully logged out' };
    } catch (error) {
      const err = error as ErrorWithMessage;
      this.logger.error(`Logout failed: ${err.message || 'Unknown error'}`, err.stack || '');
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid or expired token. Please login again.',
        error: 'Unauthorized'
      });
    }
  }
}
