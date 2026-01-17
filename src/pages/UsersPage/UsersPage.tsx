import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import { DynamicGrid, UserActions, ErrorAlert } from '@/components';
import { useUsers, useUpdateUserStatus, useDebounce } from '@/hooks';
import { userColumnMetadata } from '@/utils';
import type { MRT_PaginationState } from 'material-react-table';
import type { User, ColumnMetadata } from '@/types';

/**
 * Users Page Component
 *
 * Displays a paginated, filterable list of users.
 *
 * KNOWN BUGS FOR CANDIDATE TO FIX:
 *
 * BUG #1: After changing user status, the table doesn't refresh.
 *         (Located in useUsers hook - cache invalidation issue)
 *
 * BUG #2: The 'Groups' column shows "[object Object]" instead of group names.
 *         (Located in DynamicGrid component - chiplist renderer issue)
 *
 * BUG #3: Page/filter state is not synced with URL params.
 *         When you change page or filter, URL doesn't update.
 *         When you refresh, pagination resets to page 1.
 *         (Located in this file - URL sync issue)
 *
 * INCOMPLETE FEATURES:
 *
 * 1. Search is not debounced - API is called on every keystroke.
 * 2. No loading skeleton - just shows spinner.
 * 3. No error boundary or proper error UI.
 */
export const UsersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  // Initialize state from URL params (read once on mount)
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get('query') || '';
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(() => {
    const status = searchParams.get('status');
    return (status as 'all' | 'active' | 'inactive') || 'all';
  });
  const [pagination, setPagination] = useState<MRT_PaginationState>(() => {
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    return {
      pageIndex: page ? parseInt(page) - 1 : 0,
      pageSize: pageSize ? parseInt(pageSize) : 10,
    };
  });

  // Debounce search query to prevent API calls on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Sync state changes to URL
  useEffect(() => {
    const params: Record<string, string> = {};

    if (pagination.pageIndex > 0) {
      params.page = String(pagination.pageIndex + 1);
    }
    if (pagination.pageSize !== 10) {
      params.pageSize = String(pagination.pageSize);
    }
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    if (debouncedSearchQuery) {
      params.query = debouncedSearchQuery;
    }

    setSearchParams(params, { replace: true });
  }, [pagination, statusFilter, debouncedSearchQuery, setSearchParams]);

  // Fetch users with debounced search query
  const { data, isLoading, error, refetch } = useUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    query: debouncedSearchQuery,
    status: statusFilter,
  });

  // Update user status mutation
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateUserStatus();

  // Handle status toggle
  const handleToggleStatus = (userId: string, newStatus: 'active' | 'inactive') => {
    updateStatus(
      { userId, status: newStatus },
      {
        onSuccess: (response) => {
          enqueueSnackbar(response.message, { variant: 'success' });
          // BUG: Table doesn't refresh after this!
        },
        onError: () => {
          enqueueSnackbar('Failed to update user status', { variant: 'error' });
        },
      }
    );
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle pagination change
  const handlePaginationChange = (newPagination: MRT_PaginationState) => {
    setPagination(newPagination);
  };

  // Add actions column to metadata
  const columnsWithActions: ColumnMetadata[] = [
    ...userColumnMetadata,
    {
      key: 'actions',
      header: 'Actions',
      type: 'string',
      width: 100,
    },
  ];

  // Transform data to include actions renderer
  const usersWithActions = (data?.data?.users || []).map((user: User) => ({
    ...user,
    actions: (
      <UserActions
        user={user}
        onToggleStatus={handleToggleStatus}
        isUpdating={isUpdating}
      />
    ),
  }));

  // Handle retry for failed requests
  const handleRetry = () => {
    refetch();
  };

  // Error state with retry functionality
  if (error) {
    const isNetworkError = error.message.includes('Network') ||
                           error.message.includes('fetch') ||
                           error.message.includes('Failed to fetch');

    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Users
        </Typography>
        <ErrorAlert
          title={isNetworkError ? 'Connection Error' : 'Failed to Load Users'}
          message={
            isNetworkError
              ? 'Unable to connect to the server. Please check your internet connection and try again.'
              : `Something went wrong while loading users: ${error.message}`
          }
          onRetry={handleRetry}
          showRetry={true}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Users
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Search Input - BUG: Not debounced! */}
          <TextField
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                handleStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          {/* Results Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              {data?.data?.totalCount || 0} users found
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper>
        <DynamicGrid
          data={usersWithActions}
          columns={columnsWithActions}
          isLoading={isLoading}
          totalCount={data?.data?.totalCount || 0}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          tableId="users-table"
        />
      </Paper>
    </Box>
  );
};
