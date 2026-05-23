import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/design/primitives/Button';
import { Card, CardLabel } from '@/design/primitives/Card';
import { useAuthStore } from '@/lib/auth/useAuthStore';

interface User {
  user_id: string;
  name: string;
  email: string | null;
  role: string;
  is_active: boolean;
}

export function UserManagement() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'bay' as 'bay' | 'admin' | 'super_admin',
    is_active: true,
  });

  const fetchUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create user');
      }

      await fetchUsers();
      setShowCreateForm(false);
      setFormData({ name: '', email: '', password: '', role: 'bay', is_active: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingUser) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/users/${editingUser.user_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          is_active: formData.is_active,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update user');
      }

      await fetchUsers();
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'bay', is_active: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!token) return;
    if (!confirm(`Deactivate user "${userName}"?`)) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to deactivate user');
      }

      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email || '',
      password: '',
      role: user.role as any,
      is_active: user.is_active,
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowCreateForm(false);
    setFormData({ name: '', email: '', password: '', role: 'bay', is_active: true });
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      bay: 'bg-gray-100 text-gray-700',
    };
    return colors[role as keyof typeof colors] || colors.bay;
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Loading users...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <div className="text-center py-8 text-red-600">{error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
            <CardLabel>User Management</CardLabel>
          </div>
          {!showCreateForm && !editingUser && (
            <Button
              variant="primary"
              size="sm"
              leading={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowCreateForm(true)}
            >
              Add User
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingUser) && (
          <form onSubmit={editingUser ? handleUpdate : handleCreate} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-[14px] font-semibold mb-3">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[12px] font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-2 text-[13px] border border-gray-300 rounded-md"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-[12px] font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full p-2 text-[13px] border border-gray-300 rounded-md"
                  />
                </div>
              )}
              {!editingUser && (
                <div>
                  <label className="block text-[12px] font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full p-2 text-[13px] border border-gray-300 rounded-md"
                  />
                </div>
              )}
              <div>
                <label className="block text-[12px] font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full p-2 text-[13px] border border-gray-300 rounded-md"
                >
                  <option value="bay">Bay Team</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm">
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                <th className="pb-2 font-semibold text-[var(--color-text-secondary)]">Name</th>
                <th className="pb-2 font-semibold text-[var(--color-text-secondary)]">Email</th>
                <th className="pb-2 font-semibold text-[var(--color-text-secondary)]">Role</th>
                <th className="pb-2 font-semibold text-[var(--color-text-secondary)]">Status</th>
                <th className="pb-2 font-semibold text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} className="border-b border-[var(--color-border)]">
                  <td className="py-3">{user.name}</td>
                  <td className="py-3 text-[var(--color-text-secondary)]">{user.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-[11px] font-medium ${getRoleBadge(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3">
                    {user.is_active ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id, user.name)}
                        className="text-red-600 hover:text-red-800"
                        title="Deactivate user"
                        disabled={!user.is_active}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-[12px] text-[var(--color-text-tertiary)]">
          Total users: {users.length} ({users.filter(u => u.is_active).length} active)
        </div>
      </Card>
    </div>
  );
}
