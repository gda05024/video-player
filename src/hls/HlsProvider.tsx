import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { mp4ToHls, isHlsUrl, type Mp4ToHlsOptions } from './utils/mp4ToHls';

export interface HlsContextValue {
  originalUrl: string;
  hlsUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  isHls: boolean;
}

const HlsContext = createContext<HlsContextValue | null>(null);

export interface HlsProviderProps {
  children: ReactNode | ((context: HlsContextValue) => ReactNode);
  url: string;
  autoConvert?: boolean;
  convertOptions?: Mp4ToHlsOptions;
  onUrlConverted?: (hlsUrl: string) => void;
  onConvertError?: (error: Error) => void;
}

export function HlsProvider({
  children,
  url,
  autoConvert = true,
  convertOptions,
  onUrlConverted,
  onConvertError,
}: HlsProviderProps) {
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) {
      setHlsUrl(null);
      return;
    }

    // If already HLS or auto-convert is disabled, use original URL
    if (!autoConvert || isHlsUrl(url)) {
      setHlsUrl(url);
      return;
    }

    // Convert MP4 to HLS
    setIsLoading(true);
    setError(null);

    mp4ToHls(url, convertOptions)
      .then((convertedUrl) => {
        setHlsUrl(convertedUrl);
        setIsLoading(false);
        if (convertedUrl !== url) {
          onUrlConverted?.(convertedUrl);
        }
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsLoading(false);
        setHlsUrl(url); // Fallback to original URL
        onConvertError?.(error);
      });
  }, [url, autoConvert, convertOptions, onUrlConverted, onConvertError]);

  const contextValue: HlsContextValue = {
    originalUrl: url,
    hlsUrl,
    isLoading,
    error,
    isHls: hlsUrl ? isHlsUrl(hlsUrl) : false,
  };

  return (
    <HlsContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
    </HlsContext.Provider>
  );
}

export function useHlsContext(): HlsContextValue {
  const context = useContext(HlsContext);
  if (!context) {
    throw new Error('useHlsContext must be used within an HlsProvider');
  }
  return context;
}

export function useHlsContextOptional(): HlsContextValue | null {
  return useContext(HlsContext);
}
