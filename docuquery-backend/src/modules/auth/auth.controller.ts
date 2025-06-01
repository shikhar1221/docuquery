// src/auth/auth.controller.ts
import { Controller, Post, Body, Delete, Req, UseGuards, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtService } from '@nestjs/jwt'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
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
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Authentication required. Please provide a valid token.',
        error: 'Unauthorized'
      })
    }

    try {
      const decoded = this.jwtService.decode(token) as { sub: string }
      const userId = decoded.sub
      await this.authService.logout(userId)
      return { message: 'Successfully logged out' }
    } catch (error) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid or expired token. Please login again.',
        error: 'Unauthorized'
      })
    }
  }
}
