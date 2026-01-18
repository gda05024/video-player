import { useState, useCallback } from 'react';

export interface FileInfo {
  file: File;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface UseWebFileSystemOptions {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onError?: (error: Error) => void;
}

export interface UseWebFileSystemReturn {
  files: FileInfo[];
  isLoading: boolean;
  error: Error | null;
  selectFiles: () => Promise<FileInfo[]>;
  clearFiles: () => void;
  validateFile: (file: File) => boolean;
}

export function useWebFileSystem(
  options: UseWebFileSystemOptions = {}
): UseWebFileSystemReturn {
  const { accept, multiple = false, maxSize, onError } = options;

  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file size
      if (maxSize && file.size > maxSize) {
        const error = new Error(
          `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`
        );
        setError(error);
        onError?.(error);
        return false;
      }

      // Check file type
      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
        const fileType = file.type.toLowerCase();
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith('.')) {
            return fileExtension === type;
          }
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', '/'));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          const error = new Error(`File "${file.name}" is not an accepted file type`);
          setError(error);
          onError?.(error);
          return false;
        }
      }

      return true;
    },
    [accept, maxSize, onError]
  );

  const selectFiles = useCallback(async (): Promise<FileInfo[]> => {
    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = multiple;
      if (accept) {
        input.accept = accept;
      }

      input.onchange = () => {
        const selectedFiles = Array.from(input.files || []);
        const validFiles: FileInfo[] = [];

        for (const file of selectedFiles) {
          if (validateFile(file)) {
            validFiles.push({
              file,
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
            });
          }
        }

        setFiles(validFiles);
        setIsLoading(false);
        resolve(validFiles);
      };

      input.oncancel = () => {
        setIsLoading(false);
        resolve([]);
      };

      input.click();
    });
  }, [accept, multiple, validateFile]);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  return {
    files,
    isLoading,
    error,
    selectFiles,
    clearFiles,
    validateFile,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
