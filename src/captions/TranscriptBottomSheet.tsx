'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from '@xstate/react';
import { usePlayerContext } from '../machine/context';
import {
  scriptsSelector,
  playedSecondsSelector,
  scriptsCurrentIndexSelector,
  durationSelector,
} from '../machine/selectors';
import { findCaptionIndex } from './utils/parseCaption';
import { formatTime } from '../utils/timeFormat';
import type { Caption } from '../machine/types';

export interface TranscriptBottomSheetProps {
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
  maxHeight?: number | string;
  showHandle?: boolean;
  title?: string;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function TranscriptBottomSheet({
  className,
  style,
  minHeight = 60,
  maxHeight = '50vh',
  showHandle = true,
  title = 'Transcript',
  defaultOpen = false,
  onOpenChange,
}: TranscriptBottomSheetProps) {
  const service = usePlayerContext();
  const { send } = service;

  const scripts = useSelector(service, scriptsSelector);
  const playedSeconds = useSelector(service, playedSecondsSelector);
  const currentIndex = useSelector(service, scriptsCurrentIndexSelector);
  const duration = useSelector(service, durationSelector);

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(minHeight);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Update script index
  useEffect(() => {
    const index = findCaptionIndex(scripts, playedSeconds);
    send({ type: 'UPDATE_SCRIPTS_INDEX', index });
  }, [scripts, playedSeconds, send]);

  // Auto scroll
  useEffect(() => {
    if (!isOpen || currentIndex < 0) return;

    const currentItem = itemRefs.current.get(currentIndex);
    if (currentItem && contentRef.current) {
      currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, isOpen]);

  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    setCurrentHeight(newState ? (typeof maxHeight === 'number' ? maxHeight : 300) : minHeight);
    onOpenChange?.(newState);
  }, [isOpen, maxHeight, minHeight, onOpenChange]);

  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
  }, []);

  const handleDrag = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDragging) return;

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const delta = dragStartY - clientY;
      const maxHeightNum = typeof maxHeight === 'number' ? maxHeight : window.innerHeight * 0.5;
      const newHeight = Math.max(minHeight, Math.min(maxHeightNum, currentHeight + delta));

      setCurrentHeight(newHeight);
      setDragStartY(clientY);
    },
    [isDragging, dragStartY, currentHeight, maxHeight, minHeight]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const maxHeightNum = typeof maxHeight === 'number' ? maxHeight : window.innerHeight * 0.5;
    const threshold = (maxHeightNum + minHeight) / 2;

    if (currentHeight > threshold) {
      setIsOpen(true);
      setCurrentHeight(maxHeightNum);
      onOpenChange?.(true);
    } else {
      setIsOpen(false);
      setCurrentHeight(minHeight);
      onOpenChange?.(false);
    }
  }, [currentHeight, maxHeight, minHeight, onOpenChange]);

  const handleItemClick = useCallback(
    (caption: Caption) => {
      if (duration > 0) {
        const seekTo = caption.startTime / duration;
        send({ type: 'SEEKING', seekTo });
      }
    },
    [duration, send]
  );

  const setItemRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      itemRefs.current.set(index, el);
    } else {
      itemRefs.current.delete(index);
    }
  }, []);

  if (scripts.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1a1a1a',
        color: '#fff',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        height: `${currentHeight}px`,
        transition: isDragging ? 'none' : 'height 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Handle */}
      <div
        style={{
          padding: '12px 16px',
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
      >
        {showHandle && (
          <div
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              margin: '0 auto 8px',
            }}
          />
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onClick={handleToggle}
        >
          <span style={{ fontWeight: 600 }}>{title}</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        {scripts.map((script, index) => (
          <div
            key={index}
            ref={setItemRef(index)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              backgroundColor:
                index === currentIndex ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            }}
            onClick={() => handleItemClick(script)}
          >
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginRight: '12px',
              }}
            >
              {formatTime(script.startTime)}
            </span>
            <span style={{ fontSize: '14px' }}>{script.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
