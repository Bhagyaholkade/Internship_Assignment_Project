import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from 'material-react-table';
import { Chip, Box } from '@mui/material';
import type { ColumnMetadata, User, Group } from '@/types';
import { formatDate } from '@/utils';

interface DynamicGridProps {
  data: User[];
  columns: ColumnMetadata[];
  isLoading?: boolean;
  totalCount: number;
  pagination: MRT_PaginationState;
  onPaginationChange: (pagination: MRT_PaginationState) => void;
  onRowAction?: (user: User, action: string) => void;
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
      // BUG: This is not rendering groups correctly!
      // The groups array contains objects with groupName, but we're not accessing it properly.
      // TODO: Fix this to display group names as chips.
      const groups = value as Group[];
      if (!groups || groups.length === 0) {
        return <span style={{ color: '#999' }}>No groups</span>;
      }

      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {groups.map((group) => (
            <Chip
              // BUG: Wrong property being used for key and label
              key={group.toString()}
              label={group.toString()}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      );

    default:
      return String(value);
  }
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
 */
export const DynamicGrid: React.FC<DynamicGridProps> = ({
  data,
  columns,
  isLoading = false,
  totalCount,
  pagination,
  onPaginationChange,
}) => {
  // Generate MRT columns from metadata
  const tableColumns = useMemo<MRT_ColumnDef<User>[]>(() => {
    return columns.map((colMeta) => ({
      accessorKey: colMeta.key,
      header: colMeta.header,
      size: colMeta.width,
      enableSorting: colMeta.sorting ?? false,
      enablePinning: !!colMeta.pinned,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return renderCellByType(value, colMeta);
      },
    }));
  }, [columns]);

  const table = useMaterialReactTable({
    columns: tableColumns,
    data,
    enableRowSelection: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    manualPagination: true,
    rowCount: totalCount,
    state: {
      isLoading,
      pagination,
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
      onPaginationChange(newPagination);
    },
    muiTableContainerProps: {
      sx: { maxHeight: '600px' },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      },
    }),
  });

  return <MaterialReactTable table={table} />;
};
