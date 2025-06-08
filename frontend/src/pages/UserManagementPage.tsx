import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import type { User, CreateUserDto } from '../types/user';
import { Role } from '../types/auth';

export const UserManagementPage = () => {
  const { users, isLoading, error, createUser, deleteUser } = useUsers();
  const [newUser, setNewUser] = useState<CreateUserDto>({
    email: '',
    password: '',
    roles: ['viewer'],
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roles = Array.from(e.target.selectedOptions, (option) => option.value as Role);
    setNewUser((prev) => ({ ...prev, roles }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      setNewUser({
        email: '',
        password: '',
        roles: ['viewer'],
      });
      setCreateError(null);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8">User Management</h2>

                {/* Create User Form */}
                <form onSubmit={handleSubmit} className="mb-8">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Roles
                    </label>
                    <select
                      multiple
                      value={newUser.roles}
                      onChange={handleRoleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Create User
                  </button>
                  {createError && (
                    <p className="text-red-500 text-xs italic mt-2">{createError}</p>
                  )}
                </form>

                {/* User List */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Users</h3>
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}
                  {users.length === 0 ? (
                    <p className="text-gray-500">No users found</p>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user: User) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{user.email}</h4>
                            <p className="text-sm text-gray-500">
                              Roles: {user.roles.join(', ')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 