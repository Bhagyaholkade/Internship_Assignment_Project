import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, updateUserStatus } from '@/api';
import type { PaginationParams, UsersApiResponse } from '@/types';

// Query keys
export const userQueryKeys = {
  all: ['users'] as const,
  list: (params: PaginationParams) => ['users', 'list', params] as const,
};

/**
 * Hook to fetch users with pagination and filters
 */
export const useUsers = (params: PaginationParams) => {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => fetchUsers(params),
  });
};

/**
 * Hook to update user status with optimistic updates
 *
 * Optimistic UI: Immediately updates the UI when button is clicked,
 * then reverts if the API call fails.
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'inactive' }) =>
      updateUserStatus(userId, status),

    // Optimistic update: run before the mutation
    onMutate: async ({ userId, status }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: userQueryKeys.all });

      // Snapshot the previous value for all user queries
      const previousQueries = queryClient.getQueriesData<UsersApiResponse>({
        queryKey: userQueryKeys.all
      });

      // Optimistically update all matching queries
      queryClient.setQueriesData<UsersApiResponse>(
        { queryKey: userQueryKeys.all },
        (old) => {
          if (!old?.data?.users) return old;
          return {
            ...old,
            data: {
              ...old.data,
              users: old.data.users.map((user) =>
                user.userId === userId ? { ...user, status } : user
              ),
            },
          };
        }
      );

      // Return context with previous value for rollback
      return { previousQueries };
    },

    // If mutation fails, rollback to previous state
    onError: (_error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    // Always refetch after error or success to ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
};

/**
 * Hook to manually invalidate users cache
 */
export const useInvalidateUsersCache = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
  };
};
