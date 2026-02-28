'use client';

import { useState } from 'react';
import { deleteUser, updateUserRole, addUser, updateUserPassword } from '@/app/actions/admin';
import { Trash2, Edit, Save, Plus, X, KeyRound } from 'lucide-react';

export default function UserListClient({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the user and valid reading statuses.')) return;

        const res = await deleteUser(id);
        if (res.success) {
            setUsers(users.filter(u => u.id !== id));
        } else {
            alert('Failed: ' + res.error);
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        const res = await updateUserRole(id, newRole);
        if (res.success) {
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        }
    };

    const handlePasswordSave = async () => {
        if (!editingPasswordUserId) return;
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters.');
            return;
        }

        const res = await updateUserPassword(editingPasswordUserId, newPassword);
        if (res.success) {
            setEditingPasswordUserId(null);
            setNewPassword('');
            alert('Access code updated successfully.');
        } else {
            alert('Failed to update access code: ' + res.error);
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => setIsAddOpen(!isAddOpen)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {isAddOpen && <AddUserForm onClose={() => setIsAddOpen(false)} />}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owned Books</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user._count?.ownedBooks || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                                    <button
                                        onClick={() => setEditingPasswordUserId(user.id)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        title="Change Access Code"
                                    >
                                        <KeyRound className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingPasswordUserId && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Change Access Code</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Min 6 characters"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setEditingPasswordUserId(null);
                                    setNewPassword('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordSave}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Save Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AddUserForm({ onClose }: { onClose: () => void }) {
    return (
        <form action={async (formData) => {
            await addUser(formData);
            window.location.reload(); // Simple reload to refresh list
        }} className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input name="name" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input name="email" type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input name="password" type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select name="role" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Create User</button>
            </div>
        </form>
    );
}
