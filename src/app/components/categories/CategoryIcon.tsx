'use client';

import { Folder } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
    if (!name) return null;
    const IconComponent = (Icons as any)[name] || Folder;
    return <IconComponent className={className} />;
}
