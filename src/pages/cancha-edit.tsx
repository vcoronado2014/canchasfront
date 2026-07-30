import { CONFIG } from 'src/config-global';

import { CanchaEditView } from 'src/sections/cancha/view/cancha-edit-view';

export default function Page() {
  return (
    <>
      <title>{`Editar Cancha - ${CONFIG.appName}`}</title>

      <CanchaEditView />
    </>
  );
}