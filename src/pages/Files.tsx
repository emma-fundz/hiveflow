import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Image, FileText, Download, Trash2, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import db from '@/lib/cocobase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'other';
  size: string;
  uploadedAt: string;
  url: string;
}

interface FileData {
  name: string;
  fileType: string;
  sizeBytes: number;
  uploadedAt: string;
  ownerId: string;
  uploadedBy?: string;
  url: string;
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

const Files = () => {
  const { user } = useAuth();
  const workspaceId = (user as any)?.workspaceId ?? (user as any)?.id;
  const userRole = (user as any)?.role as string | undefined;
  const isOwner = !(user as any)?.workspaceId;
  const isAdmin = userRole === 'Admin' || isOwner;
  const queryClient = useQueryClient();

  const { data: fileDocs = [], isLoading } = useQuery({
    queryKey: ['files', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const docs = await db.listDocuments<FileData>('files', {
        filters: { ownerId: workspaceId },
        sort: 'created_at',
        order: 'desc',
      });
      return docs as any[];
    },
    enabled: !!workspaceId,
  });

  const files: FileItem[] = fileDocs.map((doc: any) => {
    const data = doc.data || {};
    const sizeMb = data.sizeBytes ? data.sizeBytes / (1024 * 1024) : 0;
    const type: 'image' | 'document' | 'other' = data.fileType?.startsWith('image/')
      ? 'image'
      : data.fileType?.includes('document')
      ? 'document'
      : 'other';

    return {
      id: doc.id,
      name: data.name || 'File',
      type,
      size: sizeMb ? `${sizeMb.toFixed(2)} MB` : '',
      uploadedAt: data.uploadedAt || doc.created_at,
      url: data.url,
    };
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!workspaceId) throw new Error('Not authenticated');
      if (!isAdmin) throw new Error('Not authorized to upload files');
      const now = new Date().toISOString();
      const dataUrl = await readFileAsDataUrl(file);
      const data: FileData = {
        name: file.name,
        fileType: file.type || 'other',
        sizeBytes: file.size,
        uploadedAt: now,
        ownerId: workspaceId,
        uploadedBy: (user as any)?.id,
        url: dataUrl,
      };
      return db.createDocument<FileData>('files', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', workspaceId] });
    },
    onError: (err: any) => {
      console.log('FILES UPLOAD ERROR:', err);
      toast.error('Failed to upload files');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAdmin) throw new Error('Not authorized to delete files');
      await db.deleteDocument('files', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', workspaceId] });
      toast.success('File deleted');
    },
    onError: (err: any) => {
      console.log('FILES DELETE ERROR:', err);
      toast.error('Failed to delete file');
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!isAdmin) {
        toast.error('You do not have permission to upload files');
        return;
      }
      acceptedFiles.forEach((file) => uploadMutation.mutate(file));
      if (acceptedFiles.length) {
        toast.success(`${acceptedFiles.length} file(s) queued for upload`);
      }
    },
    [isAdmin, uploadMutation],
  );

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
    deleteMutation.mutate(id);
  };

  const handleDownload = (file: FileItem) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error('Failed to download file');
    }
  };

  const handleCopyLink = async (file: FileItem) => {
    try {
      await navigator.clipboard.writeText(file.url);
      toast.success('File link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Files</h1>
        <p className="text-muted-foreground">Upload and manage community files</p>
      </div>

      {/* Upload Area (Admins only) */}
      {isAdmin && (
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
      )}

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
                    onClick={() => handleCopyLink(file)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Link
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
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
