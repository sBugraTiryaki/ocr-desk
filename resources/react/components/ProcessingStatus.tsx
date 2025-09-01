import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  message?: string;
  results?: any;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  status,
  progress,
  message,
  results
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Processing Document...';
      case 'success':
        return 'Processing Complete';
      case 'error':
        return 'Processing Failed';
      default:
        return 'Ready to Process';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-primary';
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (status === 'idle') {
    return null;
  }

  return (
    <Card className="bg-gradient-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          <span className={getStatusColor()}>{getStatusText()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'processing' && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {message || `Processing... ${progress}%`}
            </p>
          </div>
        )}

        {status === 'error' && message && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">Error Details:</p>
            <p className="text-sm text-destructive/80 mt-1">{message}</p>
          </div>
        )}

        {status === 'success' && results && (
          <div className="space-y-3">
            <div className="p-3 bg-success/10 border border-success/20 rounded-md">
              <p className="text-sm text-success font-medium">
                Document processed successfully!
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-card-foreground mb-3">Extracted Text:</h4>
              <div className="bg-card border rounded-md p-3 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-card-foreground font-mono">
                  {typeof results === 'string' 
                    ? results 
                    : results.text || JSON.stringify(results, null, 2)
                  }
                </pre>
              </div>
            </div>
            
            {results.processingTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing Time:</span>
                <span className="font-medium text-card-foreground">
                  {results.processingTime}ms
                </span>
              </div>
            )}
            
            {results.confidence && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence Level:</span>
                <span className={cn(
                  "font-medium",
                  results.confidence > 0.8 ? "text-success" :
                  results.confidence > 0.6 ? "text-warning" : "text-destructive"
                )}>
                  {Math.round(results.confidence * 100)}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};