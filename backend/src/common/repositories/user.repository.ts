import { DataSource, Repository } from 'typeorm'
import { UserEntity } from '../entities/user.entity'
import { UpdateUserDto } from '../../modules/userManagement/dto/update-user.dto'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class UserRepository {
  repository: Repository<UserEntity>

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(UserEntity)
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } })
  }

  async createUser(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser = this.repository.create(user)
    return this.repository.save(newUser)
  }

  async findAll(): Promise<UserEntity[]> {
    return this.repository.find()
  }

  async findOneById(id: string): Promise<UserEntity> {
    if (!id || isNaN(parseInt(id))) {
      throw new BadRequestException('Invalid user ID')
    }

    const user = await this.repository.findOne({
      where: { id: parseInt(id) },
      relations: ['tokens', 'documents'],
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.repository.findOne({ where: { id: parseInt(id) } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Merge the updateUserDto with the existing user
    const updatedUser = this.repository.merge(user, updateUserDto)
    return this.repository.save(updatedUser)
  }

  async removeUser(id: string): Promise<UserEntity> {
    const user = await this.repository.findOne({ where: { id: parseInt(id) } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    return this.repository.remove(user)
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}
