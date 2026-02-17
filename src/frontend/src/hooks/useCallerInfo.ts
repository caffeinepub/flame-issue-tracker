import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CallerInfo, UserRole } from '../backend';

export function useGetCallerInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<CallerInfo>({
    queryKey: ['callerInfo'],
    queryFn: async () => {
      if (!actor) {
        // Return guest info when actor is not available
        return {
          principal: { toText: () => '2vxsx-fae' } as any,
          role: UserRole.guest,
        };
      }
      return actor.getCurrentUserPrincipal();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000, // Cache for 30 seconds
  });
}
