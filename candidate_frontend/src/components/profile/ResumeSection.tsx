"use client";

import React, { useRef, useState } from 'react';
import type { Resume } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { candidateApi } from '@/apis/user/route';

interface ResumeSectionProps {
  data: Resume | null;
  onSave: (data: Resume | null) => void;
}

export default function ResumeSection({ data, onSave }: ResumeSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];

      if (file.type !== "application/pdf" && !file.name.match(/\.(pdf|doc|docx|rtf)$/i)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a supported file format.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      setIsUploading(true);
      try {
        const newResume = await candidateApi.uploadResume(formData);
        onSave(newResume);

        toast({
          title: "Resume Uploaded",
          description: `${file.name} is now your active resume.`,
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Could not upload resume to server.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await candidateApi.deleteResume();
      onSave(null);
      toast({ title: "Resume deleted" });
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    if (data?.file_url) {
      window.open(data.file_url, '_blank');
    }
  };

  return (
    <SectionCard
      title="Resume"
      description=""
    >
      <div className="space-y-6">
        {data && data.file_name && (
          <div className="flex items-start justify-between pb-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-foreground">{data.file_name}</h3>
              <p className="text-sm text-muted-foreground">
                Uploaded on {format(new Date(data.uploaded_at || new Date()), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex flex-col items-center justify-center w-full rounded-xl border border-dashed border-slate-300 py-10 text-center bg-white"
          )}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files)}
            accept=".pdf,.doc,.docx,.rtf"
            disabled={isUploading}
          />
          
          <Button 
            variant="outline" 
            className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-6 shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
            ) : (
              data?.file_name ? "Update resume" : "Update resume"
            )}
          </Button>
          <p className="text-[13px] text-muted-foreground mt-3">
            Supported Formats: doc, docx, rtf, pdf, upto 2 MB
          </p>
        </div>
      </div>
    </SectionCard>
  );
}