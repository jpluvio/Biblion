'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (error: any) => void;
}

export default function BarcodeScanner({ onScanSuccess, onScanFailure }: BarcodeScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Check for secure context on mount
        if (typeof window !== 'undefined' &&
            window.location.protocol === 'http:' &&
            window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1') {
            setError("Camera access requires HTTPS or Localhost. Cannot scan on this network connection.");
        }
    }, []);

    useEffect(() => {
        if (isScanning && !scannerRef.current && !error) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 }, // Wider box for barcodes
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true
                },
                /* verbose= */ false
            );

            scannerRef.current.render(
                (decodedText) => {
                    onScanSuccess(decodedText);
                    stopScanning();
                },
                (err) => {
                    if (onScanFailure) onScanFailure(err);
                }
            );
        }

        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(console.error);
                } catch (e) {
                    // Ignore cleanup errors
                }
                scannerRef.current = null;
            }
        };
    }, [isScanning, onScanSuccess, onScanFailure, error]);

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    if (error) {
        return (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full">
            {!isScanning ? (
                <button
                    type="button"
                    onClick={() => setIsScanning(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 border border-stone-200 rounded-md hover:bg-stone-200 transition-colors w-full justify-center sm:w-auto"
                >
                    <Camera className="h-4 w-4" />
                    Scan Barcode
                </button>
            ) : (
                <div className="relative border-2 border-orange-100 rounded-xl overflow-hidden bg-black">
                    <button
                        type="button"
                        onClick={stopScanning}
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 z-50 backdrop-blur-sm"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div id="reader" className="w-full [&>div]:!shadow-none [&>div]:!border-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs text-center">
                        Point camera at ISBN barcode
                    </div>
                </div>
            )}
        </div>
    );
}
