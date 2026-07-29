import { CONFIG } from 'src/config-global';

import { ClubCreateView } from 'src/sections/club/view/club-create-view';

export default function Page() {
  return (
    <>
      <title>{`Nuevo Club - ${CONFIG.appName}`}</title>

      <ClubCreateView />
    </>
  );
}