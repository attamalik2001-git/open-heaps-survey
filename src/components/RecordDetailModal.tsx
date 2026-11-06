import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Images,
  Calendar,
  MapPin,
} from 'lucide-react';
import { GpsPhoto, SurveyRecord } from '../data/surveyData';
import { DrivePhotoThumb } from './DrivePhotoThumb';

interface RecordDetailModalProps {
  record: SurveyRecord | null;
  onClose: () => void;
  onSelectPhoto: (photo: GpsPhoto, contextPhotos: GpsPhoto[]) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
  onSelectPhoto,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);

  if (!record) return null;

  const handleCopyAllLinks = async () => {
    try {
      const text = record.photos.map((p) => p.originalUrl).join('\n');
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Survey Record Details - ${record.chakMouzaClean}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
              <span>Entry #{String(record.rowNumber).padStart(2, '0')}</span>
              <span aria-hidden="true">·</span>
              <span>{record.tehsil} Tehsil</span>
              <span aria-hidden="true">·</span>
              <span>UC {record.unionCouncilRaw}</span>
              <span aria-hidden="true">·</span>
              <span>{record.timestamp}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {record.chakMouzaClean}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyAllLinks}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied {record.photoCount} Links
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Drive Links
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close record details"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Structured Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-slate-200 text-sm">
            <div>
              <p className="text-xs text-slate-500">Tehsil Administration</p>
              <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                {record.tehsil}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Union Council</p>
              <p className="font-semibold text-slate-900 mt-0.5 font-mono tabular-nums">
                {record.unionCouncilRaw}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Survey Timestamp</p>
              <p className="font-semibold text-slate-900 mt-0.5 font-mono tabular-nums flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {record.dateFormatted} ({record.timePart})
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Attached GPS Pictures</p>
              <p className="font-semibold text-slate-900 mt-0.5 font-mono tabular-nums flex items-center gap-1.5">
                <Images className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                {record.photoCount} {record.photoCount === 1 ? 'Photo' : 'Photos'}
              </p>
            </div>
          </div>

          {/* Attached GPS Pictures Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Attached GPS Survey Pictures ({record.photoCount})
              </h3>
              <span className="text-xs text-slate-500">
                Click any photo to open high-resolution viewer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {record.photos.map((photo) => (
                <div key={photo.id} className="flex flex-col gap-1.5">
                  <DrivePhotoThumb
                    photo={photo}
                    onSelect={(p) => onSelectPhoto(p, record.photos)}
                    aspectClass="aspect-[4/3]"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500 px-0.5 font-mono tabular-nums">
                    <span>
                      Photo #{photo.indexInRecord} · {photo.fileId.slice(0, 10)}…
                    </span>
                    <a
                      href={photo.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:underline inline-flex items-center gap-1 font-sans font-medium"
                    >
                      Drive
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
