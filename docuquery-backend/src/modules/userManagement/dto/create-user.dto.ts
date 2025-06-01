// src/userManagement/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator'
import { Role } from '../../../common/enums/roles.enum'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  @IsNotEmpty()
  @MinLength(6)
  password!: string

  @ApiProperty({ example: ['viewer'], description: 'The roles of the user', isArray: true })
  @IsOptional()
  roles: Role[] = [Role.Viewer]
}
