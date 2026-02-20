import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole } from '../backend';

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 10000, // Cache for 10 seconds
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    data: query.data,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 10000, // Cache for 10 seconds
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    data: query.data ?? false,
  };
}
