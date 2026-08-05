import { CONFIG } from 'src/config-global';
import DisponibilidadCreateView from 'src/sections/reserva/view/disponibilidad-create-view';

export default function DisponibilidadCrearPage() {
  return (
    <>
      <title>{`Crear disponibilidad - ${CONFIG.appName}`}</title>
      <DisponibilidadCreateView />
    </>
  );
}
