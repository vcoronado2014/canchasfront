import { CONFIG } from 'src/config-global';

import { CanchaCreateView } from 'src/sections/cancha/view/cancha-create-view';

export default function Page() {
  return (
    <>
      <title>{`Nueva Cancha - ${CONFIG.appName}`}</title>

      <CanchaCreateView />
    </>
  );
}