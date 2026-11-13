import { describe, it, expect } from 'vitest';
import { autoMatch, sampleWorkspace, sealLog, forceResealLog } from './engine';
import { signWeek, countersign, checkSignoff, collectorPrefill, openItems } from './signoff';
const w = () => autoMatch(sampleWorkspace());
const notes = () => Object.fromEntries(openItems(w()).map(i => [i.id, 'Waiting for evidence']));
describe('weekly sign-off', () => {
  it('requires a note for every open item', async () => { await expect(signWeek(w(), {}, 'Vikram')).rejects.toThrow(/one-line reason/); });
  it('requires a different countersigner', async () => { const { signoff } = await signWeek(w(), notes(), 'Vikram'); await expect(countersign(signoff, 'Vikram')).rejects.toThrow(/cannot countersign/); expect((await countersign(signoff, 'Arjun')).countersignedBy).toBe('Arjun'); });
  it('detects changed checkpoints, permits legitimate appends', async () => {
    const base = w(); base.exceptions[0] = { ...base.exceptions[0], invoiceId: 'INV-101', reason: 'Other', owner: 'Asha', notes: '', resolved: false, log: [{ who: 'Asha', at: '2026-11-13', text: 'Original' }] };
    const { signoff, workspace } = await signWeek(base, notes(), 'Vikram');
    const e = workspace.exceptions.find(e => e.invoiceId === 'INV-101'); if (!e) throw new Error('Missing case');
    e.log = await sealLog(e.invoiceId, [...(e.log ?? []), { who: 'Asha', at: '2026-11-14', text: 'New evidence' }]); expect(await checkSignoff(signoff, workspace)).toEqual([]);
    e.log = await forceResealLog(e.invoiceId, e.log.map((l, i) => i === 0 ? { ...l, text: 'Edited' } : l)); expect(await checkSignoff(signoff, workspace)).toContain('INV-101');
  });
  it('does not guess a past pattern', () => { expect(collectorPrefill(w(), 'INV-104')?.pattern).toBe('no past pattern'); });
});
