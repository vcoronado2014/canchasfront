import { CONFIG } from 'src/config-global';

import { UserCreateView } from 'src/sections/user/view/user-create-view';

export default function Page() {
  return (
    <>
      <title>{`Nuevo Usuario - ${CONFIG.appName}`}</title>

      <UserCreateView />
    </>
  );
}
