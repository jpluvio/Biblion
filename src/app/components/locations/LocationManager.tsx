'use client';

import { useState, useEffect } from 'react';
import { LocationWithChildren, createLocation, updateLocation, deleteLocation } from '@/app/actions/locations';
import LocationTree from './LocationTree';
import LocationForm from './LocationForm';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ConfirmDialog, { useConfirmDialog } from '../ui/ConfirmDialog';

type LocationManagerProps = {
    initialLocations: LocationWithChildren[];
};

// Removed local DynamicIcon component

export default function LocationManager({ initialLocations }: LocationManagerProps) {
    // We can use initialLocations but since we revalidatePath, 
    // the page might reload or we might need to handle local state update if we want instant feedback.
    // For simplicity with Server Actions + revalidatePath, relying on router refresh is usually enough 
    // BUT since we are passing initialLocations from server component, they might not update without router.refresh().

    // Actually, router.refresh() will re-run the server component and update the prop.

    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<LocationWithChildren | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { confirm: confirmDelete, dialogProps } = useConfirmDialog();

    const handleCreate = async (data: { name: string; parentId: string | null }) => {
        setIsLoading(true);
        setError(null);
        const res = await createLocation(data.name, data.parentId);
        if (res.success) {
            setIsFormOpen(false);
            router.refresh(); // Refresh server data
        } else {
            setError(res.error || 'Failed to create location');
        }
        setIsLoading(false);
    };

    const handleUpdate = async (data: { name: string; parentId: string | null }) => {
        if (!editingLocation) return;
        setIsLoading(true);
        setError(null);
        const res = await updateLocation(editingLocation.id, data.name);
        // We also need to update parent if it changed, but let's handle that in tree drag-and-drop
        // or add parentId to updateLocation server action if needed. 
        // Actually our updateLocation only takes (id, name). We use updateLocationParent for moving.
        if (res.success && data.parentId !== editingLocation.parentId) {
            await import('@/app/actions/locations').then(m => m.updateLocationParent(editingLocation.id, data.parentId));
        }

        if (res.success) {
            setEditingLocation(undefined);
            setIsFormOpen(false);
            router.refresh();
        } else {
            setError(res.error || 'Failed to update location');
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete({
            title: 'Delete Location',
            message: 'Are you sure you want to delete this location? This action cannot be undone.',
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!confirmed) return;

        setIsLoading(true);
        const res = await deleteLocation(id);
        if (res.success) {
            router.refresh();
        } else {
            setError(res.error || 'Failed to delete location');
        }
        setIsLoading(false);
    };

    const handleAddSublocation = (parentId: string) => {
        setEditingLocation(undefined);
        setError(null);
        // We open the form but we need a way to pass parentId preference
        // Since LocationForm takes initialData or we can just pass a separate prop or specialized initialData
        // Let's assume we can pre-set the form state. 
        // We can pass a "presetParentId" to LocationForm or just use a state that LocationForm reads?
        // Actually LocationForm takes `initialData` which is full location object.
        // Let's create a specialized state for "creating with parent"
        setCreatingParentId(parentId);
        setIsFormOpen(true);
    };

    const [creatingParentId, setCreatingParentId] = useState<string | null>(null);

    const openCreate = () => {
        setEditingLocation(undefined);
        setCreatingParentId(null);
        setError(null);
        setIsFormOpen(true);
    };

    const openEdit = (location: LocationWithChildren) => {
        setEditingLocation(location);
        setError(null);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingLocation(undefined);
        setCreatingParentId(null);
        setError(null);
    };

    // ... handleCreate ...
    // Note: handleCreate logic in LocationManager usually takes arguments from Form onSubmit
    // validation/logic is in the Form or here. 
    // The existing handleCreate takes { name, color, parentId } from Form onSubmit.
    // We just need to ensure Form gets the right default parentId.

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    {/* Header removed from here to rely on the page header, or we keep it if we want the inline description. The user said it's STILL present. Let me assume there's a mobile menu link or another wrapper? Let's remove the h2 and p completely. */}
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    New Location
                </button>
            </div>

            <div className="bg-card text-card-foreground shadow-sm border border-border rounded-xl overflow-hidden">
                {error && !isFormOpen && (
                    <div className="bg-destructive/10 text-destructive p-4 text-sm border-b border-destructive/20">
                        {error}
                    </div>
                )}

                <div className="p-6">
                    <LocationTree
                        locations={initialLocations}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onAddSublocation={handleAddSublocation}
                    />
                </div>

                {initialLocations.length === 0 && (
                    <div className="text-center py-12 px-4">
                        <h3 className="text-lg font-medium">No locations yet</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                            Create your first location to start organizing your library.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-stone-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                {editingLocation ? 'Edit Location' : 'New Location'}
                            </h3>
                            <button onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
                                {error}
                            </div>
                        )}

                        <LocationForm
                            initialData={editingLocation}
                            defaultParentId={creatingParentId}
                            locations={initialLocations}
                            onSubmit={editingLocation ? handleUpdate : handleCreate}
                            onCancel={closeForm}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}

            <ConfirmDialog {...dialogProps} />
        </div>
    );
}
