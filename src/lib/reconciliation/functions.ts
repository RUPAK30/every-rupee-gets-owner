import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { emptyWorkspace, validateWorkspace } from './engine';

export const readWorkspace = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('reconciliation_workspaces').select('data,version').eq('user_id', context.userId).maybeSingle();
  if (error) throw new Error('Could not load your workspace.');
  return { workspace: data ? validateWorkspace(data.data) : emptyWorkspace(), version: data?.version ?? 0 };
});
export const saveWorkspace = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: { workspace: unknown; version: number }) => ({ workspace: validateWorkspace(input.workspace), version: z.number().int().nonnegative().parse(input.version) })).handler(async ({ data, context }) => {
  const row = { user_id: context.userId, data: JSON.parse(JSON.stringify(data.workspace)), version: data.version + 1, updated_at: new Date().toISOString() };
  const result = data.version === 0
    ? await context.supabase.from('reconciliation_workspaces').insert(row).select('version').single()
    : await context.supabase.from('reconciliation_workspaces').update(row).eq('user_id', context.userId).eq('version', data.version).select('version').single();
  if (result.error || !result.data) throw new Error('Save failed or another tab changed this workspace. Reload before trying again.');
  return { version: result.data.version };
});
const leadSchema = z.object({ name: z.string().trim().min(1).max(100), email: z.string().email().max(254), company: z.string().trim().min(1).max(150), message: z.string().trim().max(2000), website: z.string().max(200).optional() });
export const submitDemoRequest = createServerFn({ method: 'POST' }).inputValidator((input: unknown) => leadSchema.parse(input)).handler(async ({ data }) => {
  if (data.website) throw new Error('Request rejected.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.from('demo_requests').insert({ name: data.name, email: data.email, company: data.company, message: data.message });
  if (error) throw new Error('Your request could not be saved. Please try again.');
  return { saved: true };
});
