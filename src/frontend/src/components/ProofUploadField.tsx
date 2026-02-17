import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, FileText } from 'lucide-react';
import { ExternalBlob } from '../backend';

interface ProofUploadFieldProps {
  value: ExternalBlob | null;
  onChange: (blob: ExternalBlob | null) => void;
  error?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

export default function ProofUploadField({ value, onChange, error }: ProofUploadFieldProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      setFileName(file.name);
      onChange(blob);
    } catch (err) {
      setFileError('Failed to process file');
      console.error(err);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setFileName('');
    setUploadProgress(0);
    setFileError('');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="proof">Proof (Optional)</Label>
      <p className="text-xs text-muted-foreground">
        Upload supporting evidence (JPG, PNG, or PDF, max 5MB)
      </p>
      
      {!value ? (
        <div className="flex items-center gap-2">
          <Input
            id="proof"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm flex-1 truncate">{fileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Progress value={uploadProgress} className="h-2" />
          )}
        </div>
      )}

      {(fileError || error) && (
        <p className="text-sm text-destructive">{fileError || error}</p>
      )}
    </div>
  );
}
