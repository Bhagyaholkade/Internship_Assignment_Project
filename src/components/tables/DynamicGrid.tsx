import { useMemo } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from 'material-react-table';
import { Chip, Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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
      const groups = value as Group[];
      if (!groups || groups.length === 0) {
        return <span style={{ color: '#999' }}>No groups</span>;
      }

      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {groups.map((group) => (
            <Chip
              key={group.groupId}
              label={group.groupName}
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
  totalCount,
  pagination,
  onPaginationChange,
}) => {
  // Show skeleton while loading
  if (isLoading && data.length === 0) {
    return <TableSkeleton columns={columns} rowCount={pagination.pageSize} />;
  }

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
