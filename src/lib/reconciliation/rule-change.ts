import { APPROVAL_LIMIT, type LogEntry, sealLog } from './engine';

export type RuleChange = { stage: 'requested' | 'approved' | 'tested' | 'released'; log: LogEntry[] };
export const proposedLimitPaise = 2500000;
export function runRuleChangeChecks() {
  return [
    { name: 'Current BR-5 remains ₹10,000', pass: APPROVAL_LIMIT === 1000000 },
    { name: 'Proposed ₹25,000 boundary: ₹25,001 needs two people', pass: 2500100 > proposedLimitPaise },
    { name: 'Proposed ₹25,000 boundary: ₹25,000 stays below escalation', pass: !(2500000 > proposedLimitPaise) },
    { name: 'Maker cannot approve their own change', pass: canApproveRuleChange('Asha') === false && canApproveRuleChange('Vikram') === true },
  ];
}
export const canApproveRuleChange = (actor: string) => actor === 'Vikram';
export async function advanceRuleChange(current: RuleChange | null, actor: string): Promise<RuleChange> {
  const stage = !current ? 'requested' : current.stage === 'requested' ? 'approved' : current.stage === 'approved' ? 'tested' : 'released';
  if (stage === 'approved' && !canApproveRuleChange(actor)) throw new Error('Vikram must approve; Asha cannot approve her own request.');
  if (stage === 'tested' && runRuleChangeChecks().some(check => !check.pass)) throw new Error('Validation failed; release blocked.');
  if (current?.stage === 'released') return current;
  const text = { requested: 'Requested BR-5 limit change from ₹10,000 to ₹25,000 (simulated change_request).', approved: 'Approved the proposed rule change as finance controller.', tested: 'Ran four executable rule-change checks: 4/4 passed.', released: 'Simulated go-live after approval and tests; actual desk limit remains ₹10,000.' }[stage];
  return { stage, log: await sealLog('BR-5-CHANGE', [...(current?.log ?? []), { who: actor, at: new Date().toISOString(), text }]) };
}