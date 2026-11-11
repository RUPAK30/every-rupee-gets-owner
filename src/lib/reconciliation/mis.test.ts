import { describe, expect, it } from 'vitest';
import { autoMatch, benchmarkApprovals, benchmarkWorkspace, emptyWorkspace, sampleWorkspace } from './engine';
import { computeMis, misCsv, misFilename } from './mis';

describe('weekly MIS', () => {
  it('returns exactly 8 rows', () => {
    expect(computeMis(autoMatch(sampleWorkspace()), { sealedEntries: 4, intact: true })).toHaveLength(8);
  });
  it('never returns PASS for a KPI with no data', () => {
    const rows = computeMis(emptyWorkspace(), { sealedEntries: 0, intact: true });
    expect(rows.every(r => r.status === 'NO DATA YET')).toBe(true);
  });
  it('fails history when altered and counts batch owners', () => {
    const rows = computeMis(autoMatch(benchmarkWorkspace()), { sealedEntries: 5, intact: false }, new Date('2026-10-20'), benchmarkApprovals());
    expect(rows[7]!.status).toBe('FAIL');
    expect(rows[0]!.value).toMatch(/of/);
  });
  it('CSV has a header plus 8 rows and a dated filename', () => {
    const csv = misCsv(computeMis(sampleWorkspace(), { sealedEntries: 1, intact: true })).split('\n');
    expect(csv[0]).toBe('kpi,value,target,status,proves');
    expect(csv).toHaveLength(9);
    expect(misFilename(new Date('2026-11-11T10:00:00Z'))).toBe('every-rupee-mis-2026-11-11.csv');
  });
});
