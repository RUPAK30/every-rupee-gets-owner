import { describe, expect, it } from 'vitest';
import { APPROVAL_LIMIT, forceResealLog, sealLog, sealedDecisionLookup, verifyLog, verifyLogWithAnchor } from './engine';
import { advanceRuleChange, runRuleChangeChecks } from './rule-change';

describe('independent anchor and approved-decision evidence', () => {
  const entries = [
    { at: '2026-11-10T17:00:00Z', who: 'Asha', text: 'Submitted decision for review' },
    { at: '2026-11-10T18:00:00Z', who: 'Vikram', text: 'Approved the sample decision after reviewing evidence' },
  ];
  it('a full rewrite passes the chain check but fails the independent anchor', async () => {
    const sealed = await sealLog('INV-101', entries);
    const anchor = sealed.at(-1)?.hash;
    expect(anchor).toHaveLength(64);
    const rewritten = await forceResealLog('INV-101', entries.map(e => ({ ...e, text: 'Rewritten by admin' })));
    expect(await verifyLog('INV-101', rewritten)).toEqual({ ok: true });
    expect(await verifyLogWithAnchor('INV-101', rewritten, anchor)).toMatchObject({ ok: false, reason: 'anchor_mismatch' });
  });
  it('sealed-decision lookup returns the actual approval entry, not submission', async () => {
    const sealed = await sealLog('INV-101', entries);
    expect(await sealedDecisionLookup('INV-101', sealed, sealed.at(-1)?.hash)).toEqual(sealed[1]);
    const changed = await forceResealLog('INV-101', entries.map(e => ({ ...e, text: 'Approved a different amount' })));
    expect(await sealedDecisionLookup('INV-101', changed, sealed.at(-1)?.hash)).toBeUndefined();
  });
  it('a legitimate appended action preserves the daily checkpoint', async () => {
    const sealed = await sealLog('INV-101', entries);
    const appended = await sealLog('INV-101', [...sealed, { ...entries[0], at: '2026-11-11T09:00:00Z', who: 'Asha', text: 'Added next-day evidence' }]);
    expect((await verifyLogWithAnchor('INV-101', appended, sealed.at(-1)?.hash, 2)).ok).toBe(true);
  });
});

describe('simulated finance-rule change gates', () => {
  it('blocks maker self-approval', async () => {
    const request = await advanceRuleChange(null, 'Asha');
    await expect(advanceRuleChange(request, 'Asha')).rejects.toThrow('Vikram must approve');
  });
  it('logs request, controller approval, executed tests and simulated release without changing ₹10,000', async () => {
    let request = await advanceRuleChange(null, 'Asha');
    request = await advanceRuleChange(request, 'Vikram');
    request = await advanceRuleChange(request, 'Vikram');
    expect(request.stage).toBe('tested');
    expect(runRuleChangeChecks()).toHaveLength(4);
    expect(runRuleChangeChecks().every(check => check.pass)).toBe(true);
    request = await advanceRuleChange(request, 'Vikram');
    expect(request.stage).toBe('released');
    expect(request.log).toHaveLength(4);
    expect(await verifyLog('BR-5-CHANGE', request.log)).toEqual({ ok: true });
    expect(APPROVAL_LIMIT).toBe(1000000);
  });
});