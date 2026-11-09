import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import ExcelJS from 'exceljs';
import { GpsPhoto, SurveyRecord } from '../data/surveyData';

export type ExportFormat = 'pdf' | 'pptx' | 'xlsx';
export type GroupingMode = 'consolidated-chak' | 'by-submission';

export interface MasterUnionCouncil {
  ucSortNum: number;
  ucNumber: string;
  unionCouncilFull: string;
  ucName: string;
  tehsil: string;
}

/**
 * Official Master List of all 91 Union Councils of District Jhang (from Sheet1 of the connected Google Sheet)
 * with their respective Tehsils, sorted in ascending order (01 to 91).
 */
export const ALL_DISTRICT_JHANG_UCS: MasterUnionCouncil[] = [
  { ucSortNum: 1, ucNumber: '01', unionCouncilFull: '01. CHAK NO. 159/JB', ucName: 'CHAK NO. 159/JB', tehsil: 'Jhang' },
  { ucSortNum: 2, ucNumber: '02', unionCouncilFull: '02. CHAK NO. 250/JB', ucName: 'CHAK NO. 250/JB', tehsil: 'Jhang' },
  { ucSortNum: 3, ucNumber: '03', unionCouncilFull: '03. CHAK NO. 169/JB', ucName: 'CHAK NO. 169/JB', tehsil: 'Jhang' },
  { ucSortNum: 4, ucNumber: '04', unionCouncilFull: '04. CHAK NO. 259/JB', ucName: 'CHAK NO. 259/JB', tehsil: 'Jhang' },
  { ucSortNum: 5, ucNumber: '05', unionCouncilFull: '05. SATIANA', ucName: 'SATIANA', tehsil: 'Jhang' },
  { ucSortNum: 6, ucNumber: '06', unionCouncilFull: '06. KHEWA', ucName: 'KHEWA', tehsil: 'Jhang' },
  { ucSortNum: 7, ucNumber: '07', unionCouncilFull: '07. SULTAN PUR', ucName: 'SULTAN PUR', tehsil: 'Jhang' },
  { ucSortNum: 8, ucNumber: '08', unionCouncilFull: '08. MUKHIANA', ucName: 'MUKHIANA', tehsil: 'Jhang' },
  { ucSortNum: 9, ucNumber: '09', unionCouncilFull: '09. CHAK NO. 175/JB', ucName: 'CHAK NO. 175/JB', tehsil: 'Jhang' },
  { ucSortNum: 10, ucNumber: '10', unionCouncilFull: '10. CHAK NO. 450/JB', ucName: 'CHAK NO. 450/JB', tehsil: 'Jhang' },
  { ucSortNum: 11, ucNumber: '11', unionCouncilFull: '11. CHAK NO. 182/JB(MOCHI WALA)', ucName: 'CHAK NO. 182/JB(MOCHI WALA)', tehsil: 'Jhang' },
  { ucSortNum: 12, ucNumber: '12', unionCouncilFull: '12. CHAK NO. 265/JB', ucName: 'CHAK NO. 265/JB', tehsil: 'Jhang' },
  { ucSortNum: 13, ucNumber: '13', unionCouncilFull: '13. SHEIKH CHOHAR', ucName: 'SHEIKH CHOHAR', tehsil: 'Jhang' },
  { ucSortNum: 14, ucNumber: '14', unionCouncilFull: '14. PAKKEY WALA', ucName: 'PAKKEY WALA', tehsil: 'Jhang' },
  { ucSortNum: 15, ucNumber: '15', unionCouncilFull: '15. CIVIL STATION', ucName: 'CIVIL STATION', tehsil: 'Jhang' },
  { ucSortNum: 16, ucNumber: '16', unionCouncilFull: '16. KOT SAI SINGH', ucName: 'KOT SAI SINGH', tehsil: 'Jhang' },
  { ucSortNum: 17, ucNumber: '17', unionCouncilFull: '17. CHAK NO. 215/JB', ucName: 'CHAK NO. 215/JB', tehsil: 'Jhang' },
  { ucSortNum: 18, ucNumber: '18', unionCouncilFull: '18. CHAK NO. 446/JB KHOI ADDA', ucName: 'CHAK NO. 446/JB KHOI ADDA', tehsil: 'Jhang' },
  { ucSortNum: 19, ucNumber: '19', unionCouncilFull: '19. BASTI GHAZI SHAH', ucName: 'BASTI GHAZI SHAH', tehsil: 'Jhang' },
  { ucSortNum: 20, ucNumber: '20', unionCouncilFull: '20. CHAK GHUMNANA', ucName: 'CHAK GHUMNANA', tehsil: 'Jhang' },
  { ucSortNum: 21, ucNumber: '21', unionCouncilFull: '21. HASNANA', ucName: 'HASNANA', tehsil: 'Jhang' },
  { ucSortNum: 22, ucNumber: '22', unionCouncilFull: '22. BAGH', ucName: 'BAGH', tehsil: 'Jhang' },
  { ucSortNum: 23, ucNumber: '23', unionCouncilFull: '23. CHAK NO. 463/JB', ucName: 'CHAK NO. 463/JB', tehsil: 'Jhang' },
  { ucSortNum: 24, ucNumber: '24', unionCouncilFull: '24. ASHABA', ucName: 'ASHABA', tehsil: 'Jhang' },
  { ucSortNum: 25, ucNumber: '25', unionCouncilFull: '25. LAK BADHAR', ucName: 'LAK BADHAR', tehsil: 'Jhang' },
  { ucSortNum: 26, ucNumber: '26', unionCouncilFull: '26. MALHOANA', ucName: 'MALHOANA', tehsil: 'Jhang' },
  { ucSortNum: 27, ucNumber: '27', unionCouncilFull: '27. MANSOOR SIAL', ucName: 'MANSOOR SIAL', tehsil: 'Jhang' },
  { ucSortNum: 28, ucNumber: '28', unionCouncilFull: '28. QADEEMI', ucName: 'QADEEMI', tehsil: 'Jhang' },
  { ucSortNum: 29, ucNumber: '29', unionCouncilFull: '29. HAVELI LAL', ucName: 'HAVELI LAL', tehsil: 'Jhang' },
  { ucSortNum: 30, ucNumber: '30', unionCouncilFull: '30. PIR KOT SADHANA', ucName: 'PIR KOT SADHANA', tehsil: 'Jhang' },
  { ucSortNum: 31, ucNumber: '31', unionCouncilFull: '31. MASSAN', ucName: 'MASSAN', tehsil: 'Jhang' },
  { ucSortNum: 32, ucNumber: '32', unionCouncilFull: '32. HAVELI SHEIKH RAJOO', ucName: 'HAVELI SHEIKH RAJOO', tehsil: 'Jhang' },
  { ucSortNum: 33, ucNumber: '33', unionCouncilFull: '33. CHELA', ucName: 'CHELA', tehsil: 'Jhang' },
  { ucSortNum: 34, ucNumber: '34', unionCouncilFull: '34. QADIR PUR BAKHSHA', ucName: 'QADIR PUR BAKHSHA', tehsil: 'Jhang' },
  { ucSortNum: 35, ucNumber: '35', unionCouncilFull: '35. CHUND BHARWANA', ucName: 'CHUND BHARWANA', tehsil: 'Jhang' },
  { ucSortNum: 36, ucNumber: '36', unionCouncilFull: '36. KOT KHAN', ucName: 'KOT KHAN', tehsil: 'Jhang' },
  { ucSortNum: 37, ucNumber: '37', unionCouncilFull: '37. SHAH JEWENA', ucName: 'SHAH JEWENA', tehsil: 'Jhang' },
  { ucSortNum: 38, ucNumber: '38', unionCouncilFull: '38. RATA MATA SHUMALI', ucName: 'RATA MATA SHUMALI', tehsil: 'Jhang' },
  { ucSortNum: 39, ucNumber: '39', unionCouncilFull: '39. PABBAR WALA', ucName: 'PABBAR WALA', tehsil: 'Jhang' },
  { ucSortNum: 40, ucNumber: '40', unionCouncilFull: '40. KARI WALA', ucName: 'KARI WALA', tehsil: 'Jhang' },
  { ucSortNum: 41, ucNumber: '41', unionCouncilFull: '41. MAHAR WALI', ucName: 'MAHAR WALI', tehsil: 'Jhang' },
  { ucSortNum: 42, ucNumber: '42', unionCouncilFull: '42. CHATTA', ucName: 'CHATTA', tehsil: 'Jhang' },
  { ucSortNum: 43, ucNumber: '43', unionCouncilFull: '43. DHOORI WALA', ucName: 'DHOORI WALA', tehsil: 'Jhang' },
  { ucSortNum: 44, ucNumber: '44', unionCouncilFull: '44. KOT ESA SHAH', ucName: 'KOT ESA SHAH', tehsil: 'Jhang' },
  { ucSortNum: 45, ucNumber: '45', unionCouncilFull: '45. HAVELI BAHADUR SHAH', ucName: 'HAVELI BAHADUR SHAH', tehsil: 'Shorkot' },
  { ucSortNum: 46, ucNumber: '46', unionCouncilFull: '46. RUSTAM SARGANA', ucName: 'RUSTAM SARGANA', tehsil: 'Shorkot' },
  { ucSortNum: 47, ucNumber: '47', unionCouncilFull: '47. Chak No. 478/JB', ucName: 'Chak No. 478/JB', tehsil: 'Shorkot' },
  { ucSortNum: 48, ucNumber: '48', unionCouncilFull: '48. CHAIYANWALA', ucName: 'CHAIYANWALA', tehsil: 'Shorkot' },
  { ucSortNum: 49, ucNumber: '49', unionCouncilFull: '49. MEHRAM SIAL', ucName: 'MEHRAM SIAL', tehsil: 'Shorkot' },
  { ucSortNum: 50, ucNumber: '50', unionCouncilFull: '50. QAIM BHARWANA', ucName: 'QAIM BHARWANA', tehsil: 'Shorkot' },
  { ucSortNum: 51, ucNumber: '51', unionCouncilFull: '51. CHAK NO. 493/JB', ucName: 'CHAK NO. 493/JB', tehsil: 'Shorkot' },
  { ucSortNum: 52, ucNumber: '52', unionCouncilFull: '52. SHAH SADIQ NEHANG', ucName: 'SHAH SADIQ NEHANG', tehsil: 'Shorkot' },
  { ucSortNum: 53, ucNumber: '53', unionCouncilFull: '53. ALLAH YAR JOUTA', ucName: 'ALLAH YAR JOUTA', tehsil: 'Shorkot' },
  { ucSortNum: 54, ucNumber: '54', unionCouncilFull: '54. BHANGOO', ucName: 'BHANGOO', tehsil: 'Shorkot' },
  { ucSortNum: 55, ucNumber: '55', unionCouncilFull: '55. CHAK NO. 497/JB', ucName: 'CHAK NO. 497/JB', tehsil: 'Shorkot' },
  { ucSortNum: 56, ucNumber: '56', unionCouncilFull: '56. BADH RAJBANA', ucName: 'BADH RAJBANA', tehsil: 'Shorkot' },
  { ucSortNum: 57, ucNumber: '57', unionCouncilFull: '57. SHORKOT JANUBI', ucName: 'SHORKOT JANUBI', tehsil: 'Shorkot' },
  { ucSortNum: 58, ucNumber: '58', unionCouncilFull: '58. KOTLA ZAREEF KHAN', ucName: 'KOTLA ZAREEF KHAN', tehsil: 'Shorkot' },
  { ucSortNum: 59, ucNumber: '59', unionCouncilFull: '59. CHAK NO. 03 GAGH', ucName: 'CHAK NO. 03 GAGH', tehsil: 'Shorkot' },
  { ucSortNum: 60, ucNumber: '60', unionCouncilFull: '60. Khaki Lakhi', ucName: 'Khaki Lakhi', tehsil: 'Shorkot' },
  { ucSortNum: 61, ucNumber: '61', unionCouncilFull: '61. KAKI NAU DOIM', ucName: 'KAKI NAU DOIM', tehsil: 'Shorkot' },
  { ucSortNum: 62, ucNumber: '62', unionCouncilFull: '62. KAKI NAU SOIM', ucName: 'KAKI NAU SOIM', tehsil: 'Shorkot' },
  { ucSortNum: 63, ucNumber: '63', unionCouncilFull: '63. Dab Kalan', ucName: 'Dab Kalan', tehsil: 'Shorkot' },
  { ucSortNum: 64, ucNumber: '64', unionCouncilFull: '64. GHUMAN MARI', ucName: 'GHUMAN MARI', tehsil: 'Shorkot' },
  { ucSortNum: 65, ucNumber: '65', unionCouncilFull: '65. HASSU BALAIL', ucName: 'HASSU BALAIL', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 66, ucNumber: '66', unionCouncilFull: '66. FATEH PUR PARETY', ucName: 'FATEH PUR PARETY', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 67, ucNumber: '67', unionCouncilFull: '67. KOT BAHADUR SHAH', ucName: 'KOT BAHADUR SHAH', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 68, ucNumber: '68', unionCouncilFull: '68. MIR MUHAMAD', ucName: 'MIR MUHAMAD', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 69, ucNumber: '69', unionCouncilFull: '69. DORI GONDAL', ucName: 'DORI GONDAL', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 70, ucNumber: '70', unionCouncilFull: '70. KOT MAPAL', ucName: 'KOT MAPAL', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 71, ucNumber: '71', unionCouncilFull: '71. MEHMOOD KOT', ucName: 'MEHMOOD KOT', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 72, ucNumber: '72', unionCouncilFull: '72. GADARA', ucName: 'GADARA', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 73, ucNumber: '73', unionCouncilFull: '73. JAIWAN', ucName: 'JAIWAN', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 74, ucNumber: '74', unionCouncilFull: '74. HAZRAT SULTAN BAHOO', ucName: 'HAZRAT SULTAN BAHOO', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 75, ucNumber: '75', unionCouncilFull: '75. KAPOORI', ucName: 'KAPOORI', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 76, ucNumber: '76', unionCouncilFull: '76. PIR ABDUL REHMAN', ucName: 'PIR ABDUL REHMAN', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 77, ucNumber: '77', unionCouncilFull: '77. KUNDAL KHOKHRAN', ucName: 'KUNDAL KHOKHRAN', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 78, ucNumber: '78', unionCouncilFull: '78. RANJEET KOT', ucName: 'RANJEET KOT', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 79, ucNumber: '79', unionCouncilFull: '79. SAMANDOANA', ucName: 'SAMANDOANA', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 80, ucNumber: '80', unionCouncilFull: '80. BANGLA YASMEEN', ucName: 'BANGLA YASMEEN', tehsil: 'Ahmad Pur Sial' },
  { ucSortNum: 81, ucNumber: '81', unionCouncilFull: '81. KOT MURAD', ucName: 'KOT MURAD', tehsil: '18-Hazari' },
  { ucSortNum: 82, ucNumber: '82', unionCouncilFull: '82. RODU SULTAN', ucName: 'RODU SULTAN', tehsil: '18-Hazari' },
  { ucSortNum: 83, ucNumber: '83', unionCouncilFull: '83. UCH GUL IMAM', ucName: 'UCH GUL IMAM', tehsil: '18-Hazari' },
  { ucSortNum: 84, ucNumber: '84', unionCouncilFull: '84. JABOANA', ucName: 'JABOANA', tehsil: '18-Hazari' },
  { ucSortNum: 85, ucNumber: '85', unionCouncilFull: '85. RASHIDPUR', ucName: 'RASHIDPUR', tehsil: '18-Hazari' },
  { ucSortNum: 86, ucNumber: '86', unionCouncilFull: '86. WASU ASTANA', ucName: 'WASU ASTANA', tehsil: '18-Hazari' },
  { ucSortNum: 87, ucNumber: '87', unionCouncilFull: '87. CHAK 7/2 THAL JANUBI', ucName: 'CHAK 7/2 THAL JANUBI', tehsil: '18-Hazari' },
  { ucSortNum: 88, ucNumber: '88', unionCouncilFull: '88. DOSSA', ucName: 'DOSSA', tehsil: '18-Hazari' },
  { ucSortNum: 89, ucNumber: '89', unionCouncilFull: '89. CHAK 7/1 THAL JANOBI', ucName: 'CHAK 7/1 THAL JANOBI', tehsil: '18-Hazari' },
  { ucSortNum: 90, ucNumber: '90', unionCouncilFull: '90. 7/2 THAL SHUMALI', ucName: '7/2 THAL SHUMALI', tehsil: '18-Hazari' },
  { ucSortNum: 91, ucNumber: '91', unionCouncilFull: '91. MARI SHAH SAKHERA', ucName: 'MARI SHAH SAKHERA', tehsil: '18-Hazari' },
];

