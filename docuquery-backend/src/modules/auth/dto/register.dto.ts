// src/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import { Role } from '../../../common/enums/roles.enum'

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password!: string

  @ApiProperty({ example: '[viewer]', isArray: true, enum: Role, default: [Role.Viewer] })
  roles: string[] = [Role.Viewer]
}
