import { CONFIG } from 'src/config-global';

import { ReservaCreateView } from 'src/sections/reserva/view/reserva-create-view';

export default function Page() {
  return (
    <>
      <title>{`Nueva Reserva - ${CONFIG.appName}`}</title>
      <ReservaCreateView />
    </>
  );
}
