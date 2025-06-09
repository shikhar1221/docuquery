import { Entity, PrimaryGeneratedColumn, Column, OneToMany, AfterLoad } from 'typeorm'
import { DocumentEntity } from './document.entity'
import { DEFAULT_PERMISSIONS, Role } from '../enums/roles.enum'
import { RefreshTokenEntity } from './refresh-token.entity'

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  email!: string

  @Column()
  password!: string

  @Column({ type: 'enum', enum: Role, array: true, default: [Role.Viewer] })
  roles!: Role[]

  @Column({ type: 'jsonb', default: {} })
  permissions!: Record<string, boolean>

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
  tokens!: RefreshTokenEntity[]

  @OneToMany(() => DocumentEntity, (document) => document.user)
  documents!: DocumentEntity[]

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date

  @AfterLoad()
  setDefaultPermissions() {
    if (Object.keys(this.permissions).length === 0) {
      const defaultPermissions = DEFAULT_PERMISSIONS[this.roles[0]]
      this.permissions = Object.fromEntries(defaultPermissions.map((permission) => [permission, true]))
    }
  }

  hasPermission(permission: string): boolean {
    return this.permissions[permission] === true
  }
}
