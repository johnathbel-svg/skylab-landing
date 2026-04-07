'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Afacad } from 'next/font/google';

const afacad = Afacad({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700']
});

interface SkylabLogoProps {
    className?: string;
    size?: number;
}

export const SkylabBrandText: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`flex tracking-tight ${afacad.className} ${className}`}>
        <span className="text-white">Sky</span>
        <span className="text-[#0EA5E9]">lab.</span>
    </div>
);

export const SkylabLogo: React.FC<SkylabLogoProps> = ({
    className = "w-10 h-10",
}) => {
    const [expression, setExpression] = useState<'blink' | 'gaze' | 'power' | 'idle'>('idle');
    const [gazePos, setGazePos] = useState({ x: 0, y: 0 });

    // Vida sutil, sin movimientos bruscos estructurales
    useEffect(() => {
        const interval = setInterval(() => {
            setExpression(current => {
                if (current !== 'idle') return current;
                const rand = Math.random();
                if (rand < 0.25) {
                    setTimeout(() => setExpression('idle'), 200);
                    return 'blink';
                } else if (rand < 0.45) {
                    setGazePos({
                        x: (Math.random() - 0.5) * 4,
                        y: (Math.random() - 0.5) * 4
                    });
                    setTimeout(() => setExpression('idle'), 800);
                    return 'gaze';
                } else if (rand < 0.60) {
                    setTimeout(() => setExpression('idle'), 1000);
                    return 'power';
                }
                return 'idle';
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const getDotAnimate = (index: number) => {
        if (expression === 'blink') {
            // El de en medio desaparece durante el parpadeo para simular "dos ojos"
            if (index === 1) return { opacity: 0, scale: 0, transition: { duration: 0.1 } };
            return { scaleY: 0.1, transition: { duration: 0.1 } };
        }
        if (expression === 'gaze') return { x: gazePos.x, y: gazePos.y, transition: { duration: 0.4 } };
        if (expression === 'power') return {
            opacity: [1, 0.4, 1],
            scale: [1, 1.15, 1],
            transition: { duration: 0.5, delay: index * 0.15, repeat: 1 }
        };
        return { scaleY: 1, scale: 1, x: 0, y: 0, opacity: 1 };
    };

    return (
        <div
            className={`relative flex items-center justify-center overflow-hidden ${className}`}
            title="Skylab Nexus"
        >
            <motion.svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full block"
            >
                <g>
                    {/* Main Bubble: Perfect complete circle with tail extending downwards. Stroke thinner */}
                    <path
                        d="M 38 78 A 35 35 0 1 1 62 78 L 40 98 Z"
                        stroke="currentColor"
                        strokeWidth="7.5"
                        strokeLinejoin="round"
                        className="text-white"
                    />
                    {/* Eye Dots (Blue Buttons) - True diagonal, smaller diameter to 4 */}
                    <motion.circle cx="37" cy="58" r="4" fill="#0EA5E9" animate={getDotAnimate(0)} />
                    <motion.circle cx="50" cy="45" r="4" fill="#0EA5E9" animate={getDotAnimate(1)} />
                    <motion.circle cx="63" cy="32" r="4" fill="#0EA5E9" animate={getDotAnimate(2)} />
                </g>
            </motion.svg>
        </div>
    );
};
