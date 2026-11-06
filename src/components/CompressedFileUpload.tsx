import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCheck,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { compressUploadedFile, CompressedFileResult, MAX_STORAGE_LIMIT_BYTES, formatBytes } from '../utils/fileCompression';

interface CompressedFileUploadProps {
  onFileCompressed: (result: CompressedFileResult) => void;
  onFileRemoved?: () => void;
  label?: string;
  helperText?: string;
  accept?: string;
  currentPreviewUrl?: string;
  currentFileName?: string;
  compact?: boolean;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

export const CompressedFileUpload: React.FC<CompressedFileUploadProps> = ({
  onFileCompressed,
  onFileRemoved,
  label = 'Upload Image or PDF Document',
  helperText = 'Files are automatically compressed to less than 2MB to optimize storage space.',
  accept = 'image/*,.pdf',
  currentPreviewUrl,
  currentFileName,
  compact = false,
  required = false,
  disabled = false,
  id = 'compressed-file-upload',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressedFileResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setIsCompressing(true);
    setErrorMessage(null);

    try {
      const result = await compressUploadedFile(file);

      if (result.compressedSizeBytes > MAX_STORAGE_LIMIT_BYTES) {
        setErrorMessage(
          `Compressed file is ${result.compressedSizeFormatted}, which exceeds the 2MB limit. Please choose a smaller file.`
        );
        return;
      }

      setCompressionResult(result);
      onFileCompressed(result);
    } catch (err: any) {
      console.error('File compression error:', err);
      setErrorMessage(err?.message || 'Failed to process and compress the uploaded file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isCompressing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isCompressing) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompressionResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileRemoved) {
      onFileRemoved();
    }
  };

  const activeResult = compressionResult;
  const hasExistingPreview = !activeResult && Boolean(currentPreviewUrl);
  const isImageFile =
    activeResult?.type.startsWith('image/') ||
    (hasExistingPreview && !currentFileName?.toLowerCase().endsWith('.pdf'));

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-bold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>&lt; 2MB Auto-Compressed</span>
          </span>
        </div>
      )}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled || isCompressing}
        className="hidden"
      />

      {/* File Upload / Compression State Box */}
      {isCompressing ? (
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-900 flex items-center space-x-3.5 animate-pulse">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-indigo-950">
              Compressing & Optimizing File to &lt; 2MB...
            </span>
            <span className="text-indigo-700 text-[11px]">
              Downsampling resolution and compressing data streams for high-speed storage.
            </span>
          </div>
        </div>
      ) : activeResult ? (
        /* Result Active View */
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-slate-900 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              {isImageFile && activeResult.dataUrl ? (
                <img
                  src={activeResult.dataUrl}
                  alt="Uploaded thumbnail"
                  className="w-12 h-12 rounded-lg object-cover border border-emerald-300 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-800">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[200px] sm:max-w-[280px]">
                    {activeResult.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <div className="flex items-center flex-wrap gap-1.5 mt-1">
                  <span className="text-[11px] font-bold text-emerald-700 font-mono">
                    {activeResult.compressedSizeFormatted}
                  </span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[10px] text-slate-500 line-through">
                    {activeResult.originalSizeFormatted}
                  </span>
                  {activeResult.savingsPercentage > 0 && (
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Saved {activeResult.savingsPercentage}%
                    </span>
                  )}
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-200/60 text-emerald-900 text-[10px] font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>&lt; 2MB Verified</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : hasExistingPreview ? (
        /* Existing Preview View */
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            {isImageFile ? (
              <img
                src={currentPreviewUrl}
                alt="Current file preview"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-700">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 text-xs">
              <span className="font-semibold text-slate-800 block truncate">
                {currentFileName || 'Attached File'}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Compressed to &lt; 2MB</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition shrink-0"
          >
            Change
          </button>
        </div>
      ) : (
        /* Dropzone / Click to Upload */
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl transition cursor-pointer text-center ${
            compact ? 'p-3.5' : 'p-5'
          } ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-white'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 hover:text-emerald-700">
                Click to upload
              </span>{' '}
              <span className="text-slate-500">or drag and drop</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Images (PNG, JPG, WebP) or PDF documents • Auto-compressed to &lt; 2MB
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="flex items-center space-x-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Helper text */}
      {!errorMessage && helperText && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
};
