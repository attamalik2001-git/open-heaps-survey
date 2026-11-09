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
} from 'lucide-react';
import { SurveyRecord } from '../data/surveyData';
import {
  buildUnionCouncilHierarchy,
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

  const ucHierarchy = useMemo(
    () => buildUnionCouncilHierarchy(targetRecords, groupingMode, true),
    [targetRecords, groupingMode]
  );

  const uploadedUcsCount = useMemo(
    () => ucHierarchy.filter((u) => u.hasUploadedSurvey).length,
    [ucHierarchy]
  );

  const missingUcsCount = ucHierarchy.length - uploadedUcsCount;

  const totalChaks = useMemo(
    () => ucHierarchy.reduce((acc, u) => acc + u.chakGroups.length, 0),
    [ucHierarchy]
  );

  const totalEntries = useMemo(
    () => ucHierarchy.reduce((acc, u) => acc + u.totalEntries, 0),
    [ucHierarchy]
  );

  const totalPictures = useMemo(
    () => ucHierarchy.reduce((acc, u) => acc + u.totalPhotos, 0),
    [ucHierarchy]
  );

  if (!isOpen) return null;

  const handleRunExport = async (format: ExportFormat) => {
    if (activeExport) return;
    setActiveExport(format);
    setLastCompletedFormat(null);

    try {
      if (format === 'pdf') {
        await exportReportAsPdf(targetRecords, groupingMode, setProgress, true);
        setLastCompletedFormat('PDF Hierarchical Report (.pdf)');
      } else if (format === 'pptx') {
        await exportReportAsPptx(targetRecords, groupingMode, setProgress, true);
        setLastCompletedFormat('PowerPoint Hierarchical Report (.pptx)');
      } else if (format === 'xlsx') {
        await exportReportAsExcel(targetRecords, groupingMode, setProgress, true);
        setLastCompletedFormat('MS Excel Hierarchical Report (.xlsx)');
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setActiveExport(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:hidden"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-300 block">
              Hierarchical Report Exporter · All 91 Union Councils (Ascending Order)
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              Export Hierarchical Report (Union Council Asc → Chak/Mouza, Total Entries, Total GPS Photos &amp; Picture1, Picture2… Links)
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
                    Whole Report (All 91 UCs)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {allRecords.length} entries ·{' '}
                    {allRecords.reduce((a, r) => a + r.photoCount, 0)} photos
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
                    {filteredRecords.length} entries ·{' '}
                    {filteredRecords.reduce((a, r) => a + r.photoCount, 0)}{' '}
                    photos
                  </div>
                </button>
              </div>
            </div>

            {/* Grouping Selection */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                2. Chak / Mouza Hierarchy Mode
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
                    Consolidated Chak/Mouza
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Groups by UC (Asc) → Chak/Mouza with Total Entries &amp; Photos
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
                    Individual Submissions
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Sorted by UC (Asc) → Chak/Mouza ({targetRecords.length}{' '}
                    rows)
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Summary KPI Bar */}
          <div className="bg-teal-950 text-white rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <span className="text-[11px] font-mono text-teal-300 uppercase">
                Total Union Councils
              </span>
              <p className="text-xl font-bold font-mono mt-0.5">
                {ucHierarchy.length} UCs (01–91)
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-emerald-300 uppercase">
                Uploaded Survey UCs
              </span>
              <p className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
                {uploadedUcsCount} UCs
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-rose-300 uppercase">
                Missing (No Survey)
              </span>
              <p className="text-xl font-bold font-mono text-rose-300 mt-0.5">
                {missingUcsCount} UCs
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-teal-300 uppercase">
                Total Entries / Chaks
              </span>
              <p className="text-xl font-bold font-mono mt-0.5">
                {totalEntries} ({totalChaks} Chaks)
              </p>
            </div>
            <div>
              <span className="text-[11px] font-mono text-teal-300 uppercase">
                Total GPS Photos
              </span>
              <p className="text-xl font-bold font-mono text-teal-300 mt-0.5">
                {totalPictures} (Picture1…N)
              </p>
            </div>
          </div>

          {/* Step 2: Export Format Cards (Hierarchical Report Only) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              3. Download Hierarchical Report Only (All 91 UCs in Ascending Order · Includes Missing UCs &amp; Picture1, Picture2… Links)
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
                      .PDF HIERARCHICAL ONLY
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    PDF Hierarchical Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Exports <strong>only the Hierarchical Report</strong> sorted by Union Council (01–91) with all uploaded &amp; missing UCs, Chak/Mouza, Total Entries, Total GPS Photos, and clickable{' '}
                    <span className="font-mono font-semibold text-slate-700">
                      Picture1, Picture2…
                    </span>{' '}
                    links.
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
                    Print Hierarchical Report
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
                      .PPTX HIERARCHICAL ONLY
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    PowerPoint Hierarchical Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Exports <strong>only the Hierarchical Report</strong> table slides sorted by Union Council (01–91) including missing UCs, Chak/Mouza, Total Entries, Total GPS Photos, and clickable{' '}
                    <span className="font-mono font-semibold text-slate-700">
                      Picture1, Picture2…
                    </span>{' '}
                    links.
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
                      .XLSX HIERARCHICAL ONLY
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    MS Excel Hierarchical Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Exports <strong>only the Hierarchical Report</strong> worksheet sorted by Union Council (01–91) with all uploaded &amp; missing UCs, Chak/Mouza, Total Entries, Total GPS Photos, and clickable{' '}
                    <span className="font-mono font-semibold text-slate-700">
                      Picture1, Picture2…
                    </span>{' '}
                    columns.
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
            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between text-xs">
              <span className="font-medium inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                {progress.message}
              </span>
            </div>
          )}

          {/* Completion Banner */}
          {!activeExport && lastCompletedFormat && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Successfully exported <strong>{lastCompletedFormat}</strong>{' '}
                  (Hierarchical Report Only) with all {ucHierarchy.length} Union Councils ({uploadedUcsCount} uploaded, {missingUcsCount} missing), {totalChaks} Chaks/Mouzas, {totalEntries} Total Entries, and {totalPictures} Picture links!
                </span>
              </div>
            </div>
          )}

          {/* Hierarchical Preview Table (All 91 Union Councils in Ascending Order) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold">
                Preview: Hierarchical Report Only — All {ucHierarchy.length} Union Councils (Ascending: UC-01 to UC-91)
              </span>
              <span className="text-[11px] font-mono text-teal-300">
                {uploadedUcsCount} Uploaded · {missingUcsCount} Missing (0 Surveys) ·{' '}
                {totalChaks} Chaks/Mouzas · {totalEntries} Entries ·{' '}
                {totalPictures} Photos
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">
                      Union Council (Asc) / Chak-Mouza Hierarchy
                    </th>
                    <th className="py-2.5 px-3">Tehsil</th>
                    <th className="py-2.5 px-3 text-center">Total Entries</th>
                    <th className="py-2.5 px-3 text-center">
                      Total GPS Photos
                    </th>
                    <th className="py-2.5 px-3">
                      Picture Links (Picture1, Picture2, …)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ucHierarchy.map((uc) =>
                    !uc.hasUploadedSurvey ? (
                      <tr
                        key={uc.ucSortNum}
                        className="bg-rose-50/70 text-rose-900"
                      >
                        <td className="py-2 px-3 font-bold">
                          UC {uc.unionCouncilFull}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {uc.tehsil}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-rose-700">
                          0
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-rose-700">
                          0
                        </td>
                        <td className="py-2 px-3 text-[11px] italic text-rose-700">
                          No Survey Uploaded (0 Chaks/Mouzas · 0 Entries · 0 Photos)
                        </td>
                      </tr>
                    ) : (
                      <React.Fragment key={uc.ucSortNum}>
                        {/* Level 1: Union Council Parent Row */}
                        <tr className="bg-teal-50/90 font-semibold text-slate-900">
                          <td className="py-2 px-3 text-teal-900 font-bold">
                            ▼ UC {uc.unionCouncilFull}{' '}
                            <span className="text-[11px] font-normal text-teal-700">
                              ({uc.chakGroups.length}{' '}
                              {uc.chakGroups.length === 1
                                ? 'Chak/Mouza'
                                : 'Chaks/Mouzas'}
                              )
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {uc.tehsil}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">
                            {uc.totalEntries}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-teal-800 font-bold">
                            {uc.totalPhotos}
                          </td>
                          <td className="py-2 px-3 text-[11px] text-slate-500 italic">
                            Union Council Subtotal: {uc.totalEntries} Entries ·{' '}
                            {uc.totalPhotos} GPS Photos
                          </td>
                        </tr>

                        {/* Level 2: Indented Chak / Mouza Rows */}
                        {uc.chakGroups.map((chak, cIdx) => {
                          const isLast = cIdx === uc.chakGroups.length - 1;
                          return (
                            <tr
                              key={chak.groupKey}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="py-2 pl-7 pr-3 font-medium text-slate-900">
                                <span className="font-mono text-slate-400 mr-1.5">
                                  {isLast ? '└─' : '├─'}
                                </span>
                                {chak.chakMouza}
                              </td>
                              <td className="py-2 px-3 text-slate-600">
                                {chak.tehsil}
                              </td>
                              <td className="py-2 px-3 text-center font-mono font-semibold text-slate-800">
                                {chak.submissionCount}
                              </td>
                              <td className="py-2 px-3 text-center font-mono font-bold text-teal-700">
                                {chak.photos.length}
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                                  {chak.photos.map((photo, pIdx) => (
                                    <React.Fragment key={photo.id}>
                                      <a
                                        href={photo.originalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono font-semibold text-teal-700 hover:text-teal-900 underline"
                                        title={`Open Picture${pIdx + 1} (${chak.chakMouza}) in Google Drive`}
                                      >
                                        Picture{pIdx + 1}
                                      </a>
                                      {pIdx < chak.photos.length - 1 && (
                                        <span className="text-slate-400">,</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Exports ONLY the Hierarchical Report sorted by Union Council (01–91), including missing Union Councils (0 surveys).
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
 * Full-page Hierarchical Report View ONLY (Sorted by Union Council 01 to 91 in Ascending Order,
 * including missing Union Councils that have not uploaded any survey, with Chak/Mouza,
 * Total Entries, Total GPS Photos, and clickable Picture1, Picture2... links).
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
  onQuickExport,
  activeQuickFormat,
}) => {
  const [ucFilterStatus, setUcFilterStatus] = useState<
    'all' | 'uploaded' | 'missing'
  >('all');

  const fullUcHierarchy = useMemo(
    () => buildUnionCouncilHierarchy(records, groupingMode, true),
    [records, groupingMode]
  );

  const ucHierarchy = useMemo(() => {
    if (ucFilterStatus === 'uploaded') {
      return fullUcHierarchy.filter((u) => u.hasUploadedSurvey);
    }
    if (ucFilterStatus === 'missing') {
      return fullUcHierarchy.filter((u) => !u.hasUploadedSurvey);
    }
    return fullUcHierarchy;
  }, [fullUcHierarchy, ucFilterStatus]);

  const uploadedUcsCount = useMemo(
    () => fullUcHierarchy.filter((u) => u.hasUploadedSurvey).length,
    [fullUcHierarchy]
  );
  const missingUcsCount = fullUcHierarchy.length - uploadedUcsCount;

  const totalChaks = useMemo(
    () => fullUcHierarchy.reduce((acc, u) => acc + u.chakGroups.length, 0),
    [fullUcHierarchy]
  );

  const totalEntries = useMemo(
    () => fullUcHierarchy.reduce((acc, u) => acc + u.totalEntries, 0),
    [fullUcHierarchy]
  );

  const totalPhotos = useMemo(
    () => fullUcHierarchy.reduce((acc, u) => acc + u.totalPhotos, 0),
    [fullUcHierarchy]
  );

  return (
    <section className="space-y-6">
      {/* Control Banner (Hidden during print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-teal-700 font-semibold">
            Hierarchical Report · All 91 Union Councils (Ascending Order: UC-01 to UC-91)
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Union Council (Asc) → Chak/Mouza Hierarchical Report ({fullUcHierarchy.length} UCs ·{' '}
            {uploadedUcsCount} Uploaded · {missingUcsCount} Missing)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Includes all 91 Union Councils in ascending order (including missing Union Councils with 0 surveys), Chak/Mouza, Total Entries, Total GPS Photos, and clickable{' '}
            <span className="font-mono font-semibold text-slate-700">
              Picture1, Picture2, …
            </span>{' '}
            links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Status Filter: All 91 UCs / Uploaded / Missing */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setUcFilterStatus('all')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                ucFilterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All UCs ({fullUcHierarchy.length})
            </button>
            <button
              type="button"
              onClick={() => setUcFilterStatus('uploaded')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                ucFilterStatus === 'uploaded'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Uploaded ({uploadedUcsCount})
            </button>
            <button
              type="button"
              onClick={() => setUcFilterStatus('missing')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                ucFilterStatus === 'missing'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Missing ({missingUcsCount})
            </button>
          </div>

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
              Consolidated Chak
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
              By Row
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

      {/* Print-Only Report Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          District Jhang Field Survey — Hierarchical Report (Sorted by Union Council Ascending)
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Total Union Councils: {fullUcHierarchy.length} ({uploadedUcsCount}{' '}
          Uploaded · {missingUcsCount} Missing) · Chaks/Mouzas: {totalChaks} ·
          Total Entries: {totalEntries} · Total GPS Photos: {totalPhotos} ·
          Generated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* HIERARCHICAL REPORT ONLY (UNION COUNCIL ASCENDING -> CHAK/MOUZA -> PICTURE1, PICTURE2... LINKS) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold">
            Hierarchical Report (Union Council Ascending → Chak/Mouza → Total Entries → Total GPS Photos → Picture1, Picture2…)
          </h3>
          <span className="text-xs font-mono text-teal-300">
            {fullUcHierarchy.length} Total UCs ({uploadedUcsCount} Uploaded ·{' '}
            {missingUcsCount} Missing) · {totalChaks} Chaks/Mouzas ·{' '}
            {totalEntries} Entries · {totalPhotos} Photos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4">
                  Union Council (Ascending) / Chak-Mouza Hierarchy
                </th>
                <th className="py-3 px-4">Tehsil</th>
                <th className="py-3 px-4 text-center">Total Entries</th>
                <th className="py-3 px-4 text-center">Total GPS Photos</th>
                <th className="py-3 px-4">
                  Picture Links (Picture1, Picture2, …)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ucHierarchy.map((uc) =>
                !uc.hasUploadedSurvey ? (
                  /* Missing Union Council Row (0 Surveys Uploaded) */
                  <tr
                    key={uc.ucSortNum}
                    className="bg-rose-50/60 hover:bg-rose-50 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-bold text-rose-900">
                      UC {uc.unionCouncilFull}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{uc.tehsil}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-rose-700">
                      0
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-rose-700">
                      0
                    </td>
                    <td className="py-2.5 px-4 text-[11px] italic text-rose-700">
                      No Survey Uploaded (0 Chaks/Mouzas · 0 Entries · 0 GPS Photos)
                    </td>
                  </tr>
                ) : (
                  <React.Fragment key={uc.ucSortNum}>
                    {/* Parent Row: Uploaded Union Council */}
                    <tr className="bg-teal-50/90 font-semibold text-slate-900">
                      <td className="py-2.5 px-4 text-teal-950 font-bold">
                        ▼ UC {uc.unionCouncilFull}{' '}
                        <span className="text-[11px] font-normal text-teal-700">
                          ({uc.chakGroups.length}{' '}
                          {uc.chakGroups.length === 1
                            ? 'Chak/Mouza'
                            : 'Chaks/Mouzas'}
                          )
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">
                        {uc.tehsil}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold">
                        {uc.totalEntries}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-teal-800">
                        {uc.totalPhotos}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-slate-500 italic">
                        UC Subtotal: {uc.totalEntries} Entries ·{' '}
                        {uc.totalPhotos} GPS Photos
                      </td>
                    </tr>

                    {/* Child Rows: Chak / Mouza under this Union Council */}
                    {uc.chakGroups.map((chak, cIdx) => {
                      const isLast = cIdx === uc.chakGroups.length - 1;
                      return (
                        <tr
                          key={chak.groupKey}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2.5 pl-8 pr-4 font-semibold text-slate-900">
                            <span className="font-mono text-slate-400 mr-2">
                              {isLast ? '└─' : '├─'}
                            </span>
                            {chak.chakMouza}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {chak.tehsil}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-900">
                            {chak.submissionCount}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-bold text-teal-700">
                            {chak.photos.length}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                              {chak.photos.map((photo, pIdx) => (
                                <React.Fragment key={photo.id}>
                                  <a
                                    href={photo.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono font-semibold text-teal-700 hover:text-teal-900 underline"
                                  >
                                    Picture{pIdx + 1}
                                  </a>
                                  {pIdx < chak.photos.length - 1 && (
                                    <span className="text-slate-400">,</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                )
              )}

              {/* Grand Total Row */}
              <tr className="bg-slate-900 text-white font-bold">
                <td className="py-3 px-4">
                  GRAND TOTAL ({fullUcHierarchy.length} UCs: {uploadedUcsCount}{' '}
                  Uploaded · {missingUcsCount} Missing · {totalChaks}{' '}
                  Chaks/Mouzas)
                </td>
                <td className="py-3 px-4">All Tehsils</td>
                <td className="py-3 px-4 text-center font-mono">
                  {totalEntries}
                </td>
                <td className="py-3 px-4 text-center font-mono text-teal-300">
                  {totalPhotos}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                  All Picture1…PictureN links active
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
