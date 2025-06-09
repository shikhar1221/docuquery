import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import type { User, CreateUserDto } from '../types/user';
import { Role } from '../types/roles';
import type { Role as RoleType } from '../types/roles';

export const UserManagementPage = () => {
  const { users, isLoading, error, createUser, updateUser, deleteUser } = useUsers();
  const [newUser, setNewUser] = useState<CreateUserDto>({
    username: '',
    email: '',
    password: '',
    roles: [Role.Viewer],
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roles = Array.from(e.target.selectedOptions, (option) => option.value as RoleType);
    setNewUser((prev) => ({ ...prev, roles }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setCreateError(null);
      await createUser(newUser);
      setNewUser({
        username: '',
        email: '',
        password: '',
        roles: [Role.Viewer],
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setUpdateError(null);
  };

  const handleUpdateRoles = async (userId: number, roles: RoleType[]) => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      await updateUser(userId, { roles });
      setEditingUser(null);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update user roles');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
        <div className="bg-white rounded-xl shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>

            {/* Create User Form */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New User</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={newUser.username}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                      placeholder="Enter email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                  <select
                    multiple
                    value={newUser.roles}
                    onChange={handleRoleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    size={3}
                  >
                    <option value={Role.Viewer}>Viewer</option>
                    <option value={Role.Editor}>Editor</option>
                    <option value={Role.Admin}>Admin</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple roles</p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                      isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
                {createError && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                    <p className="text-sm text-red-700">{createError}</p>
                  </div>
                )}
              </form>
            </div>

            {/* User List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Users</h3>
              {error && (
                <div className="rounded-lg bg-red-50 p-4 mb-6 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {users.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user: User) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            {editingUser?.id === user.id ? (
                              <div className="space-y-2">
                                <select
                                  multiple
                                  value={editingUser.roles}
                                  onChange={(e) => {
                                    const roles = Array.from(
                                      e.target.selectedOptions,
                                      (option) => option.value as RoleType
                                    );
                                    setEditingUser({ ...editingUser, roles });
                                  }}
                                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                  size={3}
                                >
                                  <option value={Role.Viewer}>Viewer</option>
                                  <option value={Role.Editor}>Editor</option>
                                  <option value={Role.Admin}>Admin</option>
                                </select>
                                {updateError && (
                                  <p className="text-sm text-red-600">{updateError}</p>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                  <span
                                    key={role}
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      role === Role.Admin
                                        ? 'bg-purple-100 text-purple-800'
                                        : role === Role.Editor
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {editingUser?.id === user.id ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateRoles(user.id, editingUser.roles)}
                                  disabled={isUpdating}
                                  className={`px-3 py-1 rounded text-sm font-medium ${
                                    isUpdating
                                      ? 'bg-gray-100 text-gray-500'
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                >
                                  {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(user)}
                                  className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                                >
                                  Edit Roles
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

  );
};