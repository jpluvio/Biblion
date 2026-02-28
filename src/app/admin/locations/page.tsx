import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getLocations } from '@/app/actions/locations';
import LocationManager from '@/app/components/locations/LocationManager';

export default async function LocationsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const { success, locations } = await getLocations();

    return (
        <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Locations</h1>
            <p className="text-muted-foreground mb-6">
                Manage your book locations and organization hierarchy.
            </p>

            {success && locations ? (
                <LocationManager initialLocations={locations as any} />
                // cast to any or fix types if slight mismatch between prisma result and component props
            ) : (
                <div className="text-red-600 p-4 bg-red-50 rounded-md">
                    Failed to load locations.
                </div>
            )}
        </main>
    );
}
