'use client';

import { LocationWithChildren, updateLocationParent } from '@/app/actions/locations';
import { Edit2, Trash2, ChevronRight, ChevronDown, Plus, GripVertical } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/ToastProvider';

type LocationTreeProps = {
    locations: LocationWithChildren[];
    level?: number;
    onEdit: (location: LocationWithChildren) => void;
    onDelete: (id: string) => void;
    onAddSublocation: (parentId: string) => void;
};

export default function LocationTree({ locations, level = 0, onEdit, onDelete, onAddSublocation }: LocationTreeProps) {
    const router = useRouter();
    const toast = useToast();
    const [dropTarget, setDropTarget] = useState<string | null>(null);
    const [rootDropActive, setRootDropActive] = useState(false);

    if (!locations || locations.length === 0) return null;

    const handleDrop = async (draggedId: string, targetParentId: string | null) => {
        if (draggedId === targetParentId) return;
        setDropTarget(null);
        setRootDropActive(false);

        const res = await updateLocationParent(draggedId, targetParentId);
        if (res.success) {
            toast.success('Location moved!');
            router.refresh();
        } else {
            toast.error(res.error || 'Failed to move location');
        }
    };

    return (
        <div>
            {/* Root-level drop zone to un-nest locations */}
            {level === 0 && (
                <div
                    className={`mb-2 border-2 border-dashed rounded-lg p-2 text-center text-xs text-stone-400 transition-colors ${rootDropActive ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-stone-200'
                        }`}
                    onDragOver={(e) => { e.preventDefault(); setRootDropActive(true); }}
                    onDragLeave={() => setRootDropActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/plain');
                        if (draggedId) handleDrop(draggedId, null);
                    }}
                >
                    Drop here to move to root level
                </div>
            )}

            <ul className={`space-y-1 ${level > 0 ? 'relative' : ''}`}>
                {level > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-[-12px]" />
                )}
                {locations.map((location) => (
                    <LocationItem
                        key={location.id}
                        location={location}
                        level={level}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddSublocation={onAddSublocation}
                        onDrop={handleDrop}
                        dropTarget={dropTarget}
                        setDropTarget={setDropTarget}
                        canAcceptDrop={level < 4}
                    />
                ))}
            </ul>
        </div>
    );
}

function LocationItem({ location, level, onEdit, onDelete, onAddSublocation, onDrop, dropTarget, setDropTarget, canAcceptDrop }: {
    location: LocationWithChildren;
    level: number;
    onEdit: (c: LocationWithChildren) => void;
    onDelete: (id: string) => void;
    onAddSublocation: (id: string) => void;
    onDrop: (draggedId: string, targetParentId: string | null) => void;
    dropTarget: string | null;
    setDropTarget: (id: string | null) => void;
    canAcceptDrop: boolean;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = location.children && location.children.length > 0;
    const isDropTarget = dropTarget === location.id;

    return (
        <li className="relative">
            <div
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', location.id);
                    e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                    // Only allow dropping on root-level locations
                    if (!canAcceptDrop) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setDropTarget(location.id);
                }}
                onDragLeave={() => {
                    setDropTarget(null);
                }}
                onDrop={(e) => {
                    if (!canAcceptDrop) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId && draggedId !== location.id) {
                        onDrop(draggedId, location.id);
                    }
                    setDropTarget(null);
                }}
                className={`
                    flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group transition-all cursor-grab active:cursor-grabbing
                    ${level === 0 ? 'mb-1' : ''}
                    ${isDropTarget && canAcceptDrop ? 'ring-2 ring-indigo-400 bg-indigo-50/50 shadow-sm' : ''}
                `}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Drag handle */}
                    <GripVertical className="w-4 h-4 text-stone-300 shrink-0 group-hover:text-stone-500 transition-colors" />

                    {/* Indentation Spacer for tree structure */}
                    {level > 0 && <div className="w-2" />}

                    {/* Toggle Button for Children */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`
                            p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted
                            transition-colors
                            ${!hasChildren ? 'invisible' : ''}
                        `}
                    >
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 overflow-hidden ml-2">
                        <span className="font-medium truncate text-sm sm:text-base">{location.name}</span>

                        {location._count?.books ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground whitespace-nowrap">
                                {location._count.books} books
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onAddSublocation(location.id)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Add Sublocation"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(location)}
                        className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(location.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Recursive Children */}
            {isOpen && hasChildren && (
                <div className="ml-8">
                    <LocationTree
                        locations={location.children || []}
                        level={level + 1}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddSublocation={onAddSublocation}
                    />
                </div>
            )}
        </li>
    );
}
