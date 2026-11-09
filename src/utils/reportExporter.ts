import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import ExcelJS from 'exceljs';
import { GpsPhoto, SurveyRecord } from '../data/surveyData';

export type ExportFormat = 'pdf' | 'pptx' | 'xlsx';
export type GroupingMode = 'consolidated-chak' | 'by-submission';

export interface ChakMouzaGroup {
  groupKey: string;
  index: number;
  tehsil: string;
  ucNumber: string;
  ucName: string;
  unionCouncilFull: string;
  chakMouza: string;
  submissionCount: number;
  timestamps: string[];
  latestDate: string;
  photos: GpsPhoto[];
}

export interface ExportProgress {
  phase: 'grouping' | 'images' | 'building' | 'complete';
  completed: number;
  total: number;
  message: string;
}

/**
 * Organizes survey records Chak/Mouza-wise sorted by Tehsil -> Union Council -> Chak/Mouza.
 * When mode === 'consolidated-chak', multiple submissions for the same Tehsil + UC + Chak/Mouza
 * are combined so all pictures for that Chak/Mouza appear together.
 */
export function buildChakMouzaGroups(
  records: SurveyRecord[],
  mode: GroupingMode = 'consolidated-chak'
): ChakMouzaGroup[] {
  const sorted = [...records].sort((a, b) => {
    const tehsilCmp = a.tehsil.localeCompare(b.tehsil);
    if (tehsilCmp !== 0) return tehsilCmp;

    const ucNumA = parseInt(a.ucNumber, 10) || 999;
    const ucNumB = parseInt(b.ucNumber, 10) || 999;
    if (ucNumA !== ucNumB) return ucNumA - ucNumB;

    const ucCmp = a.unionCouncilRaw.localeCompare(b.unionCouncilRaw);
    if (ucCmp !== 0) return ucCmp;

    const chakCmp = a.chakMouzaClean.localeCompare(b.chakMouzaClean);
    if (chakCmp !== 0) return chakCmp;

    return a.sortTimestamp - b.sortTimestamp;
  });

  if (mode === 'by-submission') {
    return sorted.map((r, idx) => ({
      groupKey: r.id,
      index: idx + 1,
      tehsil: r.tehsil,
      ucNumber: r.ucNumber,
      ucName: r.ucName || r.unionCouncilRaw,
      unionCouncilFull: r.unionCouncilRaw,
      chakMouza: r.chakMouzaClean,
      submissionCount: 1,
      timestamps: [r.timestamp],
      latestDate: r.dateFormatted,
      photos: r.photos.map((p, pIdx) => ({
        ...p,
        indexInRecord: pIdx + 1,
      })),
    }));
  }

  const groupMap = new Map<string, ChakMouzaGroup>();

  for (const r of sorted) {
    const normalizedChak = r.chakMouzaClean.trim().toLowerCase();
    const key = `${r.tehsil.trim().toLowerCase()}||${r.unionCouncilRaw
      .trim()
      .toLowerCase()}||${normalizedChak}`;

    const existing = groupMap.get(key);
    if (!existing) {
      groupMap.set(key, {
        groupKey: key,
        index: groupMap.size + 1,
        tehsil: r.tehsil,
        ucNumber: r.ucNumber,
        ucName: r.ucName || r.unionCouncilRaw,
        unionCouncilFull: r.unionCouncilRaw,
        chakMouza: r.chakMouzaClean,
        submissionCount: 1,
        timestamps: [r.timestamp],
        latestDate: r.dateFormatted,
        photos: r.photos.map((p, idx) => ({
          ...p,
          indexInRecord: idx + 1,
        })),
      });
    } else {
      existing.submissionCount += 1;
      if (!existing.timestamps.includes(r.timestamp)) {
        existing.timestamps.push(r.timestamp);
      }
      existing.latestDate = r.dateFormatted;
      const startIdx = existing.photos.length;
      for (let i = 0; i < r.photos.length; i++) {
        existing.photos.push({
          ...r.photos[i],
          indexInRecord: startIdx + i + 1,
        });
      }
    }
  }

  return Array.from(groupMap.values()).map((g, i) => ({
    ...g,
    index: i + 1,
  }));
}

// In-memory cache of resolved Base64 JPEG images by photo fileId + label
const photoBase64Cache = new Map<string, string>();
let corsDirectBlocked = false;

/**
 * Generates a high-resolution, crisp GPS Survey Photo Plate as a JPEG Base64 data URL
 * when Google Drive blocks anonymous cross-origin canvas pixel extraction.
 */
