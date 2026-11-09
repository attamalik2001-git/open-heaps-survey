import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  LayoutGrid,
  Table as TableIcon,
  Images,
  Building2,
  Download,
  Plus,
  ExternalLink,
  RotateCcw,
  FolderOpen,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
  Link2,
  Check,
  FileText,
  Presentation,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import {
  DEFAULT_GOOGLE_SHEET_URL,
  fetchAttachedSurveyCsv,
  GpsPhoto,
  INITIAL_SURVEY_RECORDS,
  SurveyRecord,
} from './data/surveyData';
import { DrivePhotoThumb } from './components/DrivePhotoThumb';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { AddEntryModal } from './components/AddEntryModal';
import {
  ChakMouzaFullReportView,
  ExportReportModal,
} from './components/ExportReportModal';
import {
  ExportFormat,
  ExportProgress,
  exportReportAsExcel,
  exportReportAsPdf,
  exportReportAsPptx,
  GroupingMode,
} from './utils/reportExporter';

type ActiveSection = 'directory' | 'gallery' | 'ucs' | 'chak-report';
type DirectoryLayout = 'cards' | 'table';
type SortOption = 'newest' | 'oldest' | 'photos-desc' | 'uc-asc' | 'chak-asc';
type PhotoCountFilter = 'all' | 'single' | 'medium' | 'bulk';

