import { CONFIG } from 'src/config-global';

import { ClubView } from 'src/sections/club/view/club-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Club - ${CONFIG.appName}`}</title>

      <ClubView />
    </>
  );
}
