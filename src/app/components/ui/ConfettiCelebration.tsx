'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
    const fire = useCallback(() => {
        // Burst from both sides
        const duration = 2500;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        // Initial big burst
        confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        });

        frame();
    }, []);

    return fire;
}
