import { CONFIG } from 'src/config-global';

import { ReservaEditView } from 'src/sections/reserva/view/reserva-edit-view';

export default function Page() {
  return (
    <>
      <title>{`Editar Reserva - ${CONFIG.appName}`}</title>
      <ReservaEditView />
    </>
  );
}
