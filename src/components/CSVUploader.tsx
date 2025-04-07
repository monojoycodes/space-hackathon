
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface CSVUploaderProps {
  onUpload: (file: File) => Promise<void>;
  label: string;
  accept?: string;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ 
  onUpload, 
  label, 
  accept = ".csv" 
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await onUpload(file);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-lg hover:border-space-blue transition-colors">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      <Upload className="h-10 w-10 text-gray-400 mb-3" />
      <p className="text-gray-400 mb-3 text-center">{label}</p>
      
      <Button
        type="button"
        onClick={handleButtonClick}
        className="bg-space-blue text-white hover:bg-blue-600"
      >
        Choose File
      </Button>
    </div>
  );
};

export default CSVUploader;
