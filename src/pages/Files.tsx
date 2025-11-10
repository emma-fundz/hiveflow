import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Image, FileText, Download, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'other';
  size: string;
  uploadedAt: string;
  url: string;
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Community Guidelines.pdf',
    type: 'document',
    size: '2.4 MB',
    uploadedAt: '2024-01-15',
    url: '#'
  },
  {
    id: '2',
    name: 'Event Photos 2024.zip',
    type: 'other',
    size: '45.8 MB',
    uploadedAt: '2024-01-20',
    url: '#'
  },
  {
    id: '3',
    name: 'Meeting Notes.docx',
    type: 'document',
    size: '1.2 MB',
    uploadedAt: '2024-02-01',
    url: '#'
  },
  {
    id: '4',
    name: 'Team Photo.jpg',
    type: 'image',
    size: '3.5 MB',
    uploadedAt: '2024-02-05',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200'
  },
];

const Files = () => {
  const [files, setFiles] = useState<FileItem[]>(mockFiles);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : file.type.includes('document') ? 'document' : 'other',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        url: URL.createObjectURL(file)
      };
      setFiles(prev => [newFile, ...prev]);
    });
    toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return Image;
      case 'document':
        return FileText;
      default:
        return File;
    }
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    toast.success('File deleted');
  };

  const handleDownload = (file: FileItem) => {
    toast.success(`Downloading ${file.name}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Files</h1>
        <p className="text-muted-foreground">Upload and manage community files</p>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card
          {...getRootProps()}
          className={`glass-card p-12 text-center cursor-pointer transition-all ${
            isDragActive ? 'neon-glow-cyan' : 'hover:bg-muted/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-indigo flex items-center justify-center">
              <Upload className="w-8 h-8 text-background" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {isDragActive ? 'Drop files here' : 'Upload Files'}
              </h3>
              <p className="text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
            </div>
            <Button className="bg-gradient-to-r from-neon-cyan to-neon-indigo hover:opacity-90">
              Select Files
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {files.map((file, index) => {
          const IconComponent = getFileIcon(file.type);

          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card p-6 hover:neon-glow-cyan transition-shadow group">
                {/* Preview */}
                <div className="mb-4 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconComponent className="w-12 h-12 text-primary" />
                  )}
                </div>

                {/* File Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{file.size}</span>
                    <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(file.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Files;