export default function App() {
  const [sheetRecords, setSheetRecords] = useState<SurveyRecord[]>(
    INITIAL_SURVEY_RECORDS
  );
  const [customRecords, setCustomRecords] = useState<SurveyRecord[]>([]);
  const [isSyncingAsset, setIsSyncingAsset] = useState<boolean>(false);

  // Live 10-second Google Sheet sync state
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(
    DEFAULT_GOOGLE_SHEET_URL
  );
  const [sheetUrlDraft, setSheetUrlDraft] = useState<string>(
    DEFAULT_GOOGLE_SHEET_URL
  );
  const [isEditingSheetUrl, setIsEditingSheetUrl] = useState<boolean>(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);
  const [secondsUntilSync, setSecondsUntilSync] = useState<number>(10);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour12: false })
  );
  const [syncSourceLabel, setSyncSourceLabel] = useState<string>(
    'Google Sheet (199OwKQAdr…)'
  );
  const [syncError, setSyncError] = useState<string | undefined>(undefined);
  const isSyncingRef = useRef<boolean>(false);

  const records = useMemo(
    () => [...customRecords, ...sheetRecords],
    [customRecords, sheetRecords]
  );

  // Navigation & View modes
  const [activeSection, setActiveSection] = useState<ActiveSection>('directory');
  const [directoryLayout, setDirectoryLayout] = useState<DirectoryLayout>('cards');

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTehsil, setSelectedTehsil] = useState<string>('ALL');
  const [selectedUc, setSelectedUc] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [photoCountFilter, setPhotoCountFilter] = useState<PhotoCountFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Modals & Export State
  const [lightboxPhoto, setLightboxPhoto] = useState<GpsPhoto | null>(null);
  const [lightboxList, setLightboxList] = useState<GpsPhoto[]>([]);
  const [detailRecord, setDetailRecord] = useState<SurveyRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [reportGroupingMode, setReportGroupingMode] =
    useState<GroupingMode>('consolidated-chak');
  const [quickExportFormat, setQuickExportFormat] =
    useState<ExportFormat | null>(null);
  const [quickExportProgress, setQuickExportProgress] =
    useState<ExportProgress | null>(null);

  const performSheetSync = useCallback(
    async (overrideUrl?: string) => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      setIsSyncingAsset(true);

      const targetUrl =
        overrideUrl !== undefined ? overrideUrl : googleSheetUrl;
      const result = await fetchAttachedSurveyCsv(targetUrl);

      if (result.records.length > 0) {
        setSheetRecords(result.records);
      }
      setSyncSourceLabel(result.sourceLabel);
      setSyncError(result.error);
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour12: false }));
      setSecondsUntilSync(10);
      setIsSyncingAsset(false);
      isSyncingRef.current = false;
    },
    [googleSheetUrl]
  );

  // Initial sync on mount
  useEffect(() => {
    performSheetSync();
  }, [performSheetSync]);

  // Automatic 10-second polling interval
  useEffect(() => {
    if (!isAutoSyncEnabled) return;

    const timer = window.setInterval(() => {
      setSecondsUntilSync((prev) => {
        if (prev <= 1) {
          performSheetSync();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isAutoSyncEnabled, performSheetSync]);

  const handleSaveSheetUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sheetUrlDraft.trim();
    setGoogleSheetUrl(cleaned);
    if (cleaned) {
      localStorage.setItem('jhang_survey_google_sheet_url', cleaned);
    } else {
      localStorage.removeItem('jhang_survey_google_sheet_url');
    }
    setIsEditingSheetUrl(false);
    performSheetSync(cleaned);
  };

  // Distinct Tehsils with counts
  const tehsilStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of records) {
      counts.set(r.tehsil, (counts.get(r.tehsil) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [records]);

  // Distinct Union Councils (filtered by Tehsil if one is selected)
  const ucStats = useMemo(() => {
    const map = new Map<
      string,
      {
        ucRaw: string;
        ucNumber: string;
        ucName: string;
        tehsil: string;
        recordCount: number;
        photoCount: number;
        mouzas: Set<string>;
        latestTimestamp: string;
        samplePhoto: GpsPhoto | null;
      }
    >();

    for (const r of records) {
      if (selectedTehsil !== 'ALL' && r.tehsil !== selectedTehsil) continue;
      const existing = map.get(r.unionCouncilRaw);
      if (!existing) {
        map.set(r.unionCouncilRaw, {
          ucRaw: r.unionCouncilRaw,
          ucNumber: r.ucNumber,
          ucName: r.ucName,
          tehsil: r.tehsil,
          recordCount: 1,
          photoCount: r.photoCount,
          mouzas: new Set([r.chakMouzaClean]),
          latestTimestamp: r.dateFormatted,
          samplePhoto: r.photos[0] || null,
        });
      } else {
        existing.recordCount += 1;
        existing.photoCount += r.photoCount;
        existing.mouzas.add(r.chakMouzaClean);
        existing.latestTimestamp = r.dateFormatted;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const numA = parseInt(a.ucNumber, 10);
      const numB = parseInt(b.ucNumber, 10);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
      return a.ucRaw.localeCompare(b.ucRaw);
    });
  }, [records, selectedTehsil]);

  // Distinct Survey Dates
  const dateStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      map.set(r.dateFormatted, (map.get(r.dateFormatted) || 0) + 1);
    }
    return Array.from(map.entries());
  }, [records]);

  // Filtered and Sorted Survey Records
  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = records.filter((r) => {
      if (selectedTehsil !== 'ALL' && r.tehsil !== selectedTehsil) return false;
      if (selectedUc !== 'ALL' && r.unionCouncilRaw !== selectedUc) return false;
      if (selectedDate !== 'ALL' && r.dateFormatted !== selectedDate) return false;

      if (photoCountFilter === 'single' && r.photoCount !== 1) return false;
      if (
        photoCountFilter === 'medium' &&
        (r.photoCount < 2 || r.photoCount > 5)
      ) {
        return false;
      }
      if (photoCountFilter === 'bulk' && r.photoCount < 6) return false;

      if (q) {
        const matchesChak = r.chakMouzaClean.toLowerCase().includes(q) || r.chakMouzaRaw.toLowerCase().includes(q);
        const matchesUc = r.unionCouncilRaw.toLowerCase().includes(q);
        const matchesTehsil = r.tehsil.toLowerCase().includes(q);
        const matchesTime = r.timestamp.toLowerCase().includes(q) || r.dateFormatted.toLowerCase().includes(q);
        const matchesDriveId = r.photos.some((p) =>
          p.fileId.toLowerCase().includes(q)
        );
        return (
          matchesChak ||
          matchesUc ||
          matchesTehsil ||
          matchesTime ||
          matchesDriveId
        );
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return b.sortTimestamp - a.sortTimestamp || b.rowNumber - a.rowNumber;
      if (sortBy === 'oldest') return a.sortTimestamp - b.sortTimestamp || a.rowNumber - b.rowNumber;
      if (sortBy === 'photos-desc') return b.photoCount - a.photoCount || a.rowNumber - b.rowNumber;
      if (sortBy === 'uc-asc') {
        const numA = parseInt(a.ucNumber, 10) || 999;
        const numB = parseInt(b.ucNumber, 10) || 999;
        return numA - numB || a.unionCouncilRaw.localeCompare(b.unionCouncilRaw);
      }
      if (sortBy === 'chak-asc') {
        return a.chakMouzaClean.localeCompare(b.chakMouzaClean);
      }
      return 0;
    });
  }, [
    records,
    searchQuery,
    selectedTehsil,
    selectedUc,
    selectedDate,
    photoCountFilter,
    sortBy,
  ]);

  // All GPS photos belonging to the currently filtered records
  const filteredPhotos = useMemo(() => {
    return filteredRecords.flatMap((r) => r.photos);
  }, [filteredRecords]);

  // Global KPI totals
  const totalPhotosCount = useMemo(
    () => records.reduce((acc, r) => acc + r.photoCount, 0),
    [records]
  );
  const totalUniqueUcs = useMemo(
    () => new Set(records.map((r) => r.unionCouncilRaw)).size,
    [records]
  );

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedTehsil !== 'ALL' ||
    selectedUc !== 'ALL' ||
    selectedDate !== 'ALL' ||
    photoCountFilter !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedTehsil('ALL');
    setSelectedUc('ALL');
    setSelectedDate('ALL');
    setPhotoCountFilter('all');
  };

  const handleOpenLightbox = (photo: GpsPhoto, contextPhotos?: GpsPhoto[]) => {
    setLightboxList(contextPhotos && contextPhotos.length > 0 ? contextPhotos : filteredPhotos);
    setLightboxPhoto(photo);
  };

  const handleExportCsv = () => {
    const header =
      'Timestamp,Tehsil,Union Council,Name of Chak/Mouza,Attach GPS Pictures';
    const rows = filteredRecords.map((r) => {
      const links = r.photos.map((p) => p.originalUrl).join(', ');
      const formattedLinks = links.includes(',') ? `"${links}"` : links;
      const formattedChak = r.chakMouzaRaw.includes(',')
        ? `"${r.chakMouzaRaw}"`
        : r.chakMouzaRaw;
      return `${r.timestamp},${r.tehsil},${r.unionCouncilRaw},${formattedChak},${formattedLinks}`;
    });
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jhang_Field_Survey_Export_${filteredRecords.length}_Rows.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuickExportWholeReport = async (
    format: ExportFormat,
    useFiltered = false
  ) => {
    if (quickExportFormat) return;
    const target = useFiltered ? filteredRecords : records;
    setQuickExportFormat(format);
    setQuickExportProgress(null);
    try {
      if (format === 'pdf') {
        await exportReportAsPdf(
          target,
          reportGroupingMode,
          setQuickExportProgress
        );
      } else if (format === 'pptx') {
        await exportReportAsPptx(
          target,
          reportGroupingMode,
          setQuickExportProgress
        );
      } else if (format === 'xlsx') {
        await exportReportAsExcel(
          target,
          reportGroupingMode,
          setQuickExportProgress
        );
      }
    } catch (err) {
      console.error('Quick export failed:', err);
    } finally {
      setQuickExportFormat(null);
      setQuickExportProgress(null);
    }
  };

  const handleTriggerBrowserPrint = (
    _recordsToPrint: SurveyRecord[],
    mode: GroupingMode
  ) => {
    setReportGroupingMode(mode);
    setIsExportModalOpen(false);
    setActiveSection('chak-report');
    window.setTimeout(() => {
      window.print();
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8 print:hidden">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('directory');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
        >
          Jhang Field Survey Portal
        </a>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveSection('directory')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
              activeSection === 'directory'
                ? 'border-teal-700 text-slate-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Survey Directory
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('chak-report')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
              activeSection === 'chak-report'
                ? 'border-teal-700 text-slate-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Chak/Mouza Wise Report
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('gallery')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
              activeSection === 'gallery'
                ? 'border-teal-700 text-slate-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            GPS Photo Wall
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('ucs')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
              activeSection === 'ucs'
                ? 'border-teal-700 text-slate-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Union Councils
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="text-teal-700 hover:text-teal-900 font-semibold transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 border-transparent cursor-pointer"
          >
            Export Report (PDF · PPTX · Excel)
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-medium text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Survey Entry
          </button>
        </div>
      </header>

      {/* Main Workspace Container (1440px max-w or full-width sidebar layout) */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row">
        {/* Left Sidebar Navigation & Facet Filters (272px on desktop) */}
        <aside className="w-full lg:w-[272px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-5 flex flex-col gap-6 print:hidden">
          {/* Mobile Section Switcher */}
          <div className="flex md:hidden items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('directory')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'directory'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('chak-report')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'chak-report'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Chak Report
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('gallery')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'gallery'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              GPS Photos
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('ucs')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'ucs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              UCs
            </button>
          </div>

          {/* Dataset Source & 10-Second Auto-Sync Controls */}
          <div className="pb-5 border-b border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Connected Google Sheet
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSheetUrl((v) => !v)}
                  className="text-xs text-slate-600 hover:text-teal-700 inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Link2 className="w-3 h-3" />
                  {googleSheetUrl ? 'Change URL' : 'Link Sheet'}
                </button>
                <button
                  type="button"
                  onClick={() => performSheetSync()}
                  title="Sync now from Google Sheet"
                  className="text-xs text-teal-700 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw
                    className={`w-3 h-3 ${isSyncingAsset ? 'animate-spin' : ''}`}
                  />
                  Sync
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-mono break-all">
              {syncSourceLabel}
            </p>

            {/* Live 10-Second Auto-Sync Status Line */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums pt-0.5">
              <span>
                {isAutoSyncEnabled
                  ? `Auto-sync in ${secondsUntilSync}s`
                  : 'Auto-sync paused'}
              </span>
              <button
                type="button"
                onClick={() => setIsAutoSyncEnabled((prev) => !prev)}
                className="text-teal-700 hover:underline font-sans font-medium cursor-pointer"
              >
                {isAutoSyncEnabled ? 'Pause' : 'Resume 10s'}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
              Last synced: {lastSyncedAt}
            </div>

            {syncError && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                {syncError}
              </p>
            )}

            {isEditingSheetUrl && (
              <form
                onSubmit={handleSaveSheetUrl}
                className="pt-2 space-y-2 border-t border-slate-100"
              >
                <label className="block text-[11px] font-medium text-slate-700">
                  Live Google Sheet URL or ID (Shared as &ldquo;Anyone with link&rdquo;)
                </label>
                <input
                  type="text"
                  value={sheetUrlDraft}
                  onChange={(e) => setSheetUrlDraft(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSheetUrlDraft(DEFAULT_GOOGLE_SHEET_URL);
                      setGoogleSheetUrl(DEFAULT_GOOGLE_SHEET_URL);
                      localStorage.removeItem('jhang_survey_google_sheet_url');
                      setIsEditingSheetUrl(false);
                      performSheetSync(DEFAULT_GOOGLE_SHEET_URL);
                    }}
                    className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Reset Default
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-[11px] font-medium text-white bg-teal-700 hover:bg-teal-800 rounded inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Connect 10s Sync
                  </button>
                </div>
              </form>
            )}

            <div className="pt-1 flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
              <span>{records.length} Rows</span>
              <span aria-hidden="true">·</span>
              <span>{totalPhotosCount} GPS Links</span>
              <span aria-hidden="true">·</span>
              <a
                href={googleSheetUrl || DEFAULT_GOOGLE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:underline font-sans inline-flex items-center gap-0.5"
              >
                Open Sheet
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Tehsil Filter Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="sidebar-tehsil-select"
                className="text-xs font-semibold text-slate-900"
              >
                Filter by Tehsil
              </label>
              {selectedTehsil !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTehsil('ALL');
                    setSelectedUc('ALL');
                  }}
                  className="text-xs text-teal-700 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <select
              id="sidebar-tehsil-select"
              value={selectedTehsil}
              onChange={(e) => {
                setSelectedTehsil(e.target.value);
                setSelectedUc('ALL');
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-colors cursor-pointer"
            >
              <option value="ALL">All Tehsils ({records.length} entries)</option>
              {tehsilStats.map(([tehsilName, count]) => (
                <option key={tehsilName} value={tehsilName}>
                  {tehsilName} ({count} entries)
                </option>
              ))}
            </select>
          </div>

          {/* Union Council Filter Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="sidebar-uc-select"
                className="text-xs font-semibold text-slate-900"
              >
                Union Councils ({ucStats.length})
              </label>
              {selectedUc !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedUc('ALL')}
                  className="text-xs text-teal-700 hover:underline cursor-pointer"
                >
                  All UCs
                </button>
              )}
            </div>
            <select
              id="sidebar-uc-select"
              value={selectedUc}
              onChange={(e) => setSelectedUc(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-colors cursor-pointer"
            >
              <option value="ALL">
                All Union Councils ({ucStats.reduce((s, u) => s + u.recordCount, 0)} entries)
              </option>
              {ucStats.map((uc) => (
                <option key={uc.ucRaw} value={uc.ucRaw}>
                  {uc.ucRaw} ({uc.recordCount} entries · {uc.photoCount}p)
                </option>
              ))}
            </select>
            {selectedUc !== 'ALL' && (
              <p className="mt-2 text-[11px] text-slate-500 font-mono tabular-nums">
                Active filter: {selectedUc}
              </p>
            )}
          </div>

          {/* Sidebar Export Whole Report (Chak/Mouza Wise) Box */}
          <div className="pt-5 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Export Whole Report
              </span>
              <span className="text-[10px] font-mono text-teal-700 font-semibold">
                Chak/Mouza Wise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Export all Tehsils, Union Council Names, and Chaks/Mouzas with all attached GPS pictures:
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                disabled={quickExportFormat !== null}
                onClick={() => handleQuickExportWholeReport('pdf', false)}
                className="w-full px-3 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors inline-flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-1.5">
                  {quickExportFormat === 'pdf' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  Export as PDF (.pdf)
                </span>
                <span className="font-mono text-[10px]">{totalPhotosCount} pics</span>
              </button>

              <button
                type="button"
                disabled={quickExportFormat !== null}
                onClick={() => handleQuickExportWholeReport('pptx', false)}
                className="w-full px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors inline-flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-1.5">
                  {quickExportFormat === 'pptx' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Presentation className="w-3.5 h-3.5" />
                  )}
                  Export PowerPoint (.pptx)
                </span>
                <span className="font-mono text-[10px]">Slides</span>
              </button>

              <button
                type="button"
                disabled={quickExportFormat !== null}
                onClick={() => handleQuickExportWholeReport('xlsx', false)}
                className="w-full px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-1.5">
                  {quickExportFormat === 'xlsx' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  )}
                  Export MS Excel (.xlsx)
                </span>
                <span className="font-mono text-[10px]">Workbook</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="w-full px-3 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center cursor-pointer mt-0.5"
              >
                More Export Options &amp; Preview →
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-5 md:p-8 space-y-6">
          {/* Header & KPI Metrics Strip */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 print:hidden">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                  <span>District Jhang Field Operations</span>
                  <span aria-hidden="true">·</span>
                  <span>Live Google Sheet Auto-Sync (Every 10s)</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {isAutoSyncEnabled
                      ? `Next sync in ${secondsUntilSync}s`
                      : 'Auto-sync paused'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Last synced: {lastSyncedAt}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1 font-display">
                  Mouza &amp; Union Council GPS Survey Dashboard
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={quickExportFormat !== null}
                  onClick={() => handleQuickExportWholeReport('pdf', false)}
                  title="Download Whole Report with Tehsil, Union Council, Chak/Mouza & All Pictures as PDF"
                  className="px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {quickExportFormat === 'pdf' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  Export PDF
                </button>
                <button
                  type="button"
                  disabled={quickExportFormat !== null}
                  onClick={() => handleQuickExportWholeReport('pptx', false)}
                  title="Download Whole Report with Tehsil, Union Council, Chak/Mouza & All Pictures as PowerPoint (.pptx)"
                  className="px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {quickExportFormat === 'pptx' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Presentation className="w-3.5 h-3.5" />
                  )}
                  Export PowerPoint
                </button>
                <button
                  type="button"
                  disabled={quickExportFormat !== null}
                  onClick={() => handleQuickExportWholeReport('xlsx', false)}
                  title="Download Whole Report with Tehsil, Union Council, Chak/Mouza & All Pictures as MS Excel (.xlsx)"
                  className="px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {quickExportFormat === 'xlsx' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  )}
                  Export MS Excel
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Report Options
                </button>
                <button
                  type="button"
                  onClick={() => performSheetSync()}
                  className="px-3 py-2 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw
                    className={`w-3.5 h-3.5 ${isSyncingAsset ? 'animate-spin' : ''}`}
                  />
                  {isSyncingAsset ? 'Syncing…' : `Sync (${secondsUntilSync}s)`}
                </button>
              </div>
            </div>

            {quickExportFormat && quickExportProgress && (
              <div className="mt-4 bg-slate-900 text-white rounded-lg px-4 py-2.5 flex items-center justify-between gap-4 text-xs">
                <span className="inline-flex items-center gap-2 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  {quickExportProgress.message}
                </span>
                <span className="font-mono text-teal-300">
                  {quickExportProgress.completed} / {quickExportProgress.total}
                </span>
              </div>
            )}

            {/* 4-Column Tabular KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-5">
              <div>
                <p className="text-xs text-slate-500">Survey Submissions</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {filteredRecords.length}
                  </span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    / {records.length} total
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">Attached GPS Pictures</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-teal-700 font-mono tabular-nums">
                    {filteredPhotos.length}
                  </span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    / {totalPhotosCount} Drive photos
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">Active Union Councils</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {new Set(filteredRecords.map((r) => r.unionCouncilRaw)).size}
                  </span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    / {totalUniqueUcs} UCs
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">Tehsil Coverage</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {new Set(filteredRecords.map((r) => r.tehsil)).size}
                  </span>
                  <span className="text-xs text-slate-500">
                    Jhang · 18-Hazari · Ahmad Pur Sial
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Interactive Filter Bar */}
          <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 print:hidden">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Chak / Mouza name, Union Council (e.g. Massan, 463, Rodu Sultan), Tehsil, or Drive ID..."
                  className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Mode & Section Switcher */}
              <div className="flex items-center gap-2 shrink-0 overflow-x-auto">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('directory');
                      setDirectoryLayout('cards');
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      activeSection === 'directory' && directoryLayout === 'cards'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Project Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('directory');
                      setDirectoryLayout('table');
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      activeSection === 'directory' && directoryLayout === 'table'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    Sheet Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('chak-report')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      activeSection === 'chak-report'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Chak/Mouza Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('gallery')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      activeSection === 'gallery'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Images className="w-3.5 h-3.5" />
                    All Photos ({filteredPhotos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('ucs')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      activeSection === 'ucs'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    By UC
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Filter Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 inline-flex items-center gap-1 font-medium">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters:
                </span>

                {/* Tehsil Dropdown */}
                <select
                  aria-label="Filter by Tehsil"
                  value={selectedTehsil}
                  onChange={(e) => {
                    setSelectedTehsil(e.target.value);
                    setSelectedUc('ALL');
                  }}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
                >
                  <option value="ALL">All Tehsils ({records.length})</option>
                  {tehsilStats.map(([tehsilName, count]) => (
                    <option key={tehsilName} value={tehsilName}>
                      {tehsilName} ({count})
                    </option>
                  ))}
                </select>

                {/* Union Council Dropdown */}
                <select
                  aria-label="Filter by Union Council"
                  value={selectedUc}
                  onChange={(e) => setSelectedUc(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700 max-w-[230px] cursor-pointer"
                >
                  <option value="ALL">
                    All Union Councils ({ucStats.length})
                  </option>
                  {ucStats.map((uc) => (
                    <option key={uc.ucRaw} value={uc.ucRaw}>
                      {uc.ucRaw} ({uc.recordCount})
                    </option>
                  ))}
                </select>

                {/* Date Selector */}
                <select
                  aria-label="Filter by Survey Date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
                >
                  <option value="ALL">All Survey Dates ({dateStats.length} Days)</option>
                  {dateStats.map(([dateLabel, cnt]) => (
                    <option key={dateLabel} value={dateLabel}>
                      {dateLabel} ({cnt} entries)
                    </option>
                  ))}
                </select>

                {/* Photo Count Filter */}
                <select
                  aria-label="Filter by Attached Photo Count"
                  value={photoCountFilter}
                  onChange={(e) =>
                    setPhotoCountFilter(e.target.value as PhotoCountFilter)
                  }
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
                >
                  <option value="all">Any Photo Count</option>
                  <option value="single">Single GPS Photo (1)</option>
                  <option value="medium">Multi-Photo (2–5 Pictures)</option>
                  <option value="bulk">Comprehensive Survey (6–10 Pictures)</option>
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-2.5 py-1.5 text-teal-700 hover:bg-teal-50 rounded-md font-medium transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Sort Order Control */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 inline-flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Sort:
                </span>
                <select
                  aria-label="Sort survey entries"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
                >
                  <option value="newest">Timestamp: Newest First</option>
                  <option value="oldest">Timestamp: Oldest First</option>
                  <option value="photos-desc">Most GPS Pictures Attached</option>
                  <option value="uc-asc">Union Council Number</option>
                  <option value="chak-asc">Chak / Mouza Name (A–Z)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Empty State if no records match */}
          {filteredRecords.length === 0 ? (
            <section className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <FolderOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h2 className="text-base font-bold text-slate-900">
                No Matching Chak / Mouza Survey Entries
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
                No records matched your current search or filter criteria. Clear active filters to inspect all {records.length} field submissions.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </section>
          ) : activeSection === 'directory' && directoryLayout === 'cards' ? (
            /* VIEW 1A: PROJECT DIRECTORY CARDS WITH EMBEDDED GPS PICTURES */
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRecords.map((record) => {
                const previewPhotos = record.photos.slice(0, 4);
                const remainingCount = record.photoCount - previewPhotos.length;

                return (
                  <article
                    key={record.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono tabular-nums">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span>#{String(record.rowNumber).padStart(2, '0')}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans font-medium text-slate-700">
                            {record.tehsil}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>UC {record.unionCouncilRaw}</span>
                        </div>
                        <span>{record.dateFormatted}</span>
                      </div>

                      {/* Primary Chak / Mouza Title */}
                      <div className="mt-1.5 flex items-start justify-between gap-3">
                        <h2 className="text-lg font-bold text-slate-900 leading-snug">
                          {record.chakMouzaClean}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setDetailRecord(record)}
                          className="text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline whitespace-nowrap shrink-0 inline-flex items-center gap-1 pt-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {record.photoCount}{' '}
                          {record.photoCount === 1 ? 'Photo' : 'Photos'}
                        </button>
                      </div>

                      {/* Attached GPS Pictures Grid inside Card */}
                      <div
                        className={`mt-4 grid gap-2.5 ${
                          previewPhotos.length === 1
                            ? 'grid-cols-1'
                            : 'grid-cols-2'
                        }`}
                      >
                        {previewPhotos.map((photo) => (
                          <DrivePhotoThumb
                            key={photo.id}
                            photo={photo}
                            onSelect={(p) => handleOpenLightbox(p, record.photos)}
                            aspectClass={
                              previewPhotos.length === 1
                                ? 'aspect-[16/9]'
                                : 'aspect-[16/10]'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Card Footer with Action Links */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-mono tabular-nums">
                        Logged {record.timestamp}
                      </span>

                      <div className="flex items-center gap-3">
                        {remainingCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setDetailRecord(record)}
                            className="font-semibold text-teal-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            +{remainingCount} more GPS pictures
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDetailRecord(record)}
                          className="font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Inspect Record →
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : activeSection === 'directory' && directoryLayout === 'table' ? (
            /* VIEW 1B: HIGH-DENSITY GOOGLE SHEET TABLE VIEW */
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4 w-14 font-mono">#</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Tehsil</th>
                      <th className="py-3 px-4">Union Council</th>
                      <th className="py-3 px-4">Name of Chak / Mouza</th>
                      <th className="py-3 px-4">Attach GPS Pictures</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-slate-50/90 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-500">
                          {String(record.rowNumber).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600 whitespace-nowrap">
                          {record.timestamp}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                          {record.tehsil}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-700 whitespace-nowrap">
                          {record.unionCouncilRaw}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {record.chakMouzaClean}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              {record.photos.slice(0, 3).map((photo) => (
                                <button
                                  key={photo.id}
                                  type="button"
                                  onClick={() =>
                                    handleOpenLightbox(photo, record.photos)
                                  }
                                  title={`View Photo #${photo.indexInRecord}`}
                                  className="w-12 h-9 rounded border border-slate-200 overflow-hidden bg-slate-100 hover:border-teal-700 transition-colors shrink-0 cursor-pointer"
                                >
                                  <img
                                    src={photo.thumbnailUrl}
                                    alt={`GPS ${photo.indexInRecord}`}
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
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setDetailRecord(record)}
                              className="text-xs font-mono tabular-nums text-teal-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              {record.photoCount}{' '}
                              {record.photoCount === 1 ? 'pic' : 'pics'}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailRecord(record)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                            {record.photos[0] && (
                              <a
                                href={record.photos[0].originalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open first photo in Google Drive"
                                className="p-1 text-slate-500 hover:text-teal-700"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : activeSection === 'gallery' ? (
            /* VIEW 2: FULL GPS PHOTO GALLERY WALL (ALL ATTACHED PICTURES) */
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Attached GPS Pictures Gallery ({filteredPhotos.length} Photos)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing all Google Drive GPS survey images extracted from the Attach GPS Pictures column. Click any photo to enlarge.
                  </p>
                </div>
              </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => (
                  <DrivePhotoThumb
                    key={photo.id}
                    photo={photo}
                    onSelect={(p) => handleOpenLightbox(p, filteredPhotos)}
                    aspectClass="aspect-[4/3]"
                    showCaption={true}
                  />
                ))}
              </div>
            </section>
          ) : activeSection === 'chak-report' ? (
            /* VIEW 4: COMPLETE CHAK / MOUZA WISE REPORT WITH ALL PICTURES */
            <ChakMouzaFullReportView
              records={filteredRecords}
              groupingMode={reportGroupingMode}
              onGroupingModeChange={setReportGroupingMode}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onQuickExport={(fmt) => handleQuickExportWholeReport(fmt, true)}
              activeQuickFormat={quickExportFormat}
              quickProgress={quickExportProgress}
            />
          ) : (
            /* VIEW 3: UNION COUNCILS & TEHSIL COVERAGE MATRIX */
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Union Council Survey Coverage ({ucStats.length} Union Councils)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Aggregated submission counts, surveyed Chaks/Mouzas, and GPS photo totals per Union Council.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">UC Code</th>
                      <th className="py-3 px-4">Union Council Name</th>
                      <th className="py-3 px-4">Tehsil</th>
                      <th className="py-3 px-4">Surveyed Chaks / Mouzas</th>
                      <th className="py-3 px-4 text-right">Entries</th>
                      <th className="py-3 px-4 text-right">GPS Photos</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {ucStats.map((uc) => (
                      <tr
                        key={uc.ucRaw}
                        className="hover:bg-slate-50/90 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono tabular-nums text-xs font-semibold text-slate-700">
                          UC-{uc.ucNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {uc.ucRaw}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{uc.tehsil}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-md">
                          {Array.from(uc.mouzas).join(' · ')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-medium">
                          {uc.recordCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-teal-700 font-semibold">
                          {uc.photoCount}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUc(uc.ucRaw);
                              setActiveSection('directory');
                            }}
                            className="px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 rounded transition-colors cursor-pointer"
                          >
                            View Records →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-auto print:hidden">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            Jhang District GPS Field Survey Portal · Source: Areas 31.10.2026 (Responses)
          </span>
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span>{records.length} Survey Records</span>
            <span aria-hidden="true">·</span>
            <span>{totalPhotosCount} Attached Drive Pictures</span>
          </div>
        </div>
      </footer>

      {/* High-Res Photo Lightbox Modal */}
      <PhotoLightboxModal
        photo={lightboxPhoto}
        photoList={lightboxList}
        onClose={() => setLightboxPhoto(null)}
        onNavigate={(nextPhoto) => setLightboxPhoto(nextPhoto)}
      />

      {/* Survey Record Full Detail Modal */}
      <RecordDetailModal
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onSelectPhoto={(photo, list) => handleOpenLightbox(photo, list)}
      />

      {/* Add Entry / Import CSV Modal */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        nextRowNumber={records.length + 1}
        onAddRecord={(newRec) => setCustomRecords((prev) => [newRec, ...prev])}
        onImportCsvRecords={(imported) => {
          setCustomRecords([]);
          setSheetRecords(imported);
        }}
      />

      {/* Whole Report Export Modal (PDF, PowerPoint, MS Excel) */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allRecords={records}
        filteredRecords={filteredRecords}
        onTriggerBrowserPrint={handleTriggerBrowserPrint}
      />
    </div>
  );
}
