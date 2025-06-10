import { Link } from 'react-router-dom';
import type { Role } from '../types/roles';
import { useSessionStore } from '../store/session';

export const DashboardPage = () => {
  const { user } = useSessionStore();

  return (
    <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Documents
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage your documents
                      </p>
                      <div className="mt-4">
                        <Link
                          to="/documents"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Documents
                        </Link>
                      </div>
                    </div>
                  </div>

                  {user?.roles.includes('admin' as Role) && (
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          User Management
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Manage system users
                        </p>
                        <div className="mt-4">
                          <Link
                            to="/users"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Manage Users
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
    </>
  );
};