// permissions.enum.ts
export enum Permission {
  // Document permissions
  DOCUMENTS_READ = 'documents:read',
  DOCUMENTS_CREATE = 'documents:create',
  DOCUMENTS_UPDATE = 'documents:update',
  DOCUMENTS_DELETE = 'documents:delete',
  DOCUMENTS_DOWNLOAD = 'documents:download',

  // Ingestion permissions
  INGESTION_TRIGGER = 'ingestion:trigger',
  INGESTION_STATUS = 'ingestion:status',

  // User management permissions
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // Role management permissions
  ROLES_READ = 'roles:read',
  ROLES_CREATE = 'roles:create',
  ROLES_UPDATE = 'roles:update',
  ROLES_DELETE = 'roles:delete',
}
