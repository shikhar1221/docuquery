// src/userManagement/user.service.ts
import { ConflictException, Injectable } from '@nestjs/common'
import { UserRepository } from '../../common/repositories/user.repository'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserEntity } from '../../common/entities/user.entity'
import { Role } from '../../common/enums/roles.enum'
import * as bcrypt from 'bcryptjs'
import { NotFoundException } from '@nestjs/common'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email)
    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = await this.userRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
      roles: createUserDto.roles || [Role.Viewer],
    })
    return user
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.findAll()
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.userRepository.updateUser(id, updateUserDto)
    return this.userRepository.findOneById(id)
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.removeUser(id)
  }
}
