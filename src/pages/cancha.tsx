import { CONFIG } from 'src/config-global';

import { CanchaView } from 'src/sections/cancha/view/cancha-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Cancha - ${CONFIG.appName}`}</title>

      <CanchaView />
    </>
  );
}
