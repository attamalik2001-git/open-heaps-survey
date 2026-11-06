import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  FileImage,
  Globe,
} from 'lucide-react';
import { GpsPhoto } from '../data/surveyData';

interface PhotoLightboxModalProps {
  photo: GpsPhoto | null;
  photoList: GpsPhoto[];
  onClose: () => void;
  onNavigate: (photo: GpsPhoto) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photo,
  photoList,
  onClose,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<'image' | 'embed'>('image');
  const [urlStage, setUrlStage] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setUrlStage(0);
    setViewMode('image');
    setCopied(false);
  }, [photo?.id]);

  useEffect(() => {
    if (!photo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        const idx = photoList.findIndex((p) => p.id === photo.id);
        if (idx !== -1 && idx < photoList.length - 1) {
          onNavigate(photoList[idx + 1]);
        }
      } else if (e.key === 'ArrowLeft') {
        const idx = photoList.findIndex((p) => p.id === photo.id);
        if (idx > 0) {
          onNavigate(photoList[idx - 1]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, photoList, onClose, onNavigate]);

  if (!photo) return null;

  const currentIndex = photoList.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < photoList.length - 1;

  const currentImageSrc =
    urlStage === 0
      ? photo.highResUrl
      : urlStage === 1
      ? photo.lh3Url
      : photo.ucViewUrl;

  const handleImageError = () => {
    if (urlStage < 2) {
      setUrlStage((s) => s + 1);
    } else {
      // Automatically switch to Google Drive iframe preview if direct image URLs fail
      setViewMode('embed');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(photo.originalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex flex-col justify-between p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`GPS Photo Viewer - ${photo.chakMouza}`}
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="w-full max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
            <span>{photo.tehsil}</span>
            <span aria-hidden="true">·</span>
            <span>{photo.unionCouncil}</span>
            <span aria-hidden="true">·</span>
            <span>{photo.timestamp}</span>
          </div>
          <h3 className="text-base font-semibold text-white truncate mt-0.5">
            {photo.chakMouza} — GPS Picture #{photo.indexInRecord}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mode Switcher: Direct Image vs Drive Embed */}
          <div className="flex items-center bg-slate-800 p-1 rounded-md border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('image')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                viewMode === 'image'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileImage className="w-3.5 h-3.5" />
              Direct Image
            </button>
            <button
              type="button"
              onClick={() => setViewMode('embed')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                viewMode === 'embed'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Drive Preview
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied Link
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Link
              </>
            )}
          </button>

          <a
            href={photo.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-600 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Drive
          </a>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo viewer"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className="relative flex-1 w-full max-w-6xl mx-auto my-3 flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {hasPrev && (
          <button
            type="button"
            onClick={() => onNavigate(photoList[currentIndex - 1])}
            aria-label="Previous GPS photo"
            className="absolute left-3 z-20 p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="w-full h-full flex items-center justify-center bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden p-2">
          {viewMode === 'image' ? (
            <img
              src={currentImageSrc}
              alt={`GPS Survey photo ${photo.indexInRecord} of ${photo.chakMouza}`}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="max-w-full max-h-[72vh] object-contain rounded"
            />
          ) : (
            <iframe
              src={photo.embedPreviewUrl}
              title={`Google Drive Embed Preview - ${photo.chakMouza}`}
              className="w-full h-[72vh] rounded border-0 bg-slate-950"
              allow="autoplay"
            />
          )}
        </div>

        {hasNext && (
          <button
            type="button"
            onClick={() => onNavigate(photoList[currentIndex + 1])}
            aria-label="Next GPS photo"
            className="absolute right-3 z-20 p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Metadata Bar */}
      <div
        className="w-full max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 font-mono tabular-nums">
          <span>Google Drive File ID: {photo.fileId}</span>
          <span aria-hidden="true">·</span>
          <span>
            Viewer {currentIndex + 1} of {photoList.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Use Left / Right arrow keys to cycle photos</span>
          <button
            type="button"
            onClick={() =>
              setViewMode((prev) => (prev === 'image' ? 'embed' : 'image'))
            }
            className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            {viewMode === 'image'
              ? 'Switch to Drive Iframe Player'
              : 'Switch to Direct Image'}
          </button>
        </div>
      </div>
    </div>
  );
};
