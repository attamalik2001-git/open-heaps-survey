import React, { useState } from 'react';
import { ExternalLink, Eye, MapPin, Image as ImageIcon } from 'lucide-react';
import { GpsPhoto } from '../data/surveyData';

interface DrivePhotoThumbProps {
  photo: GpsPhoto;
  onSelect: (photo: GpsPhoto) => void;
  aspectClass?: string;
  showCaption?: boolean;
}

export const DrivePhotoThumb: React.FC<DrivePhotoThumbProps> = ({
  photo,
  onSelect,
  aspectClass = 'aspect-[4/3]',
  showCaption = false,
}) => {
  // 0 = thumbnailUrl, 1 = lh3Url, 2 = ucViewUrl, 3 = fallback UI
  const [urlStage, setUrlStage] = useState<number>(0);
  const [loaded, setLoaded] = useState<boolean>(false);

  const currentSrc =
    urlStage === 0
      ? photo.thumbnailUrl
      : urlStage === 1
      ? photo.lh3Url
      : photo.ucViewUrl;

  const handleImageError = () => {
    if (urlStage < 2) {
      setUrlStage((prev) => prev + 1);
    } else {
      setUrlStage(3);
      setLoaded(true);
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-slate-100 border border-slate-200 rounded-lg overflow-hidden transition-colors hover:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700"
    >
      <div
        onClick={() => onSelect(photo)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(photo);
          }
        }}
        aria-label={`View GPS Photo ${photo.indexInRecord} for ${photo.chakMouza}`}
        className={`relative w-full ${aspectClass} bg-slate-100 overflow-hidden cursor-pointer select-none`}
      >
        {!loaded && urlStage < 3 && (
          <div className="absolute inset-0 bg-slate-200/70 animate-pulse flex flex-col items-center justify-center p-3 text-slate-400">
            <ImageIcon className="w-5 h-5 mb-1 opacity-60" />
            <span className="text-[11px] font-mono tabular-nums">
              Loading #{photo.indexInRecord}
            </span>
          </div>
        )}

        {urlStage < 3 ? (
          <img
            src={currentSrc}
            alt={`GPS Survey photo ${photo.indexInRecord} of ${photo.chakMouza} in ${photo.unionCouncil}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50/50 flex flex-col justify-between p-3 text-left">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
              <span>GPS #{photo.indexInRecord}</span>
              <span className="truncate max-w-[110px]" title={photo.fileId}>
                ID: {photo.fileId.slice(0, 8)}…
              </span>
            </div>
            <div className="my-auto py-1">
              <div className="flex items-center gap-1.5 text-teal-800 font-medium text-xs mb-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{photo.chakMouza}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {photo.unionCouncil}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/80 text-[11px] font-medium text-teal-700">
              <span>Click to preview Drive file</span>
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Measured contrast scrim on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-end p-2.5 pointer-events-none">
          <div className="flex items-center justify-between text-white text-xs">
            <span className="font-mono tabular-nums font-medium">
              Photo #{photo.indexInRecord}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-200">
              <Eye className="w-3.5 h-3.5" />
              Inspect
            </span>
          </div>
        </div>
      </div>

      {showCaption && (
        <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {photo.chakMouza}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {photo.tehsil} · {photo.unionCouncil}
            </p>
          </div>
          <a
            href={photo.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open original file in Google Drive"
            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
