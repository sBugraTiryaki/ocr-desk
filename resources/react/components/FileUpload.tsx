import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileImage, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onFileRemove: () => void;
  isProcessing?: boolean;
}

const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/webp': ['.webp']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  onFileRemove,
  isProcessing = false
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF, BMP, or WebP)",
          variant: "destructive",
        });
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
      toast({
        title: "File selected",
        description: `${acceptedFiles[0].name} ready for processing`,
      });
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    disabled: isProcessing
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    return filename.slice(filename.lastIndexOf('.'));
  };

  if (selectedFile) {
    return (
      <Card className="bg-gradient-card border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-primary rounded-lg">
                <FileImage className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {getFileExtension(selectedFile.name).toUpperCase()}
                </p>
              </div>
            </div>
            {!isProcessing && (
              <Button
                variant="outline"
                size="sm"
                onClick={onFileRemove}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-2 border-dashed transition-colors duration-200",
      isDragActive || dragActive 
        ? "border-primary bg-accent" 
        : "border-border hover:border-primary/50",
      isProcessing && "opacity-50 cursor-not-allowed"
    )}>
      <CardContent className="p-8">
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <div className={cn(
              "p-4 rounded-full mb-4 transition-colors",
              isDragActive || dragActive 
                ? "bg-primary/10" 
                : "bg-muted"
            )}>
              <Upload className={cn(
                "h-8 w-8",
                isDragActive || dragActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )} />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? "Drop your file here" : "Upload Document"}
            </h3>
            
            <p className="text-muted-foreground mb-4 max-w-sm">
              Drag and drop your image file here, or click to browse
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Button variant="outline" size="sm" disabled={isProcessing}>
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, GIF, BMP, WebP (max 10MB)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};