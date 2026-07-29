import { SignUpView } from "src/sections/auth/sign-up-view";
import { CONFIG } from 'src/config-global';

export default function Page() {
    return (
        <>
            <title>{`Registrasre - ${CONFIG.appName}`}</title>
            <SignUpView />
        </>
    );
}