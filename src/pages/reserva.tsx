import { CONFIG } from 'src/config-global';

import { ReservaView } from 'src/sections/reserva/view/reserva-view';

export default function Page() {
  return (
    <>
      <title>{`Reservas - ${CONFIG.appName}`}</title>
      <ReservaView />
    </>
  );
}
