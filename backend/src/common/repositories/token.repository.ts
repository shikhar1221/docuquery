import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { RefreshTokenEntity } from '../entities/refresh-token.entity'
import { UserEntity } from '../entities/user.entity'
import * as crypto from 'crypto'

@Injectable()
export class TokenRepository {
  repository: Repository<RefreshTokenEntity>

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(RefreshTokenEntity)
  }

  async createToken(token: string, user: UserEntity, expiresAt: Date): Promise<void> {
    const tokenEntity = this.repository.create({ token, user, expiresAt })
    await this.repository.save(tokenEntity)
  }

  async isTokenValid(token: string): Promise<boolean> {
    const tokenEntity = await this.repository.findOne({ where: { token } })
    return !tokenEntity
  }

  async createRefreshToken(user: UserEntity): Promise<RefreshTokenEntity> {
    const token = this.generateRefreshToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    const refreshToken = this.repository.create({ token, user, expiresAt })
    return this.repository.save(refreshToken)
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.repository.delete({ token })
  }

  async revokeAllRefreshTokens(user: UserEntity): Promise<void> {
    await this.repository.delete({ user })
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }


  private generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }
}
