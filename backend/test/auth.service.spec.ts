import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../src/modules/auth/auth.service'
import { UserRepository } from '../src/common/repositories/user.repository'
import { TokenRepository } from '../src/common/repositories/token.repository'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException, NotFoundException } from '@nestjs/common'
import { Role } from '../src/common/enums/roles.enum'
import { UserEntity } from '../src/common/entities/user.entity'
import * as bcrypt from 'bcryptjs'
import { RefreshTokenEntity } from '../src/common/entities/refresh-token.entity'

// Add this at the top of the file, after the imports
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}))

describe('AuthService', () => {
  let service: AuthService
  let userRepository: UserRepository
  let tokenRepository: TokenRepository
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
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn().mockResolvedValue(mockUser),
            findByEmail: jest.fn().mockResolvedValue(mockUser),
            findOneById: jest.fn().mockResolvedValue(mockUser),
            repository: {
              save: jest.fn().mockResolvedValue(mockUser),
              findOne: jest.fn().mockResolvedValue(mockUser),
            },
          },
        },
        {
          provide: TokenRepository,
          useValue: {
            createRefreshToken: jest.fn().mockResolvedValue({
              token: 'test-refresh-token',
              user: mockUser,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }),
            revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
            repository: {
              findOne: jest.fn().mockResolvedValue({
                token: 'test-refresh-token',
                user: mockUser,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              }),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-access-token'),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userRepository = module.get<UserRepository>(UserRepository)
    tokenRepository = module.get<TokenRepository>(TokenRepository)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        roles: [Role.Viewer],
      }

      const result = await service.register(registerDto)
      expect(result).toEqual(mockUser)
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedpassword',
        roles: [Role.Viewer],
        permissions: expect.any(Object),
      })
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10)
    })
  })

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = await service.login(loginDto)
      expect(result).toEqual({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      })
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email)
      expect(tokenRepository.createRefreshToken).toHaveBeenCalledWith(mockUser)
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password)
    })

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false)
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('refreshToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const result = await service.refreshToken('test-refresh-token')
      expect(result).toEqual({ accessToken: 'test-access-token' })
      expect(tokenRepository.revokeRefreshToken).toHaveBeenCalledWith('test-refresh-token')
      expect(tokenRepository.createRefreshToken).toHaveBeenCalledWith(mockUser)
    })

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jest.spyOn(tokenRepository.repository, 'findOne').mockResolvedValueOnce({
        token: 'invalid-token',
        user: mockUser, // Changed from null to mockUser
        expiresAt: new Date(Date.now() - 1000), // Expired token
      } as RefreshTokenEntity);
      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('updatePermissions', () => {
    it('should update user permissions', async () => {
      const permissions = { READ_DOCUMENTS: true }
      const result = await service.updatePermissions('1', permissions)
      expect(result).toEqual(mockUser)
      expect(userRepository.repository.save).toHaveBeenCalled()
    })

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(Promise.resolve(null as unknown as UserEntity))
      await expect(service.updatePermissions('999', {})).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})