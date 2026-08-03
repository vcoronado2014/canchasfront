import { CONFIG } from 'src/config-global';
import { ClienteMisReservasView } from 'src/sections/reserva/view/cliente-mis-reservas-view';

export default function ClienteMisReservasPage() {
  return (
    <>
      <title>{`Mis reservas - ${CONFIG.appName}`}</title>
      <ClienteMisReservasView />
    </>
  );
}
