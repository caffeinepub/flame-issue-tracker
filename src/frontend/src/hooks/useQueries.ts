import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Complaint, ComplaintCategory, ComplaintStatus, SolutionUpdate, UserProfile, ExternalBlob, Principal } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Complaint Queries
export function useGetPublicComplaints() {
  const { actor, isFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ['publicComplaints'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicComplaints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetComplaint(complaintId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Complaint | null>({
    queryKey: ['complaint', complaintId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getComplaint(complaintId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllComplaints() {
  const { actor, isFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ['allComplaints'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllComplaints();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      description,
      urgencyLevel,
      proof,
    }: {
      category: ComplaintCategory;
      description: string;
      urgencyLevel: string;
      proof: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitComplaint(category, description, urgencyLevel, proof);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['allComplaints'] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      complaintId,
      newStatus,
    }: {
      complaintId: bigint;
      newStatus: ComplaintStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateComplaintStatus(complaintId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['allComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint'] });
    },
  });
}

export function useHideComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complaintId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.hideComplaint(complaintId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['allComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint'] });
    },
  });
}

export function useDeleteComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complaintId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComplaint(complaintId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['allComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint'] });
    },
  });
}

// Solution Queries
export function useGetSolutions() {
  const { actor, isFetching } = useActor();

  return useQuery<SolutionUpdate[]>({
    queryKey: ['solutions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSolutions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSolution() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      relatedCategories,
      relatedComplaints,
    }: {
      title: string;
      description: string;
      relatedCategories: ComplaintCategory[];
      relatedComplaints: bigint[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSolution(title, description, relatedComplaints, relatedCategories);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
    },
  });
}

// Admin Allowlist Query - Fixed to handle backend response structure
export function useGetAdminAllowlist() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[] | null>({
    queryKey: ['adminAllowlist'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getAdminAllowlist();
        return result.adminPrincipals;
      } catch (error) {
        console.error('Failed to fetch admin allowlist:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

// Debug Query
export function useGetAdminDebugInfo() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['adminDebugInfo'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminAllowlistDebugInfo();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

// Bootstrap Super Admin Mutation
export function useBootstrapSuperAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.bootstrapSuperAdmin();
    },
    onSuccess: () => {
      // Invalidate all authorization-related queries to trigger fresh data
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllowlist'] });
      queryClient.invalidateQueries({ queryKey: ['adminDebugInfo'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserInfo'] });
    },
  });
}
