import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/auth/use-auth';
import { deleteCancha } from 'src/services/cancha.service';
import type { CanchaListItem } from 'src/types/cancha';

type CanchaTableRowProps = {
  row: CanchaListItem;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
};

export function CanchaTableRow({ row, selected, onSelectRow, onDeleteRow }: CanchaTableRowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSuperAdmin = user?.rol === 'SuperAdmin' || user?.rol?.includes('SuperAdmin');
  const isClubAdmin = user?.rol === 'ClubAdmin' || user?.rol?.includes('ClubAdmin');
  const canDelete = isSuperAdmin || isClubAdmin;

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEdit = () => {
    handleClosePopover();
    navigate(`/dashboard/canchas/${row.id}/edit`);
  };

  const handleOpenDeleteDialog = () => {
    handleClosePopover();
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCancha(row.id);
      onDeleteRow();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error al eliminar la cancha:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const fotoPrincipal = row.fotos?.find((f) => f.esPrincipal)?.url || row.fotos?.[0]?.url;
  const API_BASE_URL = import.meta.env.VITE_URL_FOTOS || 'http://localhost:5277';

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell>
          <Box
            component="img"
            src={
                fotoPrincipal
                    ? fotoPrincipal.startsWith('http')
                        ? fotoPrincipal
                        : `${API_BASE_URL}${fotoPrincipal}`
                    : '/assets/images/cancha-placeholder.png'
            }
            sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover' }}
          />
        </TableCell>

        <TableCell component="th">{row.nombre}</TableCell>
        <TableCell>{row.tipoCancha}</TableCell>
        <TableCell>${row.precioHora.toLocaleString()}</TableCell>
        <TableCell>{row.duracionMinimaMinutos} min</TableCell>

        <TableCell>
          <Label color={row.activa ? 'success' : 'error'}>
            {row.activa ? 'Activa' : 'Inactiva'}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>

          {canDelete && (
            <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              Eliminar
            </MenuItem>
          )}
        </MenuList>
      </Popover>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>¿Eliminar Cancha?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar la cancha <strong>{row.nombre}</strong>? Si la cancha tiene reservas previas, pasará a estar inactiva (Soft Delete).
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit" disabled={isDeleting}>
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            loading={isDeleting}
          >
            Eliminar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}