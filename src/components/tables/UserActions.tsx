import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { User } from '@/types';

interface UserActionsProps {
  user: User;
  onToggleStatus: (userId: string, newStatus: 'active' | 'inactive') => void;
  isUpdating?: boolean;
}

/**
 * UserActions Component
 *
 * Renders action buttons for a user row with:
 * - Hover states for better UX
 * - Confirmation dialog before deactivating
 * - Proper accessibility (aria labels, keyboard navigation)
 */
export const UserActions: React.FC<UserActionsProps> = ({
  user,
  onToggleStatus,
  isUpdating = false,
}) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleToggleClick = () => {
    // Show confirmation dialog only when deactivating
    if (user.status === 'active') {
      setConfirmDialogOpen(true);
    } else {
      // Activate directly without confirmation
      onToggleStatus(user.userId, 'active');
    }
  };

  const handleConfirmDeactivate = () => {
    setConfirmDialogOpen(false);
    onToggleStatus(user.userId, 'inactive');
  };

  const handleCancelDialog = () => {
    setConfirmDialogOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleClick();
    }
  };

  if (isUpdating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: 40 }}>
        <CircularProgress size={20} aria-label="Updating user status" />
      </Box>
    );
  }

  const isActive = user.status === 'active';

  return (
    <>
      <Tooltip
        title={isActive ? 'Deactivate User' : 'Activate User'}
        arrow
        placement="top"
      >
        <IconButton
          onClick={handleToggleClick}
          onKeyDown={handleKeyDown}
          color={isActive ? 'error' : 'success'}
          size="small"
          aria-label={
            isActive
              ? `Deactivate user ${user.name}`
              : `Activate user ${user.name}`
          }
          aria-describedby={isActive ? 'deactivate-description' : undefined}
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.15)',
              backgroundColor: isActive
                ? 'rgba(211, 47, 47, 0.12)'
                : 'rgba(46, 125, 50, 0.12)',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: isActive ? 'error.main' : 'success.main',
              outlineOffset: 2,
            },
          }}
        >
          {isActive ? <CancelIcon /> : <CheckCircleIcon />}
        </IconButton>
      </Tooltip>

      {/* Confirmation Dialog for Deactivation */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelDialog}
        aria-labelledby="deactivate-dialog-title"
        aria-describedby="deactivate-dialog-description"
      >
        <DialogTitle id="deactivate-dialog-title">
          Deactivate User?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="deactivate-dialog-description">
            Are you sure you want to deactivate <strong>{user.name}</strong>?
            This user will no longer have access to the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDialog}
            color="inherit"
            autoFocus
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeactivate}
            color="error"
            variant="contained"
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
