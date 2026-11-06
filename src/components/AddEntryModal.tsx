import React, { useState } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import {
  extractDriveFileId,
  GpsPhoto,
  parseSurveyCsv,
  SurveyRecord,
} from '../data/surveyData';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (newRecord: SurveyRecord) => void;
  onImportCsvRecords: (records: SurveyRecord[]) => void;
  nextRowNumber: number;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
  onImportCsvRecords,
  nextRowNumber,
}) => {
  const [mode, setMode] = useState<'single' | 'csv'>('single');
  const [tehsil, setTehsil] = useState<string>('Jhang');
  const [unionCouncil, setUnionCouncil] = useState<string>('31. MASSAN');
  const [chakMouza, setChakMouza] = useState<string>('');
  const [driveLinks, setDriveLinks] = useState<string>('');
  const [csvText, setCsvText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!chakMouza.trim()) {
      setErrorMessage('Please enter the Name of Chak / Mouza.');
      return;
    }

    const rawUrls = driveLinks
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rawUrls.length === 0) {
      setErrorMessage('Please provide at least one Google Drive picture link or file ID.');
      return;
    }

    const now = new Date();
    const datePart = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
    const timePart = now.toTimeString().split(' ')[0];
    const timestamp = `${datePart} ${timePart}`;
    const dateFormatted = now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    const recordId = `rec-custom-${Date.now()}`;
    const ucMatch = unionCouncil.trim().match(/^(\d+)\.\s*(.+)$/);
    const ucNumber = ucMatch ? ucMatch[1].padStart(2, '0') : '—';
    const ucName = ucMatch ? ucMatch[2].trim() : unionCouncil.trim();

    const photos: GpsPhoto[] = rawUrls.map((url, idx) => {
      const fileId = extractDriveFileId(url);
      return {
        id: `${recordId}-photo-${idx + 1}`,
        fileId,
        originalUrl: `https://drive.google.com/open?id=${fileId}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
        highResUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
        lh3Url: `https://lh3.googleusercontent.com/d/${fileId}=w1000`,
        ucViewUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
        embedPreviewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        recordId,
        indexInRecord: idx + 1,
        tehsil: tehsil.trim(),
        unionCouncil: unionCouncil.trim(),
        chakMouza: chakMouza.trim(),
        timestamp,
        dateFormatted,
      };
    });

    const newRecord: SurveyRecord = {
      id: recordId,
      rowNumber: nextRowNumber,
      timestamp,
      datePart,
      timePart,
      dateFormatted,
      sortTimestamp: now.getTime(),
      tehsil: tehsil.trim(),
      unionCouncilRaw: unionCouncil.trim(),
      ucNumber,
      ucName,
      chakMouzaRaw: chakMouza.trim(),
      chakMouzaClean: chakMouza.trim(),
      photos,
      photoCount: photos.length,
    };

    onAddRecord(newRecord);
    setChakMouza('');
    setDriveLinks('');
    onClose();
  };

  const handleCsvImport = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const parsed = parseSurveyCsv(csvText);
    if (parsed.length === 0) {
      setErrorMessage(
        'Could not parse valid rows. Ensure header row "Timestamp,Tehsil,Union Council,Name of Chak/Mouza,Attach GPS Pictures" is included.'
      );
      return;
    }
    onImportCsvRecords(parsed);
    setCsvText('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = String(evt.target?.result || '');
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Log Survey Entry or Import Google Sheet CSV"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-slate-200 rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-900">
            Add Field Survey Data
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Segmented Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-5 w-fit">
            <button
              type="button"
              onClick={() => {
                setMode('single');
                setErrorMessage('');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === 'single'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single Survey Entry
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('csv');
                setErrorMessage('');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === 'csv'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Import Google Sheet CSV
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {mode === 'single' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tehsil
                  </label>
                  <select
                    value={tehsil}
                    onChange={(e) => setTehsil(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="Jhang">Jhang</option>
                    <option value="18-Hazari">18-Hazari</option>
                    <option value="Ahmad Pur Sial">Ahmad Pur Sial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Union Council (Number & Name)
                  </label>
                  <input
                    type="text"
                    value={unionCouncil}
                    onChange={(e) => setUnionCouncil(e.target.value)}
                    placeholder="e.g. 31. MASSAN"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Name of Chak / Mouza
                </label>
                <input
                  type="text"
                  value={chakMouza}
                  onChange={(e) => setChakMouza(e.target.value)}
                  placeholder="e.g. Chak Said Behram"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Attach GPS Pictures (Comma or newline separated Google Drive URLs)
                </label>
                <textarea
                  rows={3}
                  value={driveLinks}
                  onChange={(e) => setDriveLinks(e.target.value)}
                  placeholder="https://drive.google.com/open?id=1SRqGyHWk4GB5sqkjm4FWCxdmY-Cntk-K"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save Entry
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCsvImport} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Upload CSV File or Paste Google Sheet Export
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:border-teal-700 hover:text-teal-700 cursor-pointer transition-colors mb-3">
                  <Upload className="w-4 h-4" />
                  <span>Choose .csv file from computer</span>
                  <input
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Timestamp,Tehsil,Union Council,Name of Chak/Mouza,Attach GPS Pictures&#10;10/31/2026 13:54:32,18-Hazari,83. UCH GUL IMAM,Burzi Wala Chak NO.11/3,https://drive.google.com/open?id=..."
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                >
                  Load CSV Dataset
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
