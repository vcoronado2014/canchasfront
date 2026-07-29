import { CONFIG } from 'src/config-global';

import { ClubEditView } from 'src/sections/club/view/club-edit-view';

export default function Page() {
  return (
    <>
      <title>{`Editar Club - ${CONFIG.appName}`}</title>

      <ClubEditView />
    </>
  );
}