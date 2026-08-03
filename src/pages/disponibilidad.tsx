import { CONFIG } from 'src/config-global';
import { DisponibilidadView } from 'src/sections/reserva/view/disponibilidad-view';

export default function DisponibilidadPage() {
  return (
    <>
      <title>{`Disponibilidad - ${CONFIG.appName}`}</title>
      <DisponibilidadView />
    </>
  );
}