function renderFallbackPhotoPlate(
  photo: GpsPhoto,
  photoNumberInChak: number,
  totalInChak: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 640, 480);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.6, '#f1f5f9');
  grad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  // Subtle survey coordinate grid lines
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  for (let x = 40; x < 640; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 64);
    ctx.lineTo(x, 412);
    ctx.stroke();
  }
  for (let y = 104; y < 412; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }

  // Top Header Banner (Teal-800)
  ctx.fillStyle = '#115e59';
  ctx.fillRect(0, 0, 640, 64);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(
    `GPS SURVEY PICTURE #${photoNumberInChak} OF ${totalInChak}`,
    24,
    40
  );

  ctx.textAlign = 'right';
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#99f6e4';
  ctx.fillText(`TEHSIL: ${photo.tehsil.toUpperCase()}`, 616, 40);
  ctx.textAlign = 'left';

  // Center Card Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(32, 92, 576, 292, 12);
  ctx.fill();
  ctx.stroke();

  // Left Accent Stripe inside Card
  ctx.fillStyle = '#0f766e';
  ctx.beginPath();
  ctx.roundRect(32, 92, 10, 292, [12, 0, 0, 12]);
  ctx.fill();

  // Field Metadata Labels inside Card
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('CHAK / MOUZA NAME', 64, 134);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px sans-serif';
  const chakTitle =
    photo.chakMouza.length > 34
      ? photo.chakMouza.slice(0, 32) + '…'
      : photo.chakMouza;
  ctx.fillText(chakTitle, 64, 170);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('UNION COUNCIL & TEHSIL', 64, 216);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 21px sans-serif';
  const ucText = `${photo.unionCouncil}  ·  Tehsil ${photo.tehsil}`;
  ctx.fillText(
    ucText.length > 46 ? ucText.slice(0, 44) + '…' : ucText,
    64,
    246
  );

  // Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(64, 272);
  ctx.lineTo(580, 272);
  ctx.stroke();

  // Drive File ID & Timestamp
  ctx.fillStyle = '#475569';
  ctx.font = '15px monospace';
  ctx.fillText(`Drive File ID: ${photo.fileId}`, 64, 306);
  ctx.fillText(`Survey Timestamp: ${photo.timestamp}`, 64, 334);

  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(
    'Click image or link to view full-resolution Google Drive photo ↗',
    64,
    364
  );

  // Bottom Footer Bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 412, 640, 68);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px monospace';
  const shortUrl =
    photo.originalUrl.length > 68
      ? photo.originalUrl.slice(0, 65) + '...'
      : photo.originalUrl;
  ctx.fillText(shortUrl, 24, 452);

  // Border around entire plate
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 638, 478);

  return canvas.toDataURL('image/jpeg', 0.88);
}

/**
 * Attempts to load a live image from candidate URLs with a fast timeout,
 * falling back to a crisp GPS Survey Photo Plate if Google Drive blocks CORS.
 */
