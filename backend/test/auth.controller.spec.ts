import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../src/modules/auth/auth.controller'
import { AuthService } from '../src/modules/auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import { RegisterDto } from '../src/modules/auth/dto/register.dto'
import { LoginDto } from '../src/modules/auth/dto/login.dto'
import { UserEntity } from '../src/common/entities/user.entity'
import { Role } from '../src/common/enums/roles.enum'
import { UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService
  let jwtService: JwtService

  const mockUser: UserEntity = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    roles: [Role.Viewer],
    tokens: [],
    permissions: {},
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    setDefaultPermissions: jest.fn(),
    hasPermission: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockUser),
            login: jest.fn().mockResolvedValue({
              accessToken: 'test-access-token',
              refreshToken: 'test-refresh-token',
            }),
            logout: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn().mockReturnValue({ sub: '1' }),
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        roles: [Role.Viewer],
      }

      const result = await controller.register(registerDto)
      expect(result).toEqual(mockUser)
      expect(authService.register).toHaveBeenCalledWith(registerDto)
    })
  })

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      }

      const expectedResponse = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }

      const result = await controller.login(loginDto)
      expect(result).toEqual(expectedResponse)
      expect(authService.login).toHaveBeenCalledWith(loginDto)
    })
  })

  describe('logout', () => {
    it('should logout a user successfully', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer test-token',
        },
      } as Request

      const result = await controller.logout(mockRequest)
      expect(result).toEqual({ message: 'Successfully logged out' })
      expect(authService.logout).toHaveBeenCalledWith('1')
    })

    it('should throw UnauthorizedException when no token provided', async () => {
      const mockRequest = {
        headers: {},
      } as Request

      await expect(controller.logout(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw UnauthorizedException when invalid token provided', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as Request

      jest.spyOn(jwtService, 'decode').mockReturnValueOnce(null)

      await expect(controller.logout(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })
})