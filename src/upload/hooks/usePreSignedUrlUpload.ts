import { useState, useCallback, useRef } from 'react';
import axios, { type AxiosProgressEvent, type CancelTokenSource } from 'axios';

export interface PreSignedUrlResponse {
  url: string;
  fields?: Record<string, string>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UsePreSignedUrlUploadOptions {
  getPreSignedUrl: (file: File) => Promise<PreSignedUrlResponse>;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (response: unknown, file: File) => void;
  onError?: (error: Error, file: File) => void;
}

export interface UsePreSignedUrlUploadReturn {
  upload: (file: File) => Promise<void>;
  cancel: () => void;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: Error | null;
}

export function usePreSignedUrlUpload(
  options: UsePreSignedUrlUploadOptions
): UsePreSignedUrlUploadReturn {
  const { getPreSignedUrl, onProgress, onSuccess, onError } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setProgress(null);
      setError(null);

      try {
        // Get pre-signed URL
        const { url, fields } = await getPreSignedUrl(file);

        // Create cancel token
        cancelTokenRef.current = axios.CancelToken.source();

        // Prepare form data if fields are provided (S3-style upload)
        let data: FormData | File = file;
        let headers: Record<string, string> = {};

        if (fields) {
          const formData = new FormData();
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value);
          });
          formData.append('file', file);
          data = formData;
        } else {
          headers = {
            'Content-Type': file.type || 'application/octet-stream',
          };
        }

        // Upload file
        const response = await axios.put(url, data, {
          headers,
          cancelToken: cancelTokenRef.current.token,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const loaded = progressEvent.loaded;
            const total = progressEvent.total ?? file.size;
            const percent = Math.round((loaded / total) * 100);

            const uploadProgress: UploadProgress = { loaded, total, percent };
            setProgress(uploadProgress);
            onProgress?.(uploadProgress);
          },
        });

        setIsUploading(false);
        onSuccess?.(response.data, file);
      } catch (err) {
        setIsUploading(false);

        if (axios.isCancel(err)) {
          const cancelError = new Error('Upload cancelled');
          setError(cancelError);
          onError?.(cancelError, file);
          return;
        }

        const uploadError = err instanceof Error ? err : new Error(String(err));
        setError(uploadError);
        onError?.(uploadError, file);
      }
    },
    [getPreSignedUrl, onProgress, onSuccess, onError]
  );

  const cancel = useCallback(() => {
    cancelTokenRef.current?.cancel('Upload cancelled by user');
    setIsUploading(false);
  }, []);

  return {
    upload,
    cancel,
    isUploading,
    progress,
    error,
  };
}
