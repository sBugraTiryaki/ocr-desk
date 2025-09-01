import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from './FileUpload';
import { ProcessingStatus } from './ProcessingStatus';
import { Separator } from '@/components/ui/separator';
import { FileText, Zap, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WEBHOOK_URL = 'http://localhost:5678/webhook-test/75a85193-dcf4-4467-bd8c-bc1a64473f41';

export const OCRProcessor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setProcessingStatus('idle');
    setResults(null);
    setErrorMessage('');
    setProgress(0);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setProcessingStatus('idle');
    setResults(null);
    setErrorMessage('');
    setProgress(0);
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 90) {
        setProgress(90);
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
      }
    }, 500);
    return interval;
  };

  const handleProcessDocument = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to process",
        variant: "destructive",
      });
      return;
    }

    setProcessingStatus('processing');
    setProgress(0);
    setResults(null);
    setErrorMessage('');

    // Start progress simulation
    const progressInterval = simulateProgress();

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('filename', selectedFile.name);

      // Send to n8n webhook
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check content type to determine how to parse response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        // Handle array response
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        }
      } else {
        // Handle plain text response
        const textResponse = await response.text();
        try {
          // Try to parse as JSON first
          const parsedData = JSON.parse(textResponse);
          data = Array.isArray(parsedData) && parsedData.length > 0 ? parsedData[0] : parsedData;
        } catch {
          // If not JSON, treat as plain text result
          data = {
            success: true,
            text: textResponse,
            processingTime: null
          };
        }
      }
      
      // Handle error cases
      if (data.success === false) {
        throw new Error(data.error || 'Processing failed');
      }
      
      setProcessingStatus('success');
      setResults(data);
      
      toast({
        title: "Processing complete",
        description: "Document has been successfully processed",
      });

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Processing error:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      setProcessingStatus('error');
      
      toast({
        title: "Processing failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleDownloadResults = () => {
    if (!results) return;

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-results-${selectedFile?.name || 'document'}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "OCR results have been downloaded",
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setProcessingStatus('idle');
    setResults(null);
    setErrorMessage('');
    setProgress(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              OCR Document Processor
            </CardTitle>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your documents and extract text with professional-grade OCR technology. 
            Supports multiple image formats with high accuracy results.
          </p>
        </CardHeader>
      </Card>

      {/* File Upload Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-card-foreground">1. Select Document</h2>
        <FileUpload
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          onFileRemove={handleFileRemove}
          isProcessing={processingStatus === 'processing'}
        />
      </div>

      <Separator className="my-6" />

      {/* Processing Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-card-foreground">2. Process Document</h2>
          <div className="flex gap-2">
            {results && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadResults}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Results
              </Button>
            )}
            {(results || processingStatus === 'error') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleProcessDocument}
            disabled={!selectedFile || processingStatus === 'processing'}
            className="flex-1 sm:flex-initial bg-gradient-primary hover:opacity-90 gap-2 py-6"
            size="lg"
          >
            <Zap className="h-5 w-5" />
            {processingStatus === 'processing' ? 'Processing...' : 'Process Document'}
          </Button>
          
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Ready to process: {selectedFile.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {processingStatus !== 'idle' && (
        <>
          <Separator className="my-6" />
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-card-foreground">3. Results</h2>
            <ProcessingStatus
              status={processingStatus}
              progress={progress}
              message={errorMessage}
              results={results}
            />
          </div>
        </>
      )}
    </div>
  );
};