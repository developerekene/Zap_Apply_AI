export interface ExperienceDateDetail {
  year: number;
  month: number;
  hasMonth: boolean;
}

export function parseDateDetail(dateStr?: string, isEnd = false, isCurrent = false): ExperienceDateDetail | null {
  if (!dateStr || typeof dateStr !== 'string') {
    if (isEnd && isCurrent) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth(), hasMonth: true };
    }
    return null;
  }

  const s = dateStr.trim().toLowerCase();
  const yearMatch = s.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    for (let m = 0; m < monthNames.length; m++) {
      if (s.includes(monthNames[m])) return { year, month: m, hasMonth: true };
    }
    const slashMatch = s.match(/\b(0?[1-9]|1[0-2])[\/-](?:19\d{2}|20\d{2})\b/);
    if (slashMatch) return { year, month: parseInt(slashMatch[1], 10) - 1, hasMonth: true };
    const dashMatch = s.match(/\b(?:19\d{2}|20\d{2})[\/-](0?[1-9]|1[0-2])\b/);
    if (dashMatch) return { year, month: parseInt(dashMatch[1], 10) - 1, hasMonth: true };

    return { year, month: isEnd ? 11 : 0, hasMonth: false };
  }

  if (isEnd && (isCurrent || s.includes('present') || s.includes('current') || s.includes('now'))) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), hasMonth: true };
  }

  return null;
}

export interface ExperienceAuditResult {
  yearsNum: number;
  text: string;
  formatted: string;
  totalMonths: number;
  earliestYear?: number;
  latestYear?: number;
}

export function calculateTotalYearsOfExperience(
  experiences?: Array<{ startDate?: string; endDate?: string; current?: boolean }>
): ExperienceAuditResult {
  if (!Array.isArray(experiences) || experiences.length === 0) {
    return { yearsNum: 0, text: 'early career', formatted: '0 years', totalMonths: 0 };
  }

  const intervals: Array<{ start: ExperienceDateDetail; end: ExperienceDateDetail; startVal: number; endVal: number }> = [];
  let allYearOnly = true;
  let minYear = Infinity;
  let maxYear = -Infinity;

  for (const exp of experiences) {
    const start = parseDateDetail(exp.startDate, false, false);
    const end = parseDateDetail(exp.endDate, true, exp.current);
    if (start && end) {
      if (start.hasMonth || end.hasMonth) allYearOnly = false;
      minYear = Math.min(minYear, start.year, end.year);
      maxYear = Math.max(maxYear, start.year, end.year);
      let startVal = start.year * 12 + start.month;
      let endVal = end.year * 12 + end.month;
      if (endVal < startVal) endVal = startVal + 1;
      intervals.push({ start, end, startVal, endVal });
    } else if (start && !end) {
      const now = new Date();
      minYear = Math.min(minYear, start.year);
      maxYear = Math.max(maxYear, now.getFullYear());
      intervals.push({
        start,
        end: { year: now.getFullYear(), month: now.getMonth(), hasMonth: true },
        startVal: start.year * 12 + start.month,
        endVal: now.getFullYear() * 12 + now.getMonth()
      });
      allYearOnly = false;
    }
  }

  if (intervals.length === 0) {
    return { yearsNum: 0, text: 'early career', formatted: '0 years', totalMonths: 0 };
  }

  // If all dates are year-only, calculate year range difference
  if (allYearOnly) {
    let totalYearsSimple = 0;
    for (const item of intervals) {
      totalYearsSimple += Math.max(1, item.end.year - item.start.year);
    }
    const span = Math.max(1, maxYear - minYear);
    const finalYears = Math.min(span, totalYearsSimple);
    const text = finalYears === 1 ? '1 year' : `${finalYears} years`;
    return {
      yearsNum: finalYears,
      text,
      formatted: text,
      totalMonths: finalYears * 12,
      earliestYear: minYear !== Infinity ? minYear : undefined,
      latestYear: maxYear !== -Infinity ? maxYear : undefined
    };
  }

  // Calculate merged intervals by months to avoid double-counting overlapping roles
  const sorted = [...intervals].sort((a, b) => a.startVal - b.startVal);
  const merged: Array<[number, number]> = [[sorted[0].startVal, sorted[0].endVal]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = sorted[i];
    if (curr.startVal <= prev[1]) {
      prev[1] = Math.max(prev[1], curr.endVal);
    } else {
      merged.push([curr.startVal, curr.endVal]);
    }
  }

  let totalMonths = 0;
  for (const [startVal, endVal] of merged) {
    totalMonths += (endVal - startVal + 1);
  }

  const rawYears = totalMonths / 12;
  const roundedYears = Math.round(rawYears * 10) / 10;
  const intYears = Math.round(rawYears);

  let text = '';
  if (roundedYears >= 1) {
    if (Math.abs(rawYears - intYears) <= 0.25) {
      text = intYears === 1 ? '1 year' : `${intYears} years`;
    } else {
      text = `${roundedYears} years`;
    }
  } else {
    text = totalMonths <= 1 ? '1 month' : `${totalMonths} months`;
  }

  const finalYearsNum = roundedYears >= 1 ? (Math.abs(rawYears - intYears) <= 0.25 ? intYears : roundedYears) : roundedYears;

  return {
    yearsNum: finalYearsNum,
    text,
    formatted: text,
    totalMonths,
    earliestYear: minYear !== Infinity ? minYear : undefined,
    latestYear: maxYear !== -Infinity ? maxYear : undefined
  };
}

export function sanitizeYearsInText(text: string, correctYearsText: string, correctYearsNum: number): string {
  if (!text) return '';
  let updated = text;

  // 1. If candidate has <= 6 years, replace "over a decade", "a decade", "decade of", "10+ years", "15+ years"
  if (correctYearsNum <= 6 && correctYearsNum > 0) {
    updated = updated.replace(/\b(?:over\s+a\s+decade|a\s+decade|more\s+than\s+a\s+decade|decade\s+of)\b/gi, `${correctYearsText}`);
    updated = updated.replace(/\b(?:1[0-9]|20)\+?\s*years?\s*(?:of\s+experience|of\s+expertise|experience)?\b/gi, `${correctYearsText} of experience`);
  }

  // 2. Look for any explicit "X years of experience" where X differs significantly from correctYearsNum
  if (correctYearsNum > 0) {
    updated = updated.replace(/\b(\d+)\+?\s*years?\s*(?:of\s+experience|of\s+expertise|experience|background)\b/gi, (match, digits) => {
      const n = parseInt(digits, 10);
      if (Math.abs(n - correctYearsNum) >= 2) {
        return `${correctYearsText} of experience`;
      }
      return match;
    });
  }

  return updated;
}
