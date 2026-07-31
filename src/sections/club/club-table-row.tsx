import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
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
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import {
  EstadoSuscripcionClub,
  getEstadoSuscripcionLabel,
} from 'src/types/club';
import { deleteClub } from 'src/services/club.service';
import { useAuth } from 'src/auth/use-auth';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatDate } from 'src/utils/table-utils';

// ----------------------------------------------------------------------

export type ClubProps = {
  id: number;
  nombre: string;
  subdominio: string;
  direccion?: string | null;
  telefono?: string | null;
  estadoSuscripcion: EstadoSuscripcionClub;
  fechaProxVencimiento?: string | null;
  regionNombre?: string | null;
  comunaNombre?: string | null;
  owner?: string | null;
};

type ClubTableRowProps = {
  row: ClubProps;
  selected: boolean;
  compact?: boolean;
  onSelectRow: () => void;
  onRefreshList?: () => void; // Para recargar la grilla tras eliminar
  onDeleteRow: () => void;
};

export function ClubTableRow({
  row,
  selected,
  compact = false,
  onSelectRow,
  onRefreshList,
  onDeleteRow,
}: ClubTableRowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Comprobar si el usuario actual es SuperAdmin
  const isSuperAdmin = user?.rol === 'SuperAdmin' || user?.rol?.includes('SuperAdmin');

  // Estados de Popover y Dialog de confirmación
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Ir a la vista de edición
  const handleEdit = () => {
    handleClosePopover();
    navigate(`/dashboard/clubs/${row.id}/edit`);
  };

  // Abrir Modal de Confirmación
  const handleOpenDeleteDialog = () => {
    handleClosePopover();
    setOpenDeleteDialog(true);
  };

  // Cerrar Modal
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Confirmar y procesar la eliminación
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteClub(row.id);
      onDeleteRow();
      handleCloseDeleteDialog();
      if (onRefreshList) {
        onRefreshList();
      }
    } catch (error) {
      console.error('Error al eliminar el club:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (compact) {
    return (
      <>
        <Box
          component="div"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
              <Avatar alt={row.nombre}>{row.nombre.charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {row.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {row.subdominio}
                </Typography>
              </Box>
            </Box>

            <IconButton onClick={handleOpenPopover} size="small">
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Región
              </Typography>
              <Typography variant="body2">{row.regionNombre ?? '-'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Comuna
              </Typography>
              <Typography variant="body2">{row.comunaNombre ?? '-'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Vencimiento
              </Typography>
              <Typography variant="body2">{formatDate(row.fechaProxVencimiento) ?? '-'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Estado
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Label
                  color={
                    row.estadoSuscripcion === EstadoSuscripcionClub.Activo
                      ? 'success'
                      : row.estadoSuscripcion === EstadoSuscripcionClub.PendientePago
                        ? 'warning'
                        : row.estadoSuscripcion === EstadoSuscripcionClub.Suspendido
                          ? 'error'
                          : 'default'
                  }
                >
                  {getEstadoSuscripcionLabel(row.estadoSuscripcion)}
                </Label>
              </Box>
            </Box>
          </Box>
        </Box>

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

            {isSuperAdmin && (
              <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
                <Iconify icon="solar:trash-bin-trash-bold" />
                Eliminar
              </MenuItem>
            )}
          </MenuList>
        </Popover>

        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>¿Eliminar Club?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar el club <strong>{row.nombre}</strong>? Esta acción no se puede deshacer.
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

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell component="th">{row.nombre}</TableCell>

        <TableCell>{row.regionNombre ?? '-'}</TableCell>

        <TableCell>{row.comunaNombre ?? '-'}</TableCell>
        
        <TableCell>{formatDate(row.fechaProxVencimiento) ?? ''}</TableCell>

        <TableCell>{row.subdominio}</TableCell>

        <TableCell>
          <Label
            color={
              row.estadoSuscripcion === EstadoSuscripcionClub.Activo
                ? 'success'
                : row.estadoSuscripcion === EstadoSuscripcionClub.PendientePago
                  ? 'warning'
                  : row.estadoSuscripcion === EstadoSuscripcionClub.Suspendido
                    ? 'error'
                    : 'default'
            }
          >
            {getEstadoSuscripcionLabel(row.estadoSuscripcion)}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Popover de Opciones */}
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
          {/* Editar visible para todos los roles con acceso */}
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>

          {/* Eliminar únicamente visible para SuperAdmin */}
          {isSuperAdmin && (
            <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              Eliminar
            </MenuItem>
          )}
        </MenuList>
      </Popover>

      {/* Modal de Confirmación para Eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>¿Eliminar Club?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el club <strong>{row.nombre}</strong>? Esta acción no se puede deshacer.
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