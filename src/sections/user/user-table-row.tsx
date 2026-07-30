import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
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
import { RolUsuario, ROL_USUARIO_MAP, type UsuarioListItem } from 'src/types/usuario';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

type UserTableRowProps = {
  row: UsuarioListItem;
  selected: boolean;
  onSelectRow: () => void;
  onEditRow: () => void;
  onDeleteRow: () => Promise<void> | void;
};

// Asignación de colores para los badges según el Rol
const ROL_COLOR_MAP: Record<RolUsuario, 'error' | 'info' | 'secondary' | 'warning' | 'default'> = {
  [RolUsuario.SuperAdmin]: 'error',
  [RolUsuario.ClubAdmin]: 'info',
  [RolUsuario.AgendaCreator]: 'secondary',
  [RolUsuario.CourtManager]: 'warning',
  [RolUsuario.Cliente]: 'default',
};

export function UserTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: UserTableRowProps) {
  const { user } = useAuth();

  // Verificar si la fila pertenece al usuario actualmente logueado
  // Compara por ID (número/string) o por Email según lo que retorne tu auth context
  const isSelf = 
    (user?.id && Number(user.id) === row.id) || 
    (user?.email && user.email.toLowerCase() === row.email.toLowerCase());

  // Estados del Popover y Modal de Confirmación
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Opciones del Menú
  const handleEdit = useCallback(() => {
    handleClosePopover();
    onEditRow();
  }, [handleClosePopover, onEditRow]);

  const handleOpenDeleteDialog = useCallback(() => {
    handleClosePopover();
    setOpenDeleteDialog(true);
  }, [handleClosePopover]);

  const handleCloseDeleteDialog = useCallback(() => {
    if (!isDeleting) {
      setOpenDeleteDialog(false);
    }
  }, [isDeleting]);

  // Ejecución de la Eliminación
  const handleConfirmDelete = async () => {
    if (isSelf) return; // Validación de seguridad adicional

    setIsDeleting(true);
    try {
      await onDeleteRow();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>

        {/* Nombre e Iniciales / Avatar */}
        <TableCell component="th" scope="row">
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar alt={row.nombre}>{row.nombre.charAt(0).toUpperCase()}</Avatar>
            <Box display="flex" flexDirection="column">
              <Typography variant="subtitle2" noWrap>
                {row.nombre} {isSelf && '(Tú)'}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        {/* Email */}
        <TableCell>{row.email}</TableCell>

        {/* Teléfono */}
        <TableCell>{row.telefono || '-'}</TableCell>

        {/* Rol (badge coloreado) */}
        <TableCell>
          <Label color={ROL_COLOR_MAP[row.rol] || 'default'}>
            {ROL_USUARIO_MAP[row.rol] ?? 'Desconocido'}
          </Label>
        </TableCell>

        {/* Club Asignado */}
        <TableCell>{row.nombreClub || 'Sin Club'}</TableCell>

        {/* Botón de Acciones */}
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
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>

          {/* Opción 'Eliminar': Oculta si es la propia cuenta del usuario autenticado */}
          {!isSelf && (
            <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              Eliminar
            </MenuItem>
          )}
        </MenuList>
      </Popover>

      {/* Modal de Confirmación para Eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>¿Eliminar Usuario?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar al usuario <strong>{row.nombre}</strong> ({row.email})? Esta acción no se puede deshacer.
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
