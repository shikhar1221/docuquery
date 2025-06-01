import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from '../src/modules/userManagement/userManagement.controller'
import { UserService } from '../src/modules/userManagement/userManagement.service'
import { CreateUserDto } from '../src/modules/userManagement/dto/create-user.dto'
import { UpdateUserDto } from '../src/modules/userManagement/dto/update-user.dto'
import { UserEntity } from '../src/common/entities/user.entity'
import { DEFAULT_PERMISSIONS, Role } from '../src/common/enums/roles.enum'
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/modules/auth/auth.service';
import { Reflector } from '@nestjs/core';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUser: UserEntity = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    roles: [Role.Viewer],
    tokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    documents: [],
    permissions: {},
    setDefaultPermissions: function (): void {
        if (Object.keys(this.permissions).length === 0) {
          const defaultPermissions = DEFAULT_PERMISSIONS[this.roles[0]]
          this.permissions = Object.fromEntries(defaultPermissions.map((permission) => [permission, true]))
        }
      
      throw new Error('Function not implemented.')
    },
    hasPermission: function (permission: string): boolean {
      throw new Error('Function not implemented.')
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findAll: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(mockUser),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        roles: [Role.Viewer],
      }

      const result = await controller.create(createUserDto)
      expect(result).toEqual(mockUser)
      expect(userService.create).toHaveBeenCalledWith(createUserDto)
    })
  })

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll()
      expect(result).toEqual([mockUser])
      expect(userService.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return a single user', async () => {
      const result = await controller.findOne('1')
      expect(result).toEqual(mockUser)
      expect(userService.findOne).toHaveBeenCalledWith('1')
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        roles: [Role.Admin],
      }

      const result = await controller.update('1', updateUserDto)
      expect(result).toEqual(mockUser)
      expect(userService.update).toHaveBeenCalledWith('1', updateUserDto)
    })
  })

  describe('remove', () => {
    it('should delete a user', async () => {
      await controller.remove('1')
      expect(userService.remove).toHaveBeenCalledWith('1')
    })
  })
})
