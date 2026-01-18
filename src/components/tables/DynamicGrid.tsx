import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_SortingState,
  type MRT_VisibilityState,
  type MRT_DensityState,
} from 'material-react-table';
import { Chip, Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateIcon from '@mui/icons-material/Create';
import PersonIcon from '@mui/icons-material/Person';
import type { ColumnMetadata, User, Group } from '@/types';
import { formatDate } from '@/utils';
import { useTablePreferences } from '@/hooks';

interface DynamicGridProps {
  data: User[];
  columns: ColumnMetadata[];
  isLoading?: boolean;
  isFetching?: boolean;
  totalCount: number;
  pagination: MRT_PaginationState;
  onPaginationChange: (pagination: MRT_PaginationState) => void;
  onRowAction?: (user: User, action: string) => void;
  tableId?: string; // Unique ID for persisting preferences
}

/**
 * Renders cell content based on column type
 *
 * BUG: The 'chiplist' type for groups is not rendering correctly.
 * It should display group names as chips, but something is wrong.
 * TODO: Fix the chiplist renderer to properly display groups.
 */
const renderCellByType = (
  value: unknown,
  columnMeta: ColumnMetadata
): React.ReactNode => {
  switch (columnMeta.type) {
    case 'string':
      return value as string;

    case 'badge':
      const status = value as 'active' | 'inactive';
      return (
        <Chip
          label={status}
          size="small"
          color={status === 'active' ? 'success' : 'default'}
          sx={{ textTransform: 'capitalize' }}
        />
      );

    case 'date':
      return formatDate(value as string, columnMeta.format);

    case 'chiplist':
      const groups = value as Group[];
      if (!groups || groups.length === 0) {
        return <span style={{ color: '#999' }}>No groups</span>;
      }

      // Check for special groups and assign colors
      const getGroupColor = (groupName: string): 'error' | 'warning' | 'info' | 'secondary' | 'success' | 'default' => {
        const name = groupName.toLowerCase();
        if (name.includes('admin')) return 'error';        // Red
        if (name.includes('management')) return 'warning'; // Orange
        if (name.includes('content')) return 'info';       // Blue
        if (name.includes('standard')) return 'secondary'; // Purple
        if (name.includes('read only')) return 'success';  // Green for Read Only
        return 'default';
      };

      // Get icon for special groups
      const getGroupIcon = (groupName: string) => {
        const name = groupName.toLowerCase();
        if (name.includes('admin')) {
          return <AdminPanelSettingsIcon sx={{ fontSize: 16, mr: 0.5 }} />;
        }
        if (name.includes('management')) {
          return <SupervisorAccountIcon sx={{ fontSize: 16, mr: 0.5 }} />;
        }
        if (name.includes('read only')) {
          return <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />;
        }
        if (name.includes('content')) {
          return <CreateIcon sx={{ fontSize: 16, mr: 0.5 }} />;
        }
        if (name.includes('standard')) {
          return <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />;
        }
        return null;
      };

      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {groups.map((group) => {
            const color = getGroupColor(group.groupName);
            const icon = getGroupIcon(group.groupName);
            const isSpecial = color !== 'default'; // All colored chips are special

            return (
              <Tooltip
                key={group.groupId}
                title={group.roles?.length > 0
                  ? `Roles: ${group.roles.map(r => r.roleName).join(', ')}`
                  : 'No specific roles'
                }
                arrow
              >
                <Chip
                  icon={icon || undefined}
                  label={group.groupName}
                  size="small"
                  color={color}
                  variant={isSpecial ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: isSpecial ? 600 : 400,
                    '& .MuiChip-icon': {
                      color: 'inherit',
                    },
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      );

    default:
      return String(value);
  }
};

/**
 * Loading Skeleton Component
 * Shows placeholder rows while data is loading
 */
const TableSkeleton: React.FC<{ columns: ColumnMetadata[]; rowCount?: number }> = ({
  columns,
  rowCount = 5
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} sx={{ width: col.width }}>
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.type === 'badge' ? (
                    <Skeleton variant="rounded" width={70} height={24} />
                  ) : col.type === 'chiplist' ? (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Skeleton variant="rounded" width={60} height={24} />
                      <Skeleton variant="rounded" width={80} height={24} />
                    </Box>
                  ) : (
                    <Skeleton variant="text" width={col.width ? col.width * 0.7 : 100} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * DynamicGrid Component
 *
 * A metadata-driven data grid using Material React Table.
 * Columns are generated dynamically based on the provided metadata.
 *
 * Features:
 * - Dynamic column generation from metadata
 * - Custom cell renderers for different data types
 * - Server-side pagination
 * - Sorting support
 * - Loading skeleton for better UX
 */
export const DynamicGrid: React.FC<DynamicGridProps> = ({
  data,
  columns,
  isLoading = false,
  isFetching = false,
  totalCount,
  pagination,
  onPaginationChange,
  tableId = 'default-table',
}) => {
  // Load persisted preferences from localStorage
  // IMPORTANT: All hooks must be called before any conditional returns
  const {
    preferences,
    updateColumnVisibility,
    updateSorting,
    updateDensity,
  } = useTablePreferences(tableId);

  // Generate MRT columns from metadata
  // Must be called before conditional return to maintain hook order
  const tableColumns = useMemo<MRT_ColumnDef<User>[]>(() => {
    return columns.map((colMeta) => ({
      accessorKey: colMeta.key,
      header: colMeta.header,
      size: colMeta.width,
      enableSorting: colMeta.sorting ?? false,
      enablePinning: !!colMeta.pinned,
      enableHiding: colMeta.key !== 'name', // Name column can't be hidden
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return renderCellByType(value, colMeta);
      },
    }));
  }, [columns]);

  // Handle column visibility change and persist
  const handleColumnVisibilityChange = (
    updater: MRT_VisibilityState | ((old: MRT_VisibilityState) => MRT_VisibilityState)
  ) => {
    const newVisibility = typeof updater === 'function'
      ? updater(preferences.columnVisibility as MRT_VisibilityState)
      : updater;
    updateColumnVisibility(newVisibility);
  };

  // Handle sorting change and persist
  const handleSortingChange = (
    updater: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState)
  ) => {
    const newSorting = typeof updater === 'function'
      ? updater(preferences.sorting as MRT_SortingState)
      : updater;
    updateSorting(newSorting);
  };

  // Handle density change and persist
  const handleDensityChange = (
    updater: MRT_DensityState | ((old: MRT_DensityState) => MRT_DensityState)
  ) => {
    const newDensity = typeof updater === 'function'
      ? updater(preferences.density as MRT_DensityState)
      : updater;
    updateDensity(newDensity);
  };

  const table = useMaterialReactTable({
    columns: tableColumns,
    data: (isLoading || isFetching) && data.length === 0 ? [] : data, // Pass empty array during initial load or refetch
    enableRowSelection: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableHiding: true, // Enable column visibility toggle
    enableDensityToggle: true, // Enable density toggle
    manualPagination: true,
    rowCount: totalCount,
    state: {
      isLoading,
      pagination,
      columnVisibility: preferences.columnVisibility as MRT_VisibilityState,
      sorting: preferences.sorting as MRT_SortingState,
      density: preferences.density as MRT_DensityState,
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
      onPaginationChange(newPagination);
    },
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onSortingChange: handleSortingChange,
    onDensityChange: handleDensityChange,
    muiTableContainerProps: {
      sx: { maxHeight: '600px' },
    },
    muiTableBodyRowProps: () => ({
      sx: {
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      },
    }),
  });

  // Show skeleton while loading (after all hooks have been called)
  if ((isLoading || isFetching) && data.length === 0) {
    return <TableSkeleton columns={columns} rowCount={pagination.pageSize} />;
  }

  return <MaterialReactTable table={table} />;
};