async function fetchPhotoAsBase64(
  photo: GpsPhoto,
  photoNumberInChak: number,
  totalInChak: number
): Promise<string> {
  const cacheKey = `${photo.fileId}_${photoNumberInChak}_${totalInChak}`;
  const cached = photoBase64Cache.get(cacheKey);
  if (cached) return cached;

  if (!corsDirectBlocked) {
    const candidateUrls = [
      `https://wsrv.nl/?url=${encodeURIComponent(
        `https://drive.google.com/thumbnail?id=${photo.fileId}&sz=w600`
      )}&w=600&h=450&fit=cover&output=jpg`,
      photo.thumbnailUrl,
    ];

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 1400);
        const resp = await fetch(url, {
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
        });
        window.clearTimeout(timeout);

        if (resp.ok) {
          const contentType = resp.headers.get('content-type') || '';
          if (contentType.startsWith('image/')) {
            const blob = await resp.blob();
            const bitmap = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, 640, 480);
              ctx.drawImage(bitmap, 0, 0, 640, 480);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              photoBase64Cache.set(cacheKey, dataUrl);
              return dataUrl;
            }
          }
        }
      } catch {
        // Ignore and try next or trip circuit breaker
      }
    }
    // If the first test fails across both endpoints, trip circuit breaker so 250 photos resolve immediately
    corsDirectBlocked = true;
  }

  const plate = renderFallbackPhotoPlate(photo, photoNumberInChak, totalInChak);
  photoBase64Cache.set(cacheKey, plate);
  return plate;
}

/**
 * Resolves all photos across all Chak/Mouza groups into Base64 JPEG data URLs
 * with progress reporting.
 */
async function prepareAllGroupPhotos(
  groups: ChakMouzaGroup[],
  onProgress?: (progress: ExportProgress) => void
): Promise<Map<string, string>> {
  const allItems: Array<{
    photo: GpsPhoto;
    num: number;
    total: number;
    key: string;
  }> = [];

  for (const g of groups) {
    g.photos.forEach((p, idx) => {
      allItems.push({
        photo: p,
        num: idx + 1,
        total: g.photos.length,
        key: `${g.groupKey}__${p.id}__${idx}`,
      });
    });
  }

  const resolvedMap = new Map<string, string>();
  const total = allItems.length;
  let completed = 0;

  onProgress?.({
    phase: 'images',
    completed: 0,
    total,
    message: `Preparing ${total} GPS pictures across ${groups.length} Chak/Mouza entries...`,
  });

  const concurrency = 16;
  for (let i = 0; i < allItems.length; i += concurrency) {
    const batch = allItems.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (item) => {
        const b64 = await fetchPhotoAsBase64(item.photo, item.num, item.total);
        return { key: item.key, b64 };
      })
    );
    for (const r of results) {
      resolvedMap.set(r.key, r.b64);
    }
    completed += batch.length;
    onProgress?.({
      phase: 'images',
      completed,
      total,
      message: `Prepared ${completed} of ${total} Chak/Mouza GPS pictures...`,
    });
    // Yield briefly to keep UI responsive
    await new Promise((r) => window.setTimeout(r, 5));
  }

  return resolvedMap;
}

/**
 * 1. EXPORT WHOLE REPORT AS PDF (.pdf)
 * Organized Chak/Mouza-wise with Tehsil, Union Council Name, Chak/Mouza, and all pictures.
 */
export async function exportReportAsPdf(
  records: SurveyRecord[],
  mode: GroupingMode = 'consolidated-chak',
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  onProgress?.({
    phase: 'grouping',
    completed: 0,
    total: 1,
    message: 'Organizing records by Tehsil, Union Council & Chak/Mouza...',
  });

  const groups = buildChakMouzaGroups(records, mode);
  const photoMap = await prepareAllGroupPhotos(groups, onProgress);
  const totalPhotos = groups.reduce((acc, g) => acc + g.photos.length, 0);
  const uniqueTehsils = Array.from(new Set(groups.map((g) => g.tehsil)));
  const uniqueUcs = Array.from(new Set(groups.map((g) => g.unionCouncilFull)));

  onProgress?.({
    phase: 'building',
    completed: 0,
    total: groups.length,
    message: 'Generating PDF pages Chak/Mouza wise...',
  });

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 12;

  // --- PAGE 1: COVER & INDEX SUMMARY ---
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(
    'DISTRICT JHANG FIELD SURVEY REPORT (CHAK / MOUZA WISE)',
    margin,
    20
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(
    `Complete Report with Tehsil, Union Council Name, Chak/Mouza & All Attached GPS Pictures · Generated: ${new Date().toLocaleString()}`,
    margin,
    31
  );

  // KPI Summary Boxes on Page 1
  const kpis = [
    { label: 'TEHSILS COVERED', value: `${uniqueTehsils.length} (${uniqueTehsils.join(', ')})` },
    { label: 'UNION COUNCILS', value: `${uniqueUcs.length} Union Councils` },
    { label: 'CHAK / MOUZA ENTRIES', value: `${groups.length} Chaks / Mouzas` },
    { label: 'TOTAL GPS PICTURES', value: `${totalPhotos} Attached Pictures` },
  ];

  const boxWidth = (pageWidth - margin * 2 - 12) / 4;
  kpis.forEach((kpi, idx) => {
    const bx = margin + idx * (boxWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(bx, 50, boxWidth, 24, 2, 2, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(kpi.label, bx + 4, 58);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const valText = doc.splitTextToSize(kpi.value, boxWidth - 8);
    doc.text(valText[0], bx + 4, 67);
  });

  // Index Table Header on Page 1
  let curY = 82;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, curY, pageWidth - margin * 2, 8, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('#', margin + 3, curY + 5.5);
  doc.text('Tehsil', margin + 15, curY + 5.5);
  doc.text('Union Council Name', margin + 55, curY + 5.5);
  doc.text('Name of Chak / Mouza', margin + 130, curY + 5.5);
  doc.text('Survey Date', margin + 215, curY + 5.5);
  doc.text('GPS Pictures', margin + 250, curY + 5.5);
  curY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  for (const g of groups) {
    if (curY > pageHeight - 18) {
      doc.addPage();
      curY = 16;
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, curY, pageWidth - margin * 2, 8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('#', margin + 3, curY + 5.5);
      doc.text('Tehsil', margin + 15, curY + 5.5);
      doc.text('Union Council Name', margin + 55, curY + 5.5);
      doc.text('Name of Chak / Mouza', margin + 130, curY + 5.5);
      doc.text('Survey Date', margin + 215, curY + 5.5);
      doc.text('GPS Pictures', margin + 250, curY + 5.5);
      curY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, curY + 6.5, pageWidth - margin, curY + 6.5);

    doc.setTextColor(71, 85, 105);
    doc.text(String(g.index).padStart(2, '0'), margin + 3, curY + 4.8);
    doc.setTextColor(15, 23, 42);
    doc.text(g.tehsil, margin + 15, curY + 4.8);
    doc.text(
      g.unionCouncilFull.length > 38
        ? g.unionCouncilFull.slice(0, 36) + '…'
        : g.unionCouncilFull,
      margin + 55,
      curY + 4.8
    );
    doc.setFont('helvetica', 'bold');
    doc.text(
      g.chakMouza.length > 42 ? g.chakMouza.slice(0, 40) + '…' : g.chakMouza,
      margin + 130,
      curY + 4.8
    );
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(g.latestDate, margin + 215, curY + 4.8);
    doc.setTextColor(15, 118, 110);
    doc.setFont('helvetica', 'bold');
    doc.text(`${g.photos.length} Pictures`, margin + 250, curY + 4.8);
    doc.setFont('helvetica', 'normal');

    curY += 6.8;
  }

  // --- DETAILED CHAK / MOUZA PAGES WITH ALL PICTURES ---
  // 6 pictures per page (3 columns x 2 rows) so every picture is large and legible
  const cols = 3;
  const rowsPerPage = 2;
  const photosPerPage = cols * rowsPerPage;
  const gridTop = 40;
  const gapX = 6;
  const gapY = 8;
  const cardW = (pageWidth - margin * 2 - gapX * (cols - 1)) / cols; // ~87mm
  const cardH = 72; // 58mm image + 14mm caption

  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    const group = groups[gIdx];
    const totalChunks = Math.max(
      1,
      Math.ceil(group.photos.length / photosPerPage)
    );

    for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
      doc.addPage();
      const chunkPhotos = group.photos.slice(
        chunkIdx * photosPerPage,
        (chunkIdx + 1) * photosPerPage
      );

      // Header Banner for this Chak/Mouza
      doc.setFillColor(15, 23, 42); // Slate-900
      doc.rect(0, 0, pageWidth, 32, 'F');

      // Top metadata row: Tehsil | Union Council Name | Entry #
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(94, 234, 212); // Teal-300
      doc.text(
        `CHAK / MOUZA #${String(group.index).padStart(2, '0')}   ·   TEHSIL: ${group.tehsil.toUpperCase()}   ·   UNION COUNCIL: ${group.unionCouncilFull.toUpperCase()}`,
        margin,
        11
      );

      // Primary Chak / Mouza Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      const contLabel =
        totalChunks > 1 ? ` (Page ${chunkIdx + 1} of ${totalChunks})` : '';
      const headerTitle = `Chak / Mouza: ${group.chakMouza}${contLabel}`;
      doc.text(
        headerTitle.length > 78 ? headerTitle.slice(0, 75) + '...' : headerTitle,
        margin,
        23
      );

      // Right side badge count
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(203, 213, 225);
      doc.text(
        `${group.photos.length} Total GPS Pictures · Logged: ${group.timestamps.join(', ')}`,
        pageWidth - margin,
        23,
        { align: 'right' }
      );

      // Render each photo in the 3x2 grid
      chunkPhotos.forEach((photo, idxInChunk) => {
        const globalPhotoIdx = chunkIdx * photosPerPage + idxInChunk;
        const col = idxInChunk % cols;
        const row = Math.floor(idxInChunk / cols);

        const x = margin + col * (cardW + gapX);
        const y = gridTop + row * (cardH + gapY);
        const imgH = cardH - 14;

        // Card container
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(x, y, cardW, cardH, 1.5, 1.5, 'FD');

        const photoKey = `${group.groupKey}__${photo.id}__${globalPhotoIdx}`;
        const base64Img = photoMap.get(photoKey);

        if (base64Img) {
          try {
            doc.addImage(
              base64Img,
              'JPEG',
              x + 1,
              y + 1,
              cardW - 2,
              imgH - 1
            );
            // Make image clickable to Google Drive
            doc.link(x + 1, y + 1, cardW - 2, imgH - 1, {
              url: photo.originalUrl,
            });
          } catch {
            // Fallback text if image fails
          }
        }

        // Caption strip under image
        doc.setFillColor(248, 250, 252);
        doc.rect(x + 0.5, y + imgH, cardW - 1, 13.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(
          `Picture #${globalPhotoIdx + 1} · ${group.chakMouza.slice(0, 25)}`,
          x + 3,
          y + imgH + 5
        );

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `${group.tehsil} · UC ${group.unionCouncilFull.slice(0, 22)}`,
          x + 3,
          y + imgH + 10.5
        );

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 118, 110);
        doc.textWithLink(
          'Open Drive Photo ↗',
          x + cardW - 29,
          y + imgH + 10.5,
          { url: photo.originalUrl }
        );
      });

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Jhang Field Survey Portal · Tehsil: ${group.tehsil} · Union Council: ${group.unionCouncilFull} · Chak/Mouza: ${group.chakMouza}`,
        margin,
        pageHeight - 5
      );
    }

    if (gIdx % 5 === 0 || gIdx === groups.length - 1) {
      onProgress?.({
        phase: 'building',
        completed: gIdx + 1,
        total: groups.length,
        message: `Built PDF pages for ${gIdx + 1} of ${groups.length} Chaks/Mouzas...`,
      });
      await new Promise((r) => window.setTimeout(r, 5));
    }
  }

  doc.save(
    `Jhang_Survey_Report_Chak_Mouza_Wise_${groups.length}_Mouzas_${totalPhotos}_Photos.pdf`
  );

  onProgress?.({
    phase: 'complete',
    completed: groups.length,
    total: groups.length,
    message: 'PDF Report downloaded successfully!',
  });
}

/**
 * 2. EXPORT WHOLE REPORT AS POWERPOINT (.pptx)
 * Creates a widescreen 16:9 presentation organized Chak/Mouza-wise with Tehsil,
 * Union Council Name, Chak/Mouza, and all pictures embedded + linked.
 */
export async function exportReportAsPptx(
  records: SurveyRecord[],
  mode: GroupingMode = 'consolidated-chak',
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  onProgress?.({
    phase: 'grouping',
    completed: 0,
    total: 1,
    message: 'Organizing slides by Tehsil, Union Council & Chak/Mouza...',
  });

  const groups = buildChakMouzaGroups(records, mode);
  const photoMap = await prepareAllGroupPhotos(groups, onProgress);
  const totalPhotos = groups.reduce((acc, g) => acc + g.photos.length, 0);
  const uniqueTehsils = Array.from(new Set(groups.map((g) => g.tehsil)));
  const uniqueUcs = Array.from(new Set(groups.map((g) => g.unionCouncilFull)));

  onProgress?.({
    phase: 'building',
    completed: 0,
    total: groups.length,
    message: 'Building PowerPoint presentation slides...',
  });

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
  pptx.author = 'Jhang Field Survey Portal';
  pptx.company = 'District Jhang Field Operations';
  pptx.subject = 'Chak/Mouza Wise GPS Field Survey Report';
  pptx.title = 'District Jhang Chak/Mouza GPS Survey Presentation';

  // --- SLIDE 1: EXECUTIVE COVER SLIDE ---
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: '0F172A' };

  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.18,
    fill: { color: '0D9488' },
  });

  coverSlide.addText('DISTRICT JHANG FIELD OPERATIONS', {
    x: 0.8,
    y: 1.1,
    w: 11.5,
    h: 0.4,
    fontSize: 13,
    bold: true,
    color: '5EEAD4',
    charSpacing: 2,
  });

  coverSlide.addText(
    'Chak / Mouza & Union Council GPS Survey Report',
    {
      x: 0.8,
      y: 1.6,
      w: 11.5,
      h: 1.1,
      fontSize: 32,
      bold: true,
      color: 'FFFFFF',
    }
  );

  coverSlide.addText(
    'Complete visual directory organized by Tehsil, Union Council Name, and Chak/Mouza with all attached Google Drive GPS survey pictures.',
    {
      x: 0.8,
      y: 2.8,
      w: 10.5,
      h: 0.6,
      fontSize: 15,
      color: 'CBD5E1',
    }
  );

  const summaryCards = [
    { label: 'TEHSILS', val: String(uniqueTehsils.length), sub: uniqueTehsils.join(' · ') },
    { label: 'UNION COUNCILS', val: String(uniqueUcs.length), sub: 'Active UCs Surveyed' },
    { label: 'CHAKS / MOUZAS', val: String(groups.length), sub: 'Chak/Mouza Wise Entries' },
    { label: 'GPS PICTURES', val: String(totalPhotos), sub: 'All Pictures Embedded' },
  ];

  summaryCards.forEach((c, idx) => {
    const cx = 0.8 + idx * 2.95;
    coverSlide.addShape(pptx.ShapeType.roundRect, {
      x: cx,
      y: 4.1,
      w: 2.75,
      h: 1.85,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 },
      rectRadius: 0.08,
    });
    coverSlide.addText(c.label, {
      x: cx + 0.2,
      y: 4.3,
      w: 2.35,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: '94A3B8',
    });
    coverSlide.addText(c.val, {
      x: cx + 0.2,
      y: 4.65,
      w: 2.35,
      h: 0.65,
      fontSize: 28,
      bold: true,
      color: '5EEAD4',
    });
    coverSlide.addText(c.sub, {
      x: cx + 0.2,
      y: 5.35,
      w: 2.35,
      h: 0.4,
      fontSize: 10,
      color: 'CBD5E1',
    });
  });

  // --- CHAK / MOUZA WISE SLIDES (4 Pictures per slide so every picture is large & clear) ---
  const photosPerSlide = 4; // 2x2 grid

  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    const group = groups[gIdx];
    const totalSlidesForGroup = Math.max(
      1,
      Math.ceil(group.photos.length / photosPerSlide)
    );

    for (let sIdx = 0; sIdx < totalSlidesForGroup; sIdx++) {
      const slide = pptx.addSlide();
      slide.background = { color: 'F8FAFC' };

      const chunkPhotos = group.photos.slice(
        sIdx * photosPerSlide,
        (sIdx + 1) * photosPerSlide
      );

      // Top Header Banner
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 13.33,
        h: 1.15,
        fill: { color: '0F172A' },
      });

      slide.addText(
        `TEHSIL: ${group.tehsil.toUpperCase()}   |   UNION COUNCIL: ${group.unionCouncilFull.toUpperCase()}   |   ENTRY #${String(
          group.index
        ).padStart(2, '0')}`,
        {
          x: 0.5,
          y: 0.12,
          w: 9.5,
          h: 0.3,
          fontSize: 10,
          bold: true,
          color: '5EEAD4',
        }
      );

      const pageBadge =
        totalSlidesForGroup > 1
          ? ` (Pictures ${sIdx * photosPerSlide + 1}–${
              sIdx * photosPerSlide + chunkPhotos.length
            } of ${group.photos.length})`
          : ` (${group.photos.length} ${
              group.photos.length === 1 ? 'Picture' : 'Pictures'
            })`;

      slide.addText(`Chak / Mouza: ${group.chakMouza}${pageBadge}`, {
        x: 0.5,
        y: 0.44,
        w: 12.3,
        h: 0.55,
        fontSize: 20,
        bold: true,
        color: 'FFFFFF',
      });

      // Left Metadata Sidebar Panel on each slide
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.4,
        y: 1.35,
        w: 3.1,
        h: 5.75,
        fill: { color: 'FFFFFF' },
        line: { color: 'CBD5E1', width: 1 },
        rectRadius: 0.06,
      });

      slide.addText('CHAK / MOUZA DETAILS', {
        x: 0.6,
        y: 1.55,
        w: 2.7,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: '0F766E',
      });

      const detailItems = [
        { label: 'Tehsil', value: group.tehsil },
        { label: 'Union Council Name', value: group.unionCouncilFull },
        { label: 'Chak / Mouza Name', value: group.chakMouza },
        {
          label: 'Attached GPS Pictures',
          value: `${group.photos.length} Drive Photos`,
        },
        {
          label: 'Survey Timestamp(s)',
          value: group.timestamps.join('\n'),
        },
      ];

      let dy = 1.95;
      detailItems.forEach((item) => {
        slide.addText(item.label.toUpperCase(), {
          x: 0.6,
          y: dy,
          w: 2.7,
          h: 0.22,
          fontSize: 8.5,
          bold: true,
          color: '64748B',
        });
        slide.addText(item.value, {
          x: 0.6,
          y: dy + 0.22,
          w: 2.7,
          h: 0.52,
          fontSize: 11,
          bold: true,
          color: '0F172A',
          valign: 'top',
        });
        dy += 0.85;
      });

      // Right 2x2 Picture Grid
      chunkPhotos.forEach((photo, idxInSlide) => {
        const globalPhotoIdx = sIdx * photosPerSlide + idxInSlide;
        const col = idxInSlide % 2;
        const row = Math.floor(idxInSlide / 2);

        const px = 3.75 + col * 4.65;
        const py = 1.35 + row * 2.92;
        const pw = 4.45;
        const ph = 2.75;

        // Card frame
        slide.addShape(pptx.ShapeType.roundRect, {
          x: px,
          y: py,
          w: pw,
          h: ph,
          fill: { color: 'FFFFFF' },
          line: { color: 'CBD5E1', width: 1 },
          rectRadius: 0.05,
        });

        const photoKey = `${group.groupKey}__${photo.id}__${globalPhotoIdx}`;
        const base64Img = photoMap.get(photoKey);

        if (base64Img) {
          slide.addImage({
            data: base64Img,
            x: px + 0.08,
            y: py + 0.08,
            w: pw - 0.16,
            h: ph - 0.52,
            hyperlink: {
              url: photo.originalUrl,
              tooltip: `Open GPS Picture #${globalPhotoIdx + 1} (${group.chakMouza}) in Google Drive`,
            },
          });
        }

        // Caption & clickable link below image
        slide.addText(
          `Picture #${globalPhotoIdx + 1} · ${group.chakMouza}`,
          {
            x: px + 0.1,
            y: py + ph - 0.4,
            w: pw - 1.5,
            h: 0.32,
            fontSize: 9.5,
            bold: true,
            color: '0F172A',
          }
        );

        slide.addText('Open Drive Link ↗', {
          x: px + pw - 1.45,
          y: py + ph - 0.4,
          w: 1.35,
          h: 0.32,
          fontSize: 9,
          bold: true,
          color: '0F766E',
          align: 'right',
          hyperlink: {
            url: photo.originalUrl,
            tooltip: photo.originalUrl,
          },
        });
      });
    }

    if (gIdx % 5 === 0 || gIdx === groups.length - 1) {
      onProgress?.({
        phase: 'building',
        completed: gIdx + 1,
        total: groups.length,
        message: `Built PowerPoint slides for ${gIdx + 1} of ${groups.length} Chaks/Mouzas...`,
      });
      await new Promise((r) => window.setTimeout(r, 5));
    }
  }

  await pptx.writeFile({
    fileName: `Jhang_Survey_Presentation_Chak_Mouza_Wise_${groups.length}_Mouzas.pptx`,
  });

  onProgress?.({
    phase: 'complete',
    completed: groups.length,
    total: groups.length,
    message: 'PowerPoint (.pptx) downloaded successfully!',
  });
}

