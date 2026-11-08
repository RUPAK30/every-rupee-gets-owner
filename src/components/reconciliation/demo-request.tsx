import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { submitDemoRequest } from '@/lib/reconciliation/functions';
export function DemoRequest() {
  const submit = useServerFn(submitDemoRequest);
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  if (state === 'saved') return <div role="status" className="border-l-2 border-accent p-4"><strong>Request received.</strong><p>Your demo request has been saved for Rupak to review.</p><Button variant="link" onClick={() => setState('idle')}>Send another request</Button></div>;
  return <form className="grid gap-3" onSubmit={async event => {
    event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form); setState('saving'); setError('');
    try { await submit({ data: { name: String(fields.get('name')), email: String(fields.get('email')), company: String(fields.get('company')), message: `[${String(fields.get('role'))}] ${String(fields.get('message') ?? '')}`.slice(0, 2000), website: String(fields.get('website') ?? '') } }); setState('saved'); form.reset(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); setState('idle'); }
  }}>
    <label className="grid gap-1 text-sm">Name<input name="name" required maxLength={100} className="er-input" autoComplete="name" /></label>
    <label className="grid gap-1 text-sm">Work email<input name="email" type="email" required maxLength={254} className="er-input" autoComplete="email" /></label>
    <label className="grid gap-1 text-sm">Company<input name="company" required maxLength={150} className="er-input" autoComplete="organization" /></label>
    <label className="grid gap-1 text-sm">Which describes you?<select name="role" required className="er-input" defaultValue=""><option value="" disabled>Choose one</option><option>Hiring manager / TA</option><option>Product manager</option><option>Finance ops</option><option>CFO / finance leader</option><option>Other</option></select></label>
    <label className="grid gap-1 text-sm">Anything you'd like to discuss? (optional)<textarea name="message" maxLength={2000} className="er-input" rows={3} /></label>
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={state === 'saving'}>{state === 'saving' ? 'Sending…' : "Let's talk"}</Button>
  </form>;
}
