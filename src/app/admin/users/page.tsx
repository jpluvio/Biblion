import { getUsers } from '@/app/actions/admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserListClient from './UserListClient';

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    // Check role locally first (optimization, though server action checks again)
    // Note: session.user.role might not be populated depending on callback. 
    // Usually safest to rely on secure data fetch or let the client component handle the "unauthorized" UI if fetch fails.

    const { success, users, error } = await getUsers();

    if (!success) {
        return <div className="p-8 text-red-600">Access Denied or Error: {error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>
            <UserListClient initialUsers={users || []} />
        </div>
    );
}
