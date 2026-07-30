import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { Iconify } from 'src/components/iconify';
import type { CanchaFoto } from 'src/types/cancha';

const API_BASE_URL = import.meta.env.VITE_URL_FOTOS || 'http://localhost:5277';

type Props = {
  fotosExistentes?: CanchaFoto[];
  onDeleteFotoExistente?: (fotoId: number) => Promise<void> | void;
  nuevosArchivos: File[];
  onArchivosChange: (files: File[]) => void;
};

export function CanchaFotoManager({
  fotosExistentes = [],
  onDeleteFotoExistente,
  nuevosArchivos,
  onArchivosChange,
}: Props) {
  // Estado para controlar qué foto se va a eliminar en el Modal
  const [fotoToDelete, setFotoToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Manejar selección de archivos locales
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      onArchivosChange([...nuevosArchivos, ...selectedFiles]);
    }
  };

  // Remover un archivo local que aún no se ha subido
  const handleRemoveLocalFile = (index: number) => {
    const updated = nuevosArchivos.filter((_, i) => i !== index);
    onArchivosChange(updated);
  };

  // Confirmación del modal para borrar foto del backend
  const handleConfirmDelete = async () => {
    if (fotoToDelete !== null && onDeleteFotoExistente) {
      setIsDeleting(true);
      try {
        await onDeleteFotoExistente(fotoToDelete);
      } catch (error) {
        console.error('Error al eliminar la foto:', error);
      } finally {
        setIsDeleting(false);
        setFotoToDelete(null);
      }
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ color: 'text.secondary', pt: 1 }}>
        Fotos de la Cancha
      </Typography>

      {/* --- FOTOS EXISTENTES (EN MODO EDICIÓN) --- */}
      {fotosExistentes.length > 0 && (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(130px, 1fr))" gap={2}>
          {fotosExistentes.map((foto) => (
            <Card key={foto.id} sx={{ position: 'relative', overflow: 'hidden' }}>
              <Box
                component="img"
                src={foto.url.startsWith('http') ? foto.url : `${API_BASE_URL}${foto.url}`}
                sx={{ width: '100%', height: 110, objectFit: 'cover' }}
              />

              {foto.esPrincipal && (
                <Chip
                  label="Principal"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: 6, left: 6, fontSize: 10, height: 20 }}
                />
              )}

              {onDeleteFotoExistente && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setFotoToDelete(foto.id)} // 👈 Abre el Modal asignando el ID
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'error.main' },
                  }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                </IconButton>
              )}
            </Card>
          ))}
        </Box>
      )}

      {/* --- PREVISUALIZACIÓN DE NUEVAS FOTOS SELECCIONADAS --- */}
      {nuevosArchivos.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Fotos a subir:
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(130px, 1fr))" gap={2}>
            {nuevosArchivos.map((file, index) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <Card key={index} sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={previewUrl}
                    sx={{ width: '100%', height: 110, objectFit: 'cover' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveLocalFile(index)}
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      '&:hover': { bgcolor: 'error.main' },
                    }}
                  >
                    <Iconify icon="solar:eye-closed-bold" width={18} />
                  </IconButton>
                </Card>
              );
            })}
          </Box>
        </>
      )}

      {/* --- BOTÓN PARA SELECCIONAR FOTOS --- */}
      <Box display="flex" alignItems="center" gap={2}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<Iconify icon="eva:search-fill" />}
        >
          Añadir Fotos
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Button>
      </Box>

      {/* --- MODAL DE CONFIRMACIÓN PARA ELIMINAR FOTO --- */}
      <Dialog
        open={fotoToDelete !== null}
        onClose={() => !isDeleting && setFotoToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>¿Eliminar imagen?</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará la foto permanentemente de la cancha. ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setFotoToDelete(null)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}