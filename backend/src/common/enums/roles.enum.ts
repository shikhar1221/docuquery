import { Permission } from './permissions.enum'

export enum Role {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

export const DEFAULT_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.Admin]: [
    Permission.DOCUMENTS_READ,
    Permission.DOCUMENTS_CREATE,
    Permission.DOCUMENTS_UPDATE,
    Permission.DOCUMENTS_DELETE,
    Permission.DOCUMENTS_DOWNLOAD,
    Permission.INGESTION_TRIGGER,
    Permission.INGESTION_STATUS,
    Permission.USERS_READ,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
    Permission.ROLES_READ,
    Permission.ROLES_CREATE,
    Permission.ROLES_UPDATE,
    Permission.ROLES_DELETE,
  ],
  [Role.Editor]: [
    Permission.DOCUMENTS_READ,
    Permission.DOCUMENTS_CREATE,
    Permission.DOCUMENTS_UPDATE,
    Permission.DOCUMENTS_DOWNLOAD,
    Permission.INGESTION_TRIGGER,
    Permission.INGESTION_STATUS,
  ],
  [Role.Viewer]: [Permission.DOCUMENTS_READ, Permission.DOCUMENTS_DOWNLOAD, Permission.INGESTION_STATUS],
}
