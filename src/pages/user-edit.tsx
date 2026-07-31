import { CONFIG } from 'src/config-global';

import { UserEditView } from 'src/sections/user/view/user-edit-view';

export default function Page() {
  return (
    <>
      <title>{`Editar Usuario - ${CONFIG.appName}`}</title>

      <UserEditView />
    </>
  );
}
