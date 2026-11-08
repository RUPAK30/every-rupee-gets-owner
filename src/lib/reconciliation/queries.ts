import { queryOptions } from '@tanstack/react-query';
import { readWorkspace } from './functions';
export const workspaceQuery = queryOptions({ queryKey: ['private-workspace'], queryFn: () => readWorkspace(), staleTime: 30_000 });
