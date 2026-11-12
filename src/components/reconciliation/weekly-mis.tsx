import { Button } from '@/components/ui/button';
import type { Workspace } from '@/lib/reconciliation/engine';
import { useCreditNotes } from './gst-notes';
import { computeMis, deskDate, misCsv, misFilename, type MisHistory, type MisStatus } from '@/lib/reconciliation/mis';

const chip: Record<MisStatus, [string, string]> = {
  PASS: ['✓ Pass', 'bg-money-ok/10 text-money-ok'],
  FAIL: ['✗ Fail', 'bg-destructive/10 text-destructive'],
  TRACKED: ['● Tracked', 'bg-money-ok/10 text-money-ok'],
  'NO DATA YET': ['No data yet', 'bg-muted text-muted-foreground'],
};

export function WeeklyMis({ w, history }: { w: Workspace; history: MisHistory }) {
  const { notes } = useCreditNotes(w);
  const rows = computeMis(w, history, deskDate(w), undefined, notes.length ? notes : undefined);
  const download = () => {
    const url = URL.createObjectURL(new Blob([misCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = misFilename(deskDate(w)); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };
  return <section aria-label="Weekly MIS" className="mt-6 min-w-0 rounded-lg border border-border bg-card p-3 sm:p-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0"><p className="text-[.7rem] font-semibold uppercase tracking-wide text-muted-foreground">Weekly MIS · computed live from this desk</p><h2 className="text-base font-semibold">Is every control working?</h2></div>
      <Button size="sm" variant="outline" className="min-h-11" onClick={download}>⬇ Download MIS (CSV)</Button>
    </div>
    <div className="mt-3 max-w-full overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="text-xs text-muted-foreground"><tr className="border-b border-border"><th className="py-2 pr-3 font-medium">KPI</th><th className="py-2 pr-3 font-medium">This week</th><th className="py-2 pr-3 font-medium">Target</th><th className="py-2 pr-3 font-medium">Status</th><th className="hidden py-2 font-medium md:table-cell">What it proves</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.kpi} className="border-b border-border/60 align-top last:border-0">
          <td className="py-2 pr-3">{r.kpi}</td><td className="whitespace-nowrap py-2 pr-3 tabular-nums">{r.value}</td><td className="py-2 pr-3">{r.target}</td>
          <td className="py-2 pr-3"><span className={'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ' + chip[r.status][1]}>{chip[r.status][0]}</span></td>
          <td className="hidden py-2 text-muted-foreground md:table-cell">{r.proves}</td></tr>)}</tbody>
      </table>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">Built like the weekly MIS I ran at HDFC Bank: 15+ KPIs, prep cut from 8 hours to 3. Here it takes zero prep. A red row is a live problem in this sample: assign an owner under "Gaps to explain" and watch it turn green.</p>
  </section>;
}
