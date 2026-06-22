'use client';

import React from 'react';

interface SynergIAMarkProps {
  className?: string;
  /** Si true, renderiza en versión clara (para fondos oscuros). Default: true */
  light?: boolean;
}

/**
 * Símbolo iA de Synerg-IA Automation.
 * El punto cyan sobre la "i" es el acento distintivo de la marca.
 * Usar en modo light=true (blanco + cyan) sobre fondos oscuros Skylab.
 */
export const SynergIAMark: React.FC<SynergIAMarkProps> = ({
  className = "w-8 h-8",
  light = true,
}) => {
  const letterColor = light ? "#FFFFFF" : "#0D1117";

  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Synerg-IA"
    >
      {/* Punto cyan — acento de la "i" y símbolo de la IA */}
      <circle cx="11" cy="10" r="5.5" fill="#00B4DB" />

      {/* Trazo vertical de la "i" */}
      <rect x="7.5" y="20" width="7" height="29" rx="3.5" fill={letterColor} />

      {/* Letra "A" — trazo izquierdo */}
      <path
        d="M 26 49 L 40 11"
        stroke={letterColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Letra "A" — trazo derecho */}
      <path
        d="M 54 49 L 40 11"
        stroke={letterColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Letra "A" — barra transversal */}
      <path
        d="M 31 34 L 49 34"
        stroke={letterColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Logotipo completo de Synerg-IA: símbolo iA + wordmark.
 * Para usar como firma de la empresa madre en la app Skylab.
 */
export const SynergIAWordmark: React.FC<{
  className?: string;
  light?: boolean;
  size?: 'xs' | 'sm' | 'md';
}> = ({ className = "", light = true, size = 'sm' }) => {
  const textColor = light ? "text-white" : "text-[#0D1117]";
  const sizeMap = {
    xs: { icon: "w-5 h-5", text: "text-[11px]", gap: "gap-1.5" },
    sm: { icon: "w-6 h-6", text: "text-[13px]", gap: "gap-2" },
    md: { icon: "w-8 h-8", text: "text-[16px]", gap: "gap-2.5" },
  };
  const s = sizeMap[size];

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <SynergIAMark className={s.icon} light={light} />
      <div className={`font-display font-semibold tracking-tight leading-none ${textColor} ${s.text}`}>
        <span>SYNERG</span>
        <span style={{ color: '#00B4DB' }}>-IA</span>
        <div className={`font-sans font-medium tracking-[0.15em] uppercase opacity-60 mt-0.5`}
          style={{ fontSize: '0.62em', letterSpacing: '0.18em' }}>
          Automation
        </div>
      </div>
    </div>
  );
};
