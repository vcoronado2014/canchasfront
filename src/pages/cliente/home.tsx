import Typography from "@mui/material/Typography";
import { CONFIG } from 'src/config-global';
import { HomeView } from "src/sections/home/view/home-view";

export default function ClienteHomePage() {

    return (
        <>
            <title>{`Home - ${CONFIG.appName}`}</title>

            <HomeView />
        </>
    );

}