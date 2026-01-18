'use client';

import React from 'react';

export interface LoadingOverlayProps {
  spinner?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  spinnerSize?: number;
  spinnerColor?: string;
}

export function LoadingOverlay({
  spinner,
  className,
  style,
  spinnerSize = 48,
  spinnerColor = '#fff',
}: LoadingOverlayProps) {
  const defaultSpinner = (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 50 50"
      style={{
        animation: 'loading-spin 1s linear infinite',
      }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={spinnerColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="80, 200"
        strokeDashoffset="0"
      />
      <style>
        {`
          @keyframes loading-spin {
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </svg>
  );

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        pointerEvents: 'none',
        zIndex: 10,
        ...style,
      }}
    >
      {spinner ?? defaultSpinner}
    </div>
  );
}
