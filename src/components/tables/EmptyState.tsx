import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type EmptyStateProps = {
  title?: string;
  message: ReactNode;
  compact?: boolean;
  sx?: SxProps<Theme>;
};

export function EmptyState({ title = 'No hay registros', message, compact = false, sx }: EmptyStateProps) {
  return (
    <Box
      sx={[
        { py: compact ? 2 : 6, textAlign: 'center' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography variant={compact ? 'body2' : 'h6'} sx={{ mb: 1 }}>
        {title}
      </Typography>

      <Typography variant={compact ? 'body2' : 'body2'}>{message}</Typography>
    </Box>
  );
}