export interface ChakMouzaGroup {
  groupKey: string;
  index: number;
  indexInUc: number;
  tehsil: string;
  ucNumber: string;
  ucSortNum: number;
  ucName: string;
  unionCouncilFull: string;
  chakMouza: string;
  submissionCount: number; // Total Entries for this Chak/Mouza
  timestamps: string[];
  latestDate: string;
  photos: GpsPhoto[]; // Total GPS Photos = photos.length
}

export interface UnionCouncilHierarchyGroup {
  ucIndex: number;
  ucNumber: string;
  ucSortNum: number;
  ucName: string;
  unionCouncilFull: string;
  tehsil: string;
  totalEntries: number;
  totalPhotos: number;
  hasUploadedSurvey: boolean;
  chakGroups: ChakMouzaGroup[];
}

export interface ExportProgress {
  phase: 'grouping' | 'images' | 'building' | 'complete';
  completed: number;
  total: number;
  message: string;
}

function parseUcSortNumber(ucNumber: string, unionCouncilRaw: string): number {
  const parsed = parseInt(ucNumber, 10);
  if (!Number.isNaN(parsed)) return parsed;
  const match = unionCouncilRaw.match(/^(\d+)/);
  if (match) return parseInt(match[1], 10);
  return 9999;
}

function compareByUnionCouncilAsc(
  a: {
    ucNumber: string;
    unionCouncilRaw: string;
    chakMouzaClean: string;
    sortTimestamp: number;
  },
  b: {
    ucNumber: string;
    unionCouncilRaw: string;
    chakMouzaClean: string;
    sortTimestamp: number;
  }
): number {
  const numA = parseUcSortNumber(a.ucNumber, a.unionCouncilRaw);
  const numB = parseUcSortNumber(b.ucNumber, b.unionCouncilRaw);
  if (numA !== numB) return numA - numB;

  const ucCmp = a.unionCouncilRaw.localeCompare(b.unionCouncilRaw, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  if (ucCmp !== 0) return ucCmp;

  const chakCmp = a.chakMouzaClean.localeCompare(b.chakMouzaClean, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
  if (chakCmp !== 0) return chakCmp;

  return a.sortTimestamp - b.sortTimestamp;
}

export function buildChakMouzaGroups(
  records: SurveyRecord[],
  mode: GroupingMode = 'consolidated-chak'
): ChakMouzaGroup[] {
  const sorted = [...records].sort(compareByUnionCouncilAsc);

  if (mode === 'by-submission') {
    const ucCounterMap = new Map<number, number>();
    return sorted.map((r, idx) => {
      const sortNum = parseUcSortNumber(r.ucNumber, r.unionCouncilRaw);
      const inUcIdx = (ucCounterMap.get(sortNum) || 0) + 1;
      ucCounterMap.set(sortNum, inUcIdx);

      return {
        groupKey: r.id,
        index: idx + 1,
        indexInUc: inUcIdx,
        tehsil: r.tehsil,
        ucNumber: r.ucNumber,
        ucSortNum: sortNum,
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
      };
    });
  }

  const groupMap = new Map<string, ChakMouzaGroup>();

  for (const r of sorted) {
    const sortNum = parseUcSortNumber(r.ucNumber, r.unionCouncilRaw);
    const normalizedChak = r.chakMouzaClean.trim().toLowerCase();
    const key = `${sortNum}_${r.unionCouncilRaw
      .trim()
      .toLowerCase()}||${normalizedChak}`;

    const existing = groupMap.get(key);
    if (!existing) {
      groupMap.set(key, {
        groupKey: key,
        index: groupMap.size + 1,
        indexInUc: 1,
        tehsil: r.tehsil,
        ucNumber: r.ucNumber,
        ucSortNum: sortNum,
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

  const finalGroups = Array.from(groupMap.values()).sort((a, b) => {
    if (a.ucSortNum !== b.ucSortNum) return a.ucSortNum - b.ucSortNum;
    const ucCmp = a.unionCouncilFull.localeCompare(
      b.unionCouncilFull,
      undefined,
      { numeric: true, sensitivity: 'base' }
    );
    if (ucCmp !== 0) return ucCmp;
    return a.chakMouza.localeCompare(b.chakMouza, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

  const ucCounters = new Map<number, number>();
  return finalGroups.map((g, i) => {
    const inUc = (ucCounters.get(g.ucSortNum) || 0) + 1;
    ucCounters.set(g.ucSortNum, inUc);
    return {
      ...g,
      index: i + 1,
      indexInUc: inUc,
    };
  });
}

/**
 * Builds the complete Hierarchical Tree of all 91 Union Councils (01 to 91) in ascending order,
 * including missing Union Councils that have not uploaded any survey yet (0 Entries, 0 GPS Photos).
 */
export function buildUnionCouncilHierarchy(
  records: SurveyRecord[],
  mode: GroupingMode = 'consolidated-chak',
  includeMissingUcs = true
): UnionCouncilHierarchyGroup[] {
  const flatGroups = buildChakMouzaGroups(records, mode);
  const ucMap = new Map<number, UnionCouncilHierarchyGroup>();

  // 1. Seed with all 91 official Union Councils so missing UCs (with 0 surveys) are included
  if (includeMissingUcs) {
    for (const masterUc of ALL_DISTRICT_JHANG_UCS) {
      ucMap.set(masterUc.ucSortNum, {
        ucIndex: masterUc.ucSortNum,
        ucNumber: masterUc.ucNumber,
        ucSortNum: masterUc.ucSortNum,
        ucName: masterUc.ucName,
        unionCouncilFull: masterUc.unionCouncilFull,
        tehsil: masterUc.tehsil,
        totalEntries: 0,
        totalPhotos: 0,
        hasUploadedSurvey: false,
        chakGroups: [],
      });
    }
  }

  // 2. Populate uploaded survey Chak/Mouza records into their respective Union Council
  for (const g of flatGroups) {
    const existing = ucMap.get(g.ucSortNum);
    if (!existing) {
      ucMap.set(g.ucSortNum, {
        ucIndex: ucMap.size + 1,
        ucNumber: g.ucNumber,
        ucSortNum: g.ucSortNum,
        ucName: g.ucName,
        unionCouncilFull: g.unionCouncilFull,
        tehsil: g.tehsil,
        totalEntries: g.submissionCount,
        totalPhotos: g.photos.length,
        hasUploadedSurvey: true,
        chakGroups: [g],
      });
    } else {
      // Prefer Tehsil/Name from uploaded survey if present
      if (g.tehsil) existing.tehsil = g.tehsil;
      if (g.unionCouncilFull) existing.unionCouncilFull = g.unionCouncilFull;
      existing.totalEntries += g.submissionCount;
      existing.totalPhotos += g.photos.length;
      existing.hasUploadedSurvey = true;
      existing.chakGroups.push(g);
    }
  }

  return Array.from(ucMap.values())
    .sort((a, b) => {
      if (a.ucSortNum !== b.ucSortNum) return a.ucSortNum - b.ucSortNum;
      return a.unionCouncilFull.localeCompare(b.unionCouncilFull, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    })
    .map((uc, idx) => ({
      ...uc,
      ucIndex: idx + 1,
    }));
}

/**
 * 1. EXPORT HIERARCHICAL REPORT ONLY AS PDF (.pdf)
 * Sorted by Union Council in ASCENDING order (01 to 91), including missing Union Councils
 * that have not uploaded any survey, with Chak/Mouza, Total Entries, Total GPS Photos,
 * and clickable Picture1, Picture2, ... links. (No extra photo pages).
 */
export async function exportReportAsPdf(
  records: SurveyRecord[],
  mode: GroupingMode = 'consolidated-chak',
  onProgress?: (progress: ExportProgress) => void,
  includeMissingUcs = true
): Promise<void> {
  onProgress?.({
    phase: 'building',
    completed: 1,
    total: 2,
    message: 'Generating Hierarchical PDF Report (All Union Councils in Ascending Order)...',
  });

  const ucHierarchy = buildUnionCouncilHierarchy(
    records,
    mode,
    includeMissingUcs
  );
  const uploadedUcsCount = ucHierarchy.filter((u) => u.hasUploadedSurvey).length;
  const missingUcsCount = ucHierarchy.length - uploadedUcsCount;
  const totalChaks = ucHierarchy.reduce((a, u) => a + u.chakGroups.length, 0);
  const totalEntries = ucHierarchy.reduce((a, u) => a + u.totalEntries, 0);
  const totalPhotos = ucHierarchy.reduce((a, u) => a + u.totalPhotos, 0);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 12;

  // Title Banner on Page 1
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text(
    'DISTRICT JHANG FIELD SURVEY — HIERARCHICAL REPORT (UNION COUNCIL ASCENDING)',
    margin,
    17
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    `All ${ucHierarchy.length} Union Councils (UC-01 to UC-91) · Uploaded UCs: ${uploadedUcsCount} · Missing UCs (No Survey): ${missingUcsCount} · Generated: ${new Date().toLocaleString()}`,
    margin,
    27.5
  );

  // 4 KPI Summary Cards
  const kpis = [
    {
      label: 'TOTAL UNION COUNCILS (ASC)',
      value: `${ucHierarchy.length} Total (${uploadedUcsCount} Uploaded · ${missingUcsCount} Missing)`,
    },
    {
      label: 'SURVEYED CHAKS / MOUZAS',
      value: `${totalChaks} Chaks / Mouzas`,
    },
    {
      label: 'TOTAL SURVEY ENTRIES',
      value: `${totalEntries} Total Entries`,
    },
    {
      label: 'TOTAL GPS PHOTOS',
      value: `${totalPhotos} Photos (Picture1, Picture2…)`,
    },
  ];

  const boxWidth = (pageWidth - margin * 2 - 12) / 4;
  kpis.forEach((kpi, idx) => {
    const bx = margin + idx * (boxWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(bx, 41, boxWidth, 19, 2, 2, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(kpi.label, bx + 4, 47.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const valText = doc.splitTextToSize(kpi.value, boxWidth - 8);
    doc.text(valText[0], bx + 4, 55.5);
  });

  const drawHierarchyTableHeader = (yPos: number): number => {
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.setDrawColor(15, 23, 42);
    doc.rect(margin, yPos, pageWidth - margin * 2, 8.5, 'FD');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(
      'Union Council (Asc) / Chak-Mouza Hierarchy',
      margin + 3,
      yPos + 5.7
    );
    doc.text('Tehsil', margin + 92, yPos + 5.7);
    doc.text('Total Entries', margin + 125, yPos + 5.7);
    doc.text('Total GPS Photos', margin + 150, yPos + 5.7);
    doc.text(
      'Picture Links (Picture1, Picture2, ...)',
      margin + 182,
      yPos + 5.7
    );
    return yPos + 8.5;
  };

  let curY = drawHierarchyTableHeader(65);

  for (const uc of ucHierarchy) {
    if (curY > pageHeight - 24) {
      doc.addPage();
      curY = drawHierarchyTableHeader(14);
    }

    if (!uc.hasUploadedSurvey) {
      // --- MISSING UNION COUNCIL ROW (0 SURVEYS UPLOADED) ---
      doc.setFillColor(254, 242, 242); // Rose-50 tint for missing UC
      doc.setDrawColor(254, 205, 211); // Rose-200
      doc.rect(margin, curY, pageWidth - margin * 2, 7.2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(159, 18, 57); // Rose-800
      doc.text(`UC ${uc.unionCouncilFull}`, margin + 3, curY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(uc.tehsil, margin + 92, curY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(159, 18, 57);
      doc.text('0', margin + 134, curY + 5);
      doc.text('0', margin + 160, curY + 5);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(159, 18, 57);
      doc.text(
        'No Survey Uploaded (0 Chaks/Mouzas · 0 Entries · 0 GPS Photos)',
        margin + 182,
        curY + 5
      );

      curY += 7.2;
      continue;
    }

    // --- LEVEL 1: UPLOADED UNION COUNCIL HIERARCHY BANNER ROW ---
    doc.setFillColor(240, 253, 250); // Teal-50
    doc.setDrawColor(153, 246, 228); // Teal-200
    doc.rect(margin, curY, pageWidth - margin * 2, 7.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(15, 118, 110); // Teal-700
    doc.text(
      `UC ${uc.unionCouncilFull}  (${uc.chakGroups.length} ${
        uc.chakGroups.length === 1 ? 'Chak/Mouza' : 'Chaks/Mouzas'
      })`,
      margin + 3,
      curY + 5.2
    );

    doc.setTextColor(30, 41, 59);
    doc.text(uc.tehsil, margin + 92, curY + 5.2);
    doc.text(String(uc.totalEntries), margin + 134, curY + 5.2);
    doc.setTextColor(15, 118, 110);
    doc.text(String(uc.totalPhotos), margin + 160, curY + 5.2);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `UC Subtotal: ${uc.totalEntries} Entries · ${uc.totalPhotos} GPS Photos`,
      margin + 182,
      curY + 5.2
    );

    curY += 7.5;

    // --- LEVEL 2: INDENTED CHAK / MOUZA ROWS UNDER THIS UNION COUNCIL ---
    for (let cIdx = 0; cIdx < uc.chakGroups.length; cIdx++) {
      const chak = uc.chakGroups[cIdx];
      const isLastChild = cIdx === uc.chakGroups.length - 1;
      const treeBranch = isLastChild ? 'L-- ' : '|-- ';

      const linksPerLine = 6;
      const linkLinesCount = Math.max(
        1,
        Math.ceil(chak.photos.length / linksPerLine)
      );
      const rowHeight = Math.max(7, linkLinesCount * 5 + 2);

      if (curY + rowHeight > pageHeight - 14) {
        doc.addPage();
        curY = drawHierarchyTableHeader(14);
      }

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, curY, pageWidth - margin * 2, rowHeight, 'FD');

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(treeBranch, margin + 6, curY + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const chakLabel =
        chak.chakMouza.length > 38
          ? chak.chakMouza.slice(0, 36) + '…'
          : chak.chakMouza;
      doc.text(chakLabel, margin + 14, curY + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(chak.tehsil, margin + 92, curY + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(chak.submissionCount), margin + 134, curY + 4.8);

      doc.setTextColor(15, 118, 110);
      doc.text(String(chak.photos.length), margin + 160, curY + 4.8);

      // Clickable Picture1, Picture2, Picture3... Links
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const linkStartX = margin + 182;
      let lx = linkStartX;
      let ly = curY + 4.8;

      chak.photos.forEach((photo, pIdx) => {
        if (pIdx > 0 && pIdx % linksPerLine === 0) {
          lx = linkStartX;
          ly += 4.8;
        }
        const label = `Picture${pIdx + 1}`;
        doc.setTextColor(15, 118, 110);
        doc.textWithLink(label, lx, ly, { url: photo.originalUrl });
        const labelW = doc.getTextWidth(label);

        if (pIdx < chak.photos.length - 1) {
          doc.setTextColor(100, 116, 139);
          doc.text(', ', lx + labelW, ly);
          lx += labelW + doc.getTextWidth(', ') + 0.5;
        } else {
          lx += labelW;
        }
      });

      curY += rowHeight;
    }
  }

  // Grand Total Row at end of Hierarchical Report
  if (curY + 9 > pageHeight - 14) {
    doc.addPage();
    curY = 16;
  }
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, curY, pageWidth - margin * 2, 8.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `GRAND TOTAL (${ucHierarchy.length} Total UCs · ${uploadedUcsCount} Uploaded · ${missingUcsCount} Missing · ${totalChaks} Chaks/Mouzas)`,
    margin + 3,
    curY + 5.7
  );
  doc.text(String(totalEntries), margin + 134, curY + 5.7);
  doc.setTextColor(94, 234, 212);
  doc.text(String(totalPhotos), margin + 160, curY + 5.7);

  doc.save(
    `Jhang_Survey_Hierarchical_Report_All_${ucHierarchy.length}_UCs.pdf`
  );

  onProgress?.({
    phase: 'complete',
    completed: 2,
    total: 2,
    message: 'Hierarchical PDF Report downloaded!',
  });
}

/**
 * 2. EXPORT HIERARCHICAL REPORT ONLY AS POWERPOINT (.pptx)
 * Sorted by Union Council in ASCENDING order (01 to 91), including missing Union Councils
 * that have not uploaded any survey, with Chak/Mouza, Total Entries, Total GPS Photos,
 * and clickable Picture1, Picture2, ... links. (No extra photo slides).
 */
export async function exportReportAsPptx(
  records: SurveyRecord[],
  mode: GroupingMode = 'consolidated-chak',
  onProgress?: (progress: ExportProgress) => void,
  includeMissingUcs = true
): Promise<void> {
  onProgress?.({
    phase: 'building',
    completed: 1,
    total: 2,
    message: 'Building Hierarchical PowerPoint Report (All Union Councils Asc)...',
  });

  const ucHierarchy = buildUnionCouncilHierarchy(
    records,
    mode,
    includeMissingUcs
  );
  const uploadedUcsCount = ucHierarchy.filter((u) => u.hasUploadedSurvey).length;
  const missingUcsCount = ucHierarchy.length - uploadedUcsCount;
  const totalChaks = ucHierarchy.reduce((a, u) => a + u.chakGroups.length, 0);
  const totalEntries = ucHierarchy.reduce((a, u) => a + u.totalEntries, 0);
  const totalPhotos = ucHierarchy.reduce((a, u) => a + u.totalPhotos, 0);

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
  pptx.author = 'Jhang Field Survey Portal';
  pptx.company = 'District Jhang Field Operations';
  pptx.subject = 'Hierarchical Union Council (Ascending) & Chak/Mouza Survey Report';
  pptx.title = 'District Jhang Hierarchical GPS Survey Report';

  interface HierarchyTableRowItem {
    type: 'uc-uploaded' | 'uc-missing' | 'chak';
    uc?: UnionCouncilHierarchyGroup;
    chak?: ChakMouzaGroup;
    isLastInUc?: boolean;
  }

  const hierarchyItems: HierarchyTableRowItem[] = [];
  for (const uc of ucHierarchy) {
    if (!uc.hasUploadedSurvey) {
      hierarchyItems.push({ type: 'uc-missing', uc });
    } else {
      hierarchyItems.push({ type: 'uc-uploaded', uc });
      uc.chakGroups.forEach((chak, idx) => {
        hierarchyItems.push({
          type: 'chak',
          chak,
          isLastInUc: idx === uc.chakGroups.length - 1,
        });
      });
    }
  }

  const itemsPerTableSlide = 12;
  const totalTableSlides = Math.max(
    1,
    Math.ceil(hierarchyItems.length / itemsPerTableSlide)
  );

  for (let tSlideIdx = 0; tSlideIdx < totalTableSlides; tSlideIdx++) {
    const tSlide = pptx.addSlide();
    tSlide.background = { color: 'F8FAFC' };

    tSlide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.9,
      fill: { color: '0F172A' },
    });

    tSlide.addText(
      `HIERARCHICAL REPORT (UNION COUNCIL ASCENDING: ALL ${ucHierarchy.length} UCs) — SLIDE ${
        tSlideIdx + 1
      } OF ${totalTableSlides}`,
      {
        x: 0.4,
        y: 0.1,
        w: 12.5,
        h: 0.28,
        fontSize: 10,
        bold: true,
        color: '5EEAD4',
      }
    );

    tSlide.addText(
      `Uploaded UCs: ${uploadedUcsCount} · Missing UCs (No Survey): ${missingUcsCount} · Chaks/Mouzas: ${totalChaks} · Total Entries: ${totalEntries} · Total GPS Photos: ${totalPhotos}`,
      {
        x: 0.4,
        y: 0.38,
        w: 12.5,
        h: 0.4,
        fontSize: 13.5,
        bold: true,
        color: 'FFFFFF',
      }
    );

    const slice = hierarchyItems.slice(
      tSlideIdx * itemsPerTableSlide,
      (tSlideIdx + 1) * itemsPerTableSlide
    );

    const tableRows: PptxGenJS.TableRow[] = [
      [
        {
          text: 'Union Council (Asc) / Chak-Mouza Hierarchy',
          options: {
            bold: true,
            fill: { color: '1E293B' },
            color: 'FFFFFF',
            fontSize: 9.5,
          },
        },
        {
          text: 'Tehsil',
          options: {
            bold: true,
            fill: { color: '1E293B' },
            color: 'FFFFFF',
            fontSize: 9.5,
          },
        },
        {
          text: 'Total Entries',
          options: {
            bold: true,
            fill: { color: '1E293B' },
            color: 'FFFFFF',
            fontSize: 9.5,
            align: 'center',
          },
        },
        {
          text: 'Total GPS Photos',
          options: {
            bold: true,
            fill: { color: '1E293B' },
            color: 'FFFFFF',
            fontSize: 9.5,
            align: 'center',
          },
        },
        {
          text: 'Picture Links (Picture1, Picture2, ...)',
          options: {
            bold: true,
            fill: { color: '1E293B' },
            color: 'FFFFFF',
            fontSize: 9.5,
          },
        },
      ],
    ];

    for (const item of slice) {
      if (item.type === 'uc-missing' && item.uc) {
        const u = item.uc;
        tableRows.push([
          {
            text: `UC ${u.unionCouncilFull}`,
            options: {
              bold: true,
              fill: { color: 'FFF1F2' },
              color: '9F1239',
              fontSize: 9,
            },
          },
          {
            text: u.tehsil,
            options: {
              fill: { color: 'FFF1F2' },
              color: '475569',
              fontSize: 9,
            },
          },
          {
            text: '0',
            options: {
              bold: true,
              fill: { color: 'FFF1F2' },
              color: '9F1239',
              fontSize: 9,
              align: 'center',
            },
          },
          {
            text: '0',
            options: {
              bold: true,
              fill: { color: 'FFF1F2' },
              color: '9F1239',
              fontSize: 9,
              align: 'center',
            },
          },
          {
            text: 'No Survey Uploaded (0 Entries · 0 GPS Photos)',
            options: {
              italic: true,
              fill: { color: 'FFF1F2' },
              color: '9F1239',
              fontSize: 8.5,
            },
          },
        ]);
      } else if (item.type === 'uc-uploaded' && item.uc) {
        const u = item.uc;
        tableRows.push([
          {
            text: `▼ UC ${u.unionCouncilFull} (${u.chakGroups.length} Chak/Mouza)`,
            options: {
              bold: true,
              fill: { color: 'CCFBF1' },
              color: '115E59',
              fontSize: 9.5,
            },
          },
          {
            text: u.tehsil,
            options: {
              bold: true,
              fill: { color: 'CCFBF1' },
              color: '0F172A',
              fontSize: 9.5,
            },
          },
          {
            text: String(u.totalEntries),
            options: {
              bold: true,
              fill: { color: 'CCFBF1' },
              color: '0F172A',
              fontSize: 9.5,
              align: 'center',
            },
          },
          {
            text: String(u.totalPhotos),
            options: {
              bold: true,
              fill: { color: 'CCFBF1' },
              color: '115E59',
              fontSize: 9.5,
              align: 'center',
            },
          },
          {
            text: `Union Council Subtotal: ${u.totalEntries} Entries · ${u.totalPhotos} GPS Photos`,
            options: {
              italic: true,
              fill: { color: 'CCFBF1' },
              color: '334155',
              fontSize: 9,
            },
          },
        ]);
      } else if (item.type === 'chak' && item.chak) {
        const c = item.chak;
        const prefix = item.isLastInUc ? '    └─ ' : '    ├─ ';

        const linkParts: PptxGenJS.TextProps[] = [];
        c.photos.forEach((p, idx) => {
          linkParts.push({
            text: `Picture${idx + 1}`,
            options: {
              color: '0F766E',
              bold: true,
              underline: { style: 'sng' },
              hyperlink: {
                url: p.originalUrl,
                tooltip: `Open Picture${idx + 1} (${c.chakMouza})`,
              },
            },
          });
          if (idx < c.photos.length - 1) {
            linkParts.push({
              text: ', ',
              options: { color: '64748B', bold: false },
            });
          }
        });

        tableRows.push([
          {
            text: `${prefix}${c.chakMouza}`,
            options: {
              bold: true,
              fill: { color: 'FFFFFF' },
              color: '0F172A',
              fontSize: 9,
            },
          },
          {
            text: c.tehsil,
            options: {
              fill: { color: 'FFFFFF' },
              color: '475569',
              fontSize: 9,
            },
          },
          {
            text: String(c.submissionCount),
            options: {
              bold: true,
              fill: { color: 'FFFFFF' },
              color: '0F172A',
              fontSize: 9,
              align: 'center',
            },
          },
          {
            text: String(c.photos.length),
            options: {
              bold: true,
              fill: { color: 'FFFFFF' },
              color: '0F766E',
              fontSize: 9,
              align: 'center',
            },
          },
          {
            text: linkParts,
            options: {
              fill: { color: 'FFFFFF' },
              fontSize: 8.5,
            },
          },
        ]);
      }
    }

    tSlide.addTable(tableRows, {
      x: 0.4,
      y: 1.05,
      w: 12.53,
      colW: [4.2, 1.5, 1.25, 1.35, 4.23],
      border: { type: 'solid', pt: 0.5, color: 'CBD5E1' },
      rowH: 0.42,
      valign: 'middle',
    });
  }

  await pptx.writeFile({
    fileName: `Jhang_Survey_Hierarchical_Report_All_${ucHierarchy.length}_UCs.pptx`,
  });

  onProgress?.({
    phase: 'complete',
    completed: 2,
    total: 2,
    message: 'Hierarchical PowerPoint (.pptx) downloaded!',
  });
}

/**
 * 3. EXPORT HIERARCHICAL REPORT ONLY AS MS EXCEL (.xlsx)
 * Single worksheet sorted by Union Council in ASCENDING order (01 to 91),
 * including missing Union Councils that have not uploaded any survey, with
 * Chak/Mouza, Total Entries, Total GPS Photos, and clickable Picture1, Picture2, ... links.
 */
export async function exportReportAsExcel(
  records: SurveyRecord[],
  mode: GroupingMode = 'consolidated-chak',
  onProgress?: (progress: ExportProgress) => void,
  includeMissingUcs = true
): Promise<void> {
  onProgress?.({
    phase: 'building',
    completed: 1,
    total: 2,
    message: 'Generating Hierarchical MS Excel Report (All Union Councils Asc)...',
  });

  const ucHierarchy = buildUnionCouncilHierarchy(
    records,
    mode,
    includeMissingUcs
  );
  const flatGroups = ucHierarchy.flatMap((uc) => uc.chakGroups);
  const uploadedUcsCount = ucHierarchy.filter((u) => u.hasUploadedSurvey).length;
  const missingUcsCount = ucHierarchy.length - uploadedUcsCount;

  const maxPhotosInAnyGroup = Math.max(
    1,
    ...flatGroups.map((g) => g.photos.length)
  );
  const totalEntries = ucHierarchy.reduce((a, u) => a + u.totalEntries, 0);
  const totalPhotos = ucHierarchy.reduce((a, u) => a + u.totalPhotos, 0);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Jhang Field Survey Portal';
  workbook.created = new Date();

  const hSheet = workbook.addWorksheet('Hierarchical Report (UC Asc)', {
    views: [{ state: 'frozen', xSplit: 3, ySplit: 3 }],
  });

  const totalCols = 5 + maxPhotosInAnyGroup;

  // Title Row
  hSheet.mergeCells(1, 1, 1, totalCols);
  const hTitle = hSheet.getCell(1, 1);
  hTitle.value = `DISTRICT JHANG FIELD SURVEY — HIERARCHICAL REPORT SORTED BY UNION COUNCIL (ASCENDING: ALL ${ucHierarchy.length} UCs)`;
  hTitle.font = {
    name: 'Calibri',
    size: 13,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  hTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' },
  };
  hTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  hSheet.getRow(1).height = 30;

  // Subtitle Row
  hSheet.mergeCells(2, 1, 2, totalCols);
  const hSub = hSheet.getCell(2, 1);
  hSub.value = `Total UCs: ${ucHierarchy.length} (Uploaded Survey: ${uploadedUcsCount} UCs · Missing/No Survey: ${missingUcsCount} UCs) · Surveyed Chaks/Mouzas: ${flatGroups.length} · Total Entries: ${totalEntries} · Total GPS Photos: ${totalPhotos}`;
  hSub.font = {
    name: 'Calibri',
    size: 10,
    italic: true,
    color: { argb: 'FF334155' },
  };
  hSub.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  hSub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  hSheet.getRow(2).height = 22;

  // Header Row
  const hBaseHeaders = [
    'Union Council (Asc)',
    'Tehsil',
    'Chak / Mouza (Hierarchy)',
    'Total Entries',
    'Total GPS Photos',
  ];
  const hPhotoHeaders = Array.from(
    { length: maxPhotosInAnyGroup },
    (_, i) => `Picture${i + 1}`
  );
  const hAllHeaders = [...hBaseHeaders, ...hPhotoHeaders];

  const hHeaderRow = hSheet.getRow(3);
  hAllHeaders.forEach((label, idx) => {
    const cell = hHeaderRow.getCell(idx + 1);
    cell.value = label;
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
      horizontal: idx >= 3 ? 'center' : 'left',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });
  hHeaderRow.height = 26;

  hSheet.getColumn(1).width = 32; // Union Council (Asc)
  hSheet.getColumn(2).width = 18; // Tehsil
  hSheet.getColumn(3).width = 36; // Chak / Mouza
  hSheet.getColumn(4).width = 15; // Total Entries
  hSheet.getColumn(5).width = 17; // Total GPS Photos
  for (let pCol = 0; pCol < maxPhotosInAnyGroup; pCol++) {
    hSheet.getColumn(6 + pCol).width = 14; // Picture1, Picture2...
  }

  let currentExcelRow = 4;

  for (const uc of ucHierarchy) {
    if (!uc.hasUploadedSurvey) {
      // --- MISSING UNION COUNCIL ROW (0 SURVEYS UPLOADED) ---
      const missingRow = hSheet.getRow(currentExcelRow++);
      missingRow.height = 22;

      missingRow.getCell(1).value = `UC ${uc.unionCouncilFull}`;
      missingRow.getCell(2).value = uc.tehsil;
      missingRow.getCell(3).value = 'No Survey Uploaded (Not Received)';
      missingRow.getCell(4).value = 0;
      missingRow.getCell(5).value = 0;
      missingRow.getCell(6).value = '—';

      for (let c = 1; c <= totalCols; c++) {
        const cell = missingRow.getCell(c);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF1F2' }, // Rose-50
        };
        cell.font = {
          name: 'Calibri',
          size: 10.5,
          bold: c === 1 || c === 4 || c === 5,
          italic: c === 3,
          color: { argb: c === 2 ? 'FF475569' : 'FF9F1239' },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: c >= 4 ? 'center' : 'left',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFFECDD3' } },
          bottom: { style: 'thin', color: { argb: 'FFFECDD3' } },
          left: { style: 'thin', color: { argb: 'FFFECDD3' } },
          right: { style: 'thin', color: { argb: 'FFFECDD3' } },
        };
      }
      continue;
    }

    // --- LEVEL 1: UPLOADED UNION COUNCIL PARENT HIERARCHY ROW ---
    const ucRow = hSheet.getRow(currentExcelRow++);
    ucRow.height = 24;

    ucRow.getCell(1).value = `▼ UC ${uc.unionCouncilFull}`;
    ucRow.getCell(2).value = uc.tehsil;
    ucRow.getCell(3).value = `${uc.chakGroups.length} ${
      uc.chakGroups.length === 1 ? 'Chak / Mouza' : 'Chaks / Mouzas'
    } Uploaded`;
    ucRow.getCell(4).value = uc.totalEntries;
    ucRow.getCell(5).value = uc.totalPhotos;

    for (let c = 1; c <= totalCols; c++) {
      const cell = ucRow.getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCFBF1' }, // Teal-100
      };
      cell.font = {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: c === 1 || c === 5 ? 'FF115E59' : 'FF0F172A' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: c === 4 || c === 5 ? 'center' : 'left',
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF0D9488' } },
        bottom: { style: 'thin', color: { argb: 'FF0D9488' } },
        left: { style: 'thin', color: { argb: 'FF99F6E4' } },
        right: { style: 'thin', color: { argb: 'FF99F6E4' } },
      };
    }

    // --- LEVEL 2: INDENTED CHAK / MOUZA CHILD ROWS ---
    uc.chakGroups.forEach((chak, idx) => {
      const isLast = idx === uc.chakGroups.length - 1;
      const branch = isLast ? '    └─ ' : '    ├─ ';
      const cRow = hSheet.getRow(currentExcelRow++);
      cRow.height = 22;

      cRow.getCell(1).value = `    ${uc.unionCouncilFull}`;
      cRow.getCell(2).value = chak.tehsil;
      cRow.getCell(3).value = `${branch}${chak.chakMouza}`;
      cRow.getCell(4).value = chak.submissionCount;
      cRow.getCell(5).value = chak.photos.length;

      for (let c = 1; c <= totalCols; c++) {
        const cell = cRow.getCell(c);
        cell.font = {
          name: 'Calibri',
          size: 10.5,
          bold: c === 3 || c === 4 || c === 5,
          color: {
            argb:
              c === 1
                ? 'FF64748B'
                : c === 5
                ? 'FF0F766E'
                : 'FF0F172A',
          },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: c >= 4 ? 'center' : 'left',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      }

      // Clickable Picture1, Picture2, ... links
      chak.photos.forEach((photo, pIdx) => {
        const pCol = 6 + pIdx;
        const pCell = cRow.getCell(pCol);
        const picLabel = `Picture${pIdx + 1}`;
        pCell.value = {
          text: picLabel,
          hyperlink: photo.originalUrl,
          tooltip: `Open ${picLabel} (${chak.chakMouza} - ${uc.unionCouncilFull})`,
        };
        pCell.font = {
          name: 'Calibri',
          size: 10,
          bold: true,
          underline: true,
          color: { argb: 'FF0F766E' },
        };
        pCell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });
  }

  // Grand Total Row at bottom of Hierarchical Report
  const totalRow = hSheet.getRow(currentExcelRow++);
  totalRow.height = 26;
  totalRow.getCell(1).value = `GRAND TOTAL (${ucHierarchy.length} UCs: ${uploadedUcsCount} Uploaded, ${missingUcsCount} Missing)`;
  totalRow.getCell(2).value = 'All Tehsils';
  totalRow.getCell(3).value = `${flatGroups.length} Surveyed Chaks / Mouzas`;
  totalRow.getCell(4).value = totalEntries;
  totalRow.getCell(5).value = totalPhotos;

  for (let c = 1; c <= totalCols; c++) {
    const cell = totalRow.getCell(c);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' },
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: c === 5 ? 'FF5EEAD4' : 'FFFFFFFF' },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: c === 4 || c === 5 ? 'center' : 'left',
    };
  }

  // Write Buffer & Trigger Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Jhang_Survey_Hierarchical_Report_All_${ucHierarchy.length}_UCs.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  onProgress?.({
    phase: 'complete',
    completed: 2,
    total: 2,
    message: 'MS Excel (.xlsx) Hierarchical Report downloaded!',
  });
}
