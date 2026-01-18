import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Snackbar,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Features:
 * - Catches render errors in child components
 * - Shows user-friendly error message
 * - Provides retry button to recover
 * - Logs error details for debugging
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error);
    console.error('Error info:', errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = (): void => {
    // Reset error state and try rendering again
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
            }}
          >
            <ErrorOutlineIcon
              sx={{ fontSize: 64, color: 'error.main', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom color="error">
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We encountered an unexpected error. Please try again or contact
              support if the problem persists.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              size="large"
            >
              Try Again
            </Button>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity="error" sx={{ mt: 3, textAlign: 'left' }}>
                <AlertTitle>Error Details (Development Only)</AlertTitle>
                <Typography variant="body2" component="pre" sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.75rem'
                }}>
                  {this.state.error.toString()}
                </Typography>
              </Alert>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Alert Component
 *
 * Displays an error message with retry functionality.
 * Use this for API errors and recoverable errors.
 */
interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Error',
  message,
  onRetry,
  showRetry = true,
}) => {
  return (
    <Alert
      severity="error"
      sx={{ mt: 2 }}
      action={
        showRetry && onRetry ? (
          <Button
            color="inherit"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Retry
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

/**
 * Network Error Component
 *
 * Specialized error display for network/API failures.
 */
interface NetworkErrorProps {
  onRetry: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        p: 3,
      }}
    >
      <SignalWifiOffIcon
        sx={{ fontSize: 48, color: 'warning.main', mb: 2 }}
      />
      <Typography variant="h6" gutterBottom>
        No Internet Connection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
        You appear to be offline. Please check your internet connection and try again.
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<RefreshIcon />}
        onClick={onRetry}
      >
        Retry Connection
      </Button>
    </Box>
  );
};

/**
 * Offline Banner Component
 *
 * Shows a persistent banner when the user is offline.
 * Automatically hides when connection is restored.
 */
interface OfflineBannerProps {
  isOffline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline }) => {
  return (
    <Snackbar
      open={isOffline}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity="warning"
        icon={<WifiOffIcon />}
        sx={{
          width: '100%',
          alignItems: 'center',
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        <Typography variant="body2" fontWeight={500}>
          No internet connection. Some features may not work.
        </Typography>
      </Alert>
    </Snackbar>
  );
};

/**
 * Offline Full Page Component
 *
 * Shows a full page message when user is offline and data couldn't be loaded.
 */
interface OfflinePageProps {
  onRetry: () => void;
  message?: string;
}

export const OfflinePage: React.FC<OfflinePageProps> = ({
  onRetry,
  message = 'You are currently offline. Please check your internet connection.',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 400,
          textAlign: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <SignalWifiOffIcon
          sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
        />
        <Typography variant="h5" gutterBottom color="text.primary">
          You're Offline
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          size="large"
        >
          Try Again
        </Button>
      </Paper>
    </Box>
  );
};
