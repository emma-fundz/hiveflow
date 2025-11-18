// src/components/FileUploader.tsx
import React, { useState } from 'react';
import cocobase from '../lib/cocobaseClient';

export default function FileUploader({ onUploaded }: { onUploaded?: (url: string) => void }) {
  const [progress, setProgress] = useState<number | null>(null);

  const handleFile = async (file: File) => {
    try {
      // adapt to actual SDK: storage.upload(collectionOrBucket, file, options...)
      const uploadTask = await cocobase.storage.upload('public', file, {
        onProgress: (p: number) => setProgress(p),
      });
      // uploadTask.url or result location assumed:
      const url = uploadTask?.url ?? uploadTask.location ?? null;
      setProgress(null);
      if (onUploaded) onUploaded(url);
    } catch (err) {
      console.error('Upload failed', err);
      setProgress(null);
    }
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        aria-label="Upload file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {progress !== null && <div>Uploading... {Math.round(progress * 100)}%</div>}
    </div>
  );
}
