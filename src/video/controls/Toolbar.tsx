'use client';

import React, { type ReactNode } from 'react';

export interface ToolbarProps {
  leftSlot?: ReactNode;
  centerSlot?: ReactNode;
  rightSlot?: ReactNode;
  progressBar?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
}

export function Toolbar({
  leftSlot,
  centerSlot,
  rightSlot,
  progressBar,
  className,
  style,
  backgroundColor = 'linear-gradient(transparent, rgba(0, 0, 0, 0.9))',
}: ToolbarProps) {
  return (
    <div
      className={className}
      style={{
        background: backgroundColor,
        padding: '0 12px 8px',
        ...style,
      }}
    >
      {/* Progress bar - full width at top */}
      {progressBar && (
        <div style={{ margin: '0 -12px 4px', padding: '8px 12px 0' }}>
          {progressBar}
        </div>
      )}

      {/* Controls row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '40px',
        }}
      >
        {/* Left controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>{leftSlot}</div>

        {/* Center controls */}
        {centerSlot && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{centerSlot}</div>
        )}

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>{rightSlot}</div>
      </div>
    </div>
  );
}
