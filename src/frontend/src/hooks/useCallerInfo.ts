import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CallerInfo, UserRole } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerInfo() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<CallerInfo>({
    queryKey: ['callerInfo'],
    queryFn: async () => {
      if (!actor) {
        // Return guest info when actor is not available
        return {
          principal: Principal.anonymous(),
          role: UserRole.guest,
        };
      }
      return actor.getCurrentUserPrincipal();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 10000, // Cache for 10 seconds
    retry: 1,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}
