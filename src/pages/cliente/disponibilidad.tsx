import { CONFIG } from 'src/config-global';
import { ClienteDisponibilidadView } from 'src/sections/reserva/view/cliente-disponibilidad-view';

export default function ClienteDisponibilidadPage() {
  return (
    <>
      <title>{`Disponibilidad - ${CONFIG.appName}`}</title>
      <ClienteDisponibilidadView />
    </>
  );
}