/**
 * 3. EXPORT WHOLE REPORT AS MS EXCEL (.xlsx)
 * Generates a formatted multi-sheet Excel workbook with Tehsil, Union Council Name,
 * Chak/Mouza, and all pictures embedded Chak/Mouza-wise inside worksheet cells + clickable links.
 */
export async function exportReportAsExcel(
  records: SurveyRecord[],
  mode: GroupingMode = 'consolidated-chak',
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  onProgress?.({
    phase: 'grouping',
    completed: 0,
    total: 1,
    message: 'Organizing Excel rows by Tehsil, Union Council & Chak/Mouza...',
  });

  const groups = buildChakMouzaGroups(records, mode);
  const photoMap = await prepareAllGroupPhotos(groups, onProgress);
  const maxPhotosInAnyGroup = Math.max(
    1,
    ...groups.map((g) => g.photos.length)
  );
  const totalPhotos = groups.reduce((acc, g) => acc + g.photos.length, 0);

  onProgress?.({
    phase: 'building',
    completed: 0,
    total: groups.length,
    message: 'Embedding pictures and formatting MS Excel workbook...',
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Jhang Field Survey Portal';
  workbook.created = new Date();

  // =========================================================================
  // SHEET 1: CHAK / MOUZA WISE REPORT WITH EMBEDDED PICTURES
  // =========================================================================
  const sheet = workbook.addWorksheet('Chak-Mouza Picture Report', {
    views: [{ state: 'frozen', xSplit: 4, ySplit: 3 }],
  });

  // Title Banner Row
  sheet.mergeCells(1, 1, 1, 6 + maxPhotosInAnyGroup);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `DISTRICT JHANG FIELD SURVEY REPORT — TEHSIL, UNION COUNCIL & CHAK/MOUZA WISE WITH ALL PICTURES (${groups.length} Chaks/Mouzas · ${totalPhotos} GPS Pictures)`;
  titleCell.font = {
    name: 'Calibri',
    size: 14,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 32;

  // Subtitle Row
  sheet.mergeCells(2, 1, 2, 6 + maxPhotosInAnyGroup);
  const subCell = sheet.getCell(2, 1);
  subCell.value = `Generated on ${new Date().toLocaleString()} · Every Chak/Mouza row includes Tehsil, Union Council Name, Chak/Mouza Name, and all attached GPS pictures embedded in-cell with clickable Google Drive links.`;
  subCell.font = {
    name: 'Calibri',
    size: 10,
    italic: true,
    color: { argb: 'FF334155' },
  };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(2).height = 22;

  // Header Columns
  const baseHeaders = [
    'Sr. #',
    'Tehsil',
    'Union Council Name',
    'Name of Chak / Mouza',
    'Survey Timestamp(s)',
    'Total Pictures',
  ];
  const photoHeaders = Array.from(
    { length: maxPhotosInAnyGroup },
    (_, i) => `GPS Picture #${i + 1}`
  );
  const allHeaders = [...baseHeaders, ...photoHeaders];

  const headerRow = sheet.getRow(3);
  allHeaders.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: i >= 6 ? 'center' : 'left',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });
  headerRow.height = 26;

  // Set Column Widths
  sheet.getColumn(1).width = 8; // Sr #
  sheet.getColumn(2).width = 18; // Tehsil
  sheet.getColumn(3).width = 28; // Union Council Name
  sheet.getColumn(4).width = 30; // Name of Chak / Mouza
  sheet.getColumn(5).width = 22; // Timestamp
  sheet.getColumn(6).width = 14; // Photo Count
  for (let pCol = 0; pCol < maxPhotosInAnyGroup; pCol++) {
    sheet.getColumn(7 + pCol).width = 26; // ~185px wide for embedded picture
  }

  // Populate Chak/Mouza Rows + Embedded Pictures
  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    const group = groups[gIdx];
    const excelRowNumber = 4 + gIdx; // 1-indexed
    const row = sheet.getRow(excelRowNumber);
    row.height = 115; // Generous height (~153px) so embedded picture + link fit cleanly

    row.getCell(1).value = group.index;
    row.getCell(2).value = group.tehsil;
    row.getCell(3).value = group.unionCouncilFull;
    row.getCell(4).value = group.chakMouza;
    row.getCell(5).value = group.timestamps.join('\n');
    row.getCell(6).value = group.photos.length;

    for (let c = 1; c <= 6 + maxPhotosInAnyGroup; c++) {
      const cell = row.getCell(c);
      cell.alignment = {
        vertical: c <= 6 ? 'middle' : 'bottom',
        horizontal: c === 1 || c === 6 || c > 6 ? 'center' : 'left',
        wrapText: true,
      };
      cell.font = {
        name: 'Calibri',
        size: c === 4 ? 11 : 10,
        bold: c === 4 || c === 6,
        color: { argb: 'FF0F172A' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
      if (gIdx % 2 === 1 && c <= 6) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
    }

    // Embed every picture for this Chak/Mouza into columns 7, 8, ...
    group.photos.forEach((photo, pIdx) => {
      const colNumber1Based = 7 + pIdx;
      const pCell = row.getCell(colNumber1Based);
      pCell.value = {
        text: `Open Picture #${pIdx + 1} in Drive ↗`,
        hyperlink: photo.originalUrl,
        tooltip: `${group.chakMouza} - Picture #${pIdx + 1}`,
      };
      pCell.font = {
        name: 'Calibri',
        size: 9,
        bold: true,
        underline: true,
        color: { argb: 'FF0F766E' },
      };

      const photoKey = `${group.groupKey}__${photo.id}__${pIdx}`;
      const base64Img = photoMap.get(photoKey);
      if (base64Img) {
        try {
          const imgId = workbook.addImage({
            base64: base64Img,
            extension: 'jpeg',
          });
          sheet.addImage(imgId, {
            tl: { col: colNumber1Based - 1 + 0.06, row: excelRowNumber - 1 + 0.05 },
            ext: { width: 168, height: 122 },
            hyperlinks: {
              hyperlink: photo.originalUrl,
              tooltip: `Open GPS Picture #${pIdx + 1} (${group.chakMouza})`,
            },
          });
        } catch {
          // Keep hyperlink in cell if image attachment fails
        }
      }
    });

    if (gIdx % 8 === 0 || gIdx === groups.length - 1) {
      onProgress?.({
        phase: 'building',
        completed: gIdx + 1,
        total: groups.length,
        message: `Embedded pictures for ${gIdx + 1} of ${groups.length} Chaks/Mouzas in Excel...`,
      });
      await new Promise((r) => window.setTimeout(r, 5));
    }
  }

  // =========================================================================
  // SHEET 2: PHOTO-BY-PHOTO INDEX TABLE (1 ROW PER PICTURE, CHAK/MOUZA WISE)
  // =========================================================================
  const indexSheet = workbook.addWorksheet('All Pictures Index List', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  indexSheet.columns = [
    { header: 'Photo Sr. #', key: 'sr', width: 12 },
    { header: 'Tehsil', key: 'tehsil', width: 18 },
    { header: 'Union Council Name', key: 'uc', width: 28 },
    { header: 'Name of Chak / Mouza', key: 'chak', width: 32 },
    { header: 'Picture # in Chak/Mouza', key: 'picNum', width: 22 },
    { header: 'Survey Timestamp', key: 'timestamp', width: 22 },
    { header: 'Google Drive File ID', key: 'fileId', width: 36 },
    { header: 'Direct Google Drive Picture Link', key: 'url', width: 55 },
  ];

  const idxHeader = indexSheet.getRow(1);
  idxHeader.height = 24;
  idxHeader.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  let globalPhotoCounter = 1;
  for (const group of groups) {
    group.photos.forEach((p, idx) => {
      const r = indexSheet.addRow({
        sr: globalPhotoCounter++,
        tehsil: group.tehsil,
        uc: group.unionCouncilFull,
        chak: group.chakMouza,
        picNum: `Picture ${idx + 1} of ${group.photos.length}`,
        timestamp: p.timestamp,
        fileId: p.fileId,
        url: p.originalUrl,
      });
      const urlCell = r.getCell(8);
      urlCell.value = {
        text: p.originalUrl,
        hyperlink: p.originalUrl,
      };
      urlCell.font = { color: { argb: 'FF0F766E' }, underline: true };
    });
  }

  // Write Buffer & Trigger Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Jhang_Survey_Report_Chak_Mouza_Wise_${groups.length}_Mouzas_${totalPhotos}_Photos.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  onProgress?.({
    phase: 'complete',
    completed: groups.length,
    total: groups.length,
    message: 'MS Excel (.xlsx) workbook downloaded successfully!',
  });
}
