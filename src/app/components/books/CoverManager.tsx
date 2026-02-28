'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

interface CoverManagerProps {
    currentCover?: string | null;
    onCoverChange: (coverData: string) => void;
}

export default function CoverManager({ currentCover, onCoverChange }: CoverManagerProps) {
    const [preview, setPreview] = useState<string | null>(currentCover || null);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update preview when currentCover prop changes (e.g. from API search)
    useEffect(() => {
        if (currentCover) {
            setPreview(currentCover);
        }
    }, [currentCover]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsCompressing(true);

        try {
            // Compress and resize the image
            const compressedDataUrl = await compressImage(file);
            setPreview(compressedDataUrl);
            onCoverChange(compressedDataUrl);
        } catch (error) {
            console.error('Error compressing image:', error);
            // Fallback to reading without compression if canvas fails
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onCoverChange(result);
            };
            reader.readAsDataURL(file);
        } finally {
            setIsCompressing(false);
        }
    };

    // Client-side image compression
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Max width for book covers
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas context not found'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const triggerCamera = () => {
        if (fileInputRef.current) {
            // Reset value to allow re-selecting same file if needed
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-[2/3] w-32 bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center group">
                {isCompressing ? (
                    <div className="flex flex-col items-center justify-center p-2 text-stone-500">
                        <Loader2 className="h-6 w-6 animate-spin mb-1" />
                        <span className="text-[10px]">Optimizing...</span>
                    </div>
                ) : preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={preview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // If image fails to load, hide it and show placeholder
                            (e.target as HTMLImageElement).style.display = 'none';
                            setPreview(null);
                        }}
                    />
                ) : (
                    <div className="text-center p-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-1" />
                        <span className="text-[10px] text-muted-foreground">No Cover</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <input
                    type="file"
                    accept="image/*"
                    capture="environment" // Hints mobile browsers to use camera
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                <button
                    type="button"
                    onClick={triggerCamera}
                    disabled={isCompressing}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                    <Camera className="h-3 w-3" />
                    Take Photo / Upload
                </button>
            </div>
        </div>
    );
}
