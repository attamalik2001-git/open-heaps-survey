import React, { useMemo, useState } from 'react';
import {
  X,
  FileText,
  Presentation,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Loader2,
  Layers,
  ListOrdered,
  ExternalLink,
} from 'lucide-react';
import { SurveyRecord } from '../data/surveyData';
import {
  buildChakMouzaGroups,
  ExportFormat,
  ExportProgress,
  exportReportAsExcel,
  exportReportAsPdf,
  exportReportAsPptx,
  GroupingMode,
} from '../utils/reportExporter';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRecords: SurveyRecord[];
  filteredRecords: SurveyRecord[];
  initialFormat?: ExportFormat | null;
  onTriggerBrowserPrint: (
    recordsToPrint: SurveyRecord[],
    groupingMode: GroupingMode
  ) => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  allRecords,
  filteredRecords,
  onTriggerBrowserPrint,
}) => {
  const [scope, setScope] = useState<'all' | 'filtered'>('all');
  const [groupingMode, setGroupingMode] =
    useState<GroupingMode>('consolidated-chak');
  const [activeExport, setActiveExport] = useState<ExportFormat | null>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [lastCompletedFormat, setLastCompletedFormat] = useState<string | null>(
    null
  );

  const targetRecords = scope === 'all' ? allRecords : filteredRecords;

  const groups = useMemo(
    () => buildChakMouzaGroups(targetRecords, groupingMode),
    [targetRecords, groupingMode]
  );

  const totalPictures = useMemo(
    () => groups.reduce((acc, g) => acc + g.photos.length, 0),
    [groups]
  );

  const uniqueTehsils = useMemo(
    () => new Set(groups.map((g) => g.tehsil)).size,
    [groups]
  );

  const uniqueUcs = useMemo(
    () => new Set(groups.map((g) => g.unionCouncilFull)).size,
    [groups]
  );

  if (!isOpen) return null;

  const handleRunExport = async (format: ExportFormat) => {
    if (activeExport) return;
    setActiveExport(format);
    setLastCompletedFormat(null);

    try {
      if (format === 'pdf') {
        await exportReportAsPdf(targetRecords, groupingMode, setProgress);
        setLastCompletedFormat('PDF Report (.pdf)');
      } else if (format === 'pptx') {
        await exportReportAsPptx(targetRecords, groupingMode, setProgress);
        setLastCompletedFormat('PowerPoint Presentation (.pptx)');
      } else if (format === 'xlsx') {
        await exportReportAsExcel(targetRecords, groupingMode, setProgress);
        setLastCompletedFormat('MS Excel Workbook (.xlsx)');
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setActiveExport(null);
    }
  };

  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:hidden"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-300 block">
              Chak / Mouza Wise Complete Report Exporter
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              Export Whole Report with Tehsil, Union Council, Chak/Mouza &amp; All Pictures
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Scope & Organization Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scope Selection */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                1. Report Dataset Scope
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    scope === 'all'
                      ? 'bg-white border-teal-700 ring-2 ring-teal-700/20 text-slate-900'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">
                    Whole Report (All Data)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {allRecords.length} submissions ·{' '}
                    {allRecords.reduce((a, r) => a + r.photoCount, 0)} pictures
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('filtered')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    scope === 'filtered'
                      ? 'bg-white border-teal-700 ring-2 ring-teal-700/20 text-slate-900'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">
                    Current Filtered View
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {filteredRecords.length} submissions ·{' '}
                    {filteredRecords.reduce((a, r) => a + r.photoCount, 0)}{' '}
                    pictures
                  </div>
                </button>
              </div>
            </div>

            {/* Grouping Selection */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                2. Chak / Mouza Grouping Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGroupingMode('consolidated-chak')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    groupingMode === 'consolidated-chak'
                      ? 'bg-white border-teal-700 ring-2 ring-teal-700/20 text-slate-900'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-700" />
                    Chak / Mouza Wise
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Merges all pictures per Chak/Mouza under its Tehsil &amp; UC
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGroupingMode('by-submission')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    groupingMode === 'by-submission'
                      ? 'bg-white border-teal-700 ring-2 ring-teal-700/20 text-slate-900'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 inline-flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-teal-700" />
                    By Submission Row
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Sorted by Tehsil → UC → Chak/Mouza ({targetRecords.length}{' '}
                    rows)
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Summary KPI Bar of what will be exported */}
          <div className="bg-teal-950 text-white rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] font-mono text-teal-300 uppercase">
                Tehsils Included
              </span>
              <p className="text-xl font-bold font-mono mt-0.5">
                {uniqueTehsils} Tehsils
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-teal-300 uppercase">
                Union Councils
              </span>
              <p className="text-xl font-bold font-mono mt-0.5">
                {uniqueUcs} UCs
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-teal-300 uppercase">
                Chak / Mouza Sections
              </span>
              <p className="text-xl font-bold font-mono mt-0.5">
                {groups.length} Chaks/Mouzas
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-teal-300 uppercase">
                Embedded GPS Pictures
              </span>
              <p className="text-xl font-bold font-mono text-teal-300 mt-0.5">
                {totalPictures} All Pictures
              </p>
            </div>
          </div>

          {/* Step 2: Export Format Cards (PDF, PowerPoint, MS Excel, Print View) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              3. Select Export File Format (Includes Tehsil, Union Council Name, Chak/Mouza &amp; All Pictures)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Format 1: PDF File */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-white hover:border-rose-300 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="p-2 rounded-lg bg-rose-50 text-rose-700">
                      <FileText className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      .PDF REPORT
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    PDF Document Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    A4 landscape report with executive index table followed by dedicated Chak/Mouza pages containing Tehsil, Union Council Name, and all pictures.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    disabled={activeExport !== null}
                    onClick={() => handleRunExport('pdf')}
                    className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {activeExport === 'pdf' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Download PDF (.pdf)
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={activeExport !== null}
                    onClick={() => {
                      onTriggerBrowserPrint(targetRecords, groupingMode);
                    }}
                    className="w-full py-1.5 px-3 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Save Live Drive PDF
                  </button>
                </div>
              </div>

              {/* Format 2: PowerPoint Presentation (.pptx) */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-white hover:border-amber-300 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                      <Presentation className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      .PPTX SLIDES
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    PowerPoint Presentation
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Widescreen 16:9 slide deck organized Chak/Mouza-wise with Tehsil &amp; Union Council header banners, metadata sidebar, and all pictures across slides.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={activeExport !== null}
                    onClick={() => handleRunExport('pptx')}
                    className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {activeExport === 'pptx' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Building Slides...
                      </>
                    ) : (
                      <>
                        <Presentation className="w-4 h-4" />
                        Download PowerPoint (.pptx)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Format 3: MS Excel Workbook (.xlsx) */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-white hover:border-emerald-300 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <FileSpreadsheet className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      .XLSX WORKBOOK
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    MS Excel File (.xlsx)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Multi-sheet Excel workbook with Tehsil, Union Council Name, Chak/Mouza columns and all GPS pictures embedded directly inside each Chak/Mouza row.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={activeExport !== null}
                    onClick={() => handleRunExport('xlsx')}
                    className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {activeExport === 'xlsx' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Building Excel...
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-4 h-4" />
                        Download MS Excel (.xlsx)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Export Progress Indicator */}
          {activeExport && progress && (
            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  {progress.message}
                </span>
                <span className="font-mono text-teal-300">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Completion Banner */}
          {!activeExport && lastCompletedFormat && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Successfully exported <strong>{lastCompletedFormat}</strong>{' '}
                  with {groups.length} Chak/Mouza sections and all{' '}
                  {totalPictures} GPS pictures!
                </span>
              </div>
            </div>
          )}

          {/* Chak / Mouza Wise Structure Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Preview: Chak / Mouza Wise Report Structure ({groups.length}{' '}
                Chaks/Mouzas · {totalPictures} Pictures)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Sorted by Tehsil → Union Council → Chak/Mouza
              </span>
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-200 text-xs">
              {groups.map((g) => (
                <div
                  key={g.groupKey}
                  className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <span>#{String(g.index).padStart(2, '0')}</span>
                      <span>·</span>
                      <span className="font-sans font-semibold text-slate-700">
                        Tehsil: {g.tehsil}
                      </span>
                      <span>·</span>
                      <span className="font-sans text-slate-700">
                        UC: {g.unionCouncilFull}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm truncate">
                      Chak / Mouza: {g.chakMouza}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {g.photos.slice(0, 5).map((p) => (
                        <a
                          key={p.id}
                          href={p.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Picture #${p.indexInRecord} (${g.chakMouza})`}
                          className="w-8 h-8 rounded border border-white bg-slate-200 overflow-hidden inline-block shrink-0"
                        >
                          <img
                            src={p.thumbnailUrl}
                            alt={g.chakMouza}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                    <span className="font-mono font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                      {g.photos.length}{' '}
                      {g.photos.length === 1 ? 'Picture' : 'Pictures'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Every exported file includes Tehsil, Union Council Name, Chak/Mouza &amp; all pictures with clickable Google Drive links.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Full-page Chak/Mouza-wise Visual Report Section used both as an interactive
 * "Chak/Mouza Report" tab and for Browser Native Print-to-PDF (which renders
 * cookie-authenticated Google Drive <img> tags directly).
 */
export const ChakMouzaFullReportView: React.FC<{
  records: SurveyRecord[];
  groupingMode: GroupingMode;
  onGroupingModeChange: (mode: GroupingMode) => void;
  onOpenExportModal: () => void;
  onQuickExport: (format: ExportFormat) => void;
  activeQuickFormat: ExportFormat | null;
  quickProgress: ExportProgress | null;
}> = ({
  records,
  groupingMode,
  onGroupingModeChange,
  onOpenExportModal,
  onQuickExport,
  activeQuickFormat,
  quickProgress,
}) => {
  const groups = useMemo(
    () => buildChakMouzaGroups(records, groupingMode),
    [records, groupingMode]
  );

  const totalPhotos = useMemo(
    () => groups.reduce((acc, g) => acc + g.photos.length, 0),
    [groups]
  );

  return (
    <section className="space-y-6">
      {/* Control Banner (Hidden during print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-teal-700 font-semibold">
            Complete Chak / Mouza Wise Picture Report
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Tehsil, Union Council Name &amp; Chak/Mouza Report ({groups.length}{' '}
            Chaks/Mouzas · {totalPhotos} Pictures)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Displays all pictures for every Chak/Mouza without truncation. Export below as PDF, PowerPoint (.pptx), or MS Excel (.xlsx).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => onGroupingModeChange('consolidated-chak')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                groupingMode === 'consolidated-chak'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Consolidated Chak/Mouza
            </button>
            <button
              type="button"
              onClick={() => onGroupingModeChange('by-submission')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                groupingMode === 'by-submission'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Submission Row
            </button>
          </div>

          <button
            type="button"
            disabled={activeQuickFormat !== null}
            onClick={() => onQuickExport('pdf')}
            className="px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            {activeQuickFormat === 'pdf' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            PDF
          </button>

          <button
            type="button"
            disabled={activeQuickFormat !== null}
            onClick={() => onQuickExport('pptx')}
            className="px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            {activeQuickFormat === 'pptx' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Presentation className="w-3.5 h-3.5" />
            )}
            PowerPoint
          </button>

          <button
            type="button"
            disabled={activeQuickFormat !== null}
            onClick={() => onQuickExport('xlsx')}
            className="px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            {activeQuickFormat === 'xlsx' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            MS Excel
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print PDF
          </button>
        </div>
      </div>

      {activeQuickFormat && quickProgress && (
        <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between gap-4 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
            <span>{quickProgress.message}</span>
          </div>
          <span className="font-mono text-teal-300">
            {quickProgress.completed} / {quickProgress.total}
          </span>
        </div>
      )}

      {/* Print-Only Report Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          District Jhang Field Survey Report (Chak / Mouza Wise with All Pictures)
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Total Chaks/Mouzas: {groups.length} · Total Attached GPS Pictures:{' '}
          {totalPhotos} · Generated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Chak / Mouza Sections with ALL Pictures */}
      <div className="space-y-6">
        {groups.map((group) => (
          <article
            key={group.groupKey}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden break-inside-avoid print:border-slate-300 print:mb-6"
          >
            {/* Chak/Mouza Header Strip */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-teal-300">
                  <span>CHAK/MOUZA #{String(group.index).padStart(2, '0')}</span>
                  <span>·</span>
                  <span>TEHSIL: {group.tehsil}</span>
                  <span>·</span>
                  <span>UNION COUNCIL: {group.unionCouncilFull}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Chak / Mouza: {group.chakMouza}
                </h3>
              </div>

              <div className="text-right font-mono text-xs text-slate-300 shrink-0">
                <div className="font-bold text-teal-300">
                  {group.photos.length} Attached GPS{' '}
                  {group.photos.length === 1 ? 'Picture' : 'Pictures'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Logged: {group.timestamps.join(', ')}
                </div>
              </div>
            </div>

            {/* All Pictures Grid for this Chak/Mouza */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.photos.map((photo, pIdx) => (
                <div
                  key={`${photo.id}-${pIdx}`}
                  className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col"
                >
                  <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={photo.thumbnailUrl}
                      alt={`${group.chakMouza} GPS Picture ${pIdx + 1}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== photo.lh3Url) {
                          target.src = photo.lh3Url;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        Picture #{pIdx + 1} · {group.chakMouza}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {group.tehsil} · {group.unionCouncilFull}
                      </p>
                    </div>
                    <a
                      href={photo.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:underline inline-flex items-center gap-0.5 text-[11px] font-medium shrink-0"
                    >
                      Drive
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
