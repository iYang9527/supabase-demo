"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, Copy, Check, Loader2 } from "lucide-react";
import { uploadFile, getFileUrl } from "@/lib/supabase";

interface UploadedFile {
  id: string;
  name: string;
  path: string;
  url: string;
  copied?: boolean;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("请选择一个文件");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      const result = await uploadFile(file);
      const url = getFileUrl(result.path);

      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        path: result.path,
        url,
      };

      setUploadedFiles(prev => [...prev, newFile]);
      setFile(null);
      setSuccess(`文件 ${file.name} 上传成功！`);
    } catch (err) {
      setError("上传失败，请重试");
      console.error("Upload error:", err);
      // 3秒后自动清空错误消息
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url).then(() => {
      const updatedFiles = [...uploadedFiles];
      updatedFiles[index].copied = true;
      setUploadedFiles(updatedFiles);
      setTimeout(() => {
        const updatedFiles = [...uploadedFiles];
        delete updatedFiles[index].copied;
        setUploadedFiles(updatedFiles);
      }, 2000);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Upload className="h-8 w-8" />
          <h1 className="text-3xl font-bold">文件上传</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>上传文件</CardTitle>
            <CardDescription>选择文件并上传到 Supabase 存储</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">选择文件</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    disabled={isUploading}
                  >
                    <FileText className="h-4 w-4" />
                    {file ? file.name : "点击选择文件"}
                  </Button>
                </div>
              </div>
              
              {file && (
                <div className="text-sm text-muted-foreground">
                  已选择: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>错误</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="default">
                  <AlertTitle>成功</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isUploading} className="gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    上传文件
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>已上传文件</CardTitle>
              <CardDescription>点击链接复制到剪贴板</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {file.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleCopyUrl(file.url, index)}
                        className="h-8 w-8 p-0"
                      >
                        {file.copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a href={file.url} download={file.name}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
