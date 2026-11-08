import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useRef } from 'react';
import { Workspace } from '@/components/reconciliation/workspace';
import { workspaceQuery } from '@/lib/reconciliation/queries';
import { saveWorkspace } from '@/lib/reconciliation/functions';
import { supabase } from '@/integrations/supabase/client';
export const Route = createFileRoute('/_authenticated/workspace')({ loader: ({ context }) => context.queryClient.ensureQueryData(workspaceQuery), head: () => ({ meta: [{ title: 'Every Rupee · Private reconciliation workspace' }, { name: 'description', content: 'Your private invoice, receipt and deduction workspace.' }, { property: 'og:title', content: 'Every Rupee · Your workspace' }, { property: 'og:description', content: 'Private saved reconciliation records.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }), component: PrivateWorkspace });
function PrivateWorkspace() {
  const { data } = useSuspenseQuery(workspaceQuery); const version = useRef(data.version); const save = useServerFn(saveWorkspace); const navigate = useNavigate(); const { queryClient } = Route.useRouteContext();
  return <Workspace initial={data.workspace} onSave={async workspace => { const result = await save({ data: { workspace, version: version.current } }); version.current = result.version; queryClient.setQueryData(workspaceQuery.queryKey, { workspace, version: result.version }); }} onSignOut={async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true }); }} />;
}
