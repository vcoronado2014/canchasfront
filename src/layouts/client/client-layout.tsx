import type { PropsWithChildren } from "react";

import Box from "@mui/material/Box";

//import { ClientNav } from "./client-nav";
import { NavDesktop, NavMobile } from "./client-nav";
import { ClientContent } from "./client-content";
import { HeaderSection, HeaderSectionProps, layoutClasses, LayoutSection, LayoutSectionProps, MainSection, MainSectionProps } from "../core";
import { Alert, Breakpoint, useTheme } from "@mui/material";
import { useAuth } from "src/auth/use-auth";
import { useBoolean } from "minimal-shared/hooks";
import { clientNavData } from "./nav-config-client";
import { MenuButton } from "../components/menu-button";
import { _workspaces } from "../nav-config-workspace";
import { Searchbar } from "../components/searchbar";
import { LanguagePopover } from "../components/language-popover";
import { NotificationsPopover } from "../components/notifications-popover";
import { _langs, _notifications } from "src/_mock";
import { AccountPopover } from "../components/account-popover";
import { _account } from "../nav-config-account";
import { merge } from "es-toolkit";
import { dashboardLayoutVars } from "../dashboard/css-vars";

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
  };
};

export function ClientLayout({
    sx,
    cssVars,
    children,
    slotProps,
    layoutQuery = 'lg',
}: DashboardLayoutProps) {
    const theme = useTheme();
    const { user } = useAuth();

    const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

    //clientNavData
    const renderHeader = () => {
        const headerSlotProps: HeaderSectionProps['slotProps'] = {
            container: {
                maxWidth: false,
            },
        };

        const headerSlots: HeaderSectionProps['slots'] = {
            topArea: (
                <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                    This is an info Alert.
                </Alert>
            ),
            leftArea: (
                <>
                    {/** @slot Nav mobile */}
                    <MenuButton
                        onClick={onOpen}
                        sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
                    />
                    <NavMobile data={clientNavData} open={open} onClose={onClose} workspaces={_workspaces} />
                </>
            ),
            rightArea: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
                    {/** @slot Searchbar */}
                    <Searchbar />

                    {/** @slot Language popover */}
                    <LanguagePopover data={_langs} />

                    {/** @slot Notifications popover */}
                    <NotificationsPopover data={_notifications} />

                    {/** @slot Account drawer */}
                    <AccountPopover data={_account} />
                </Box>
            ),
        };

        return (
            <HeaderSection
                disableElevation
                layoutQuery={layoutQuery}
                {...slotProps?.header}
                slots={{ ...headerSlots, ...slotProps?.header?.slots }}
                slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
                sx={slotProps?.header?.sx}
            />
        );
    };

    const renderFooter = () => null;

    const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

      return (
        <LayoutSection
          /** **************************************
           * @Header
           *************************************** */
          headerSection={renderHeader()}
          /** **************************************
           * @Sidebar
           *************************************** */
          sidebarSection={
            <NavDesktop data={clientNavData} layoutQuery={layoutQuery} workspaces={_workspaces} />
          }
          /** **************************************
           * @Footer
           *************************************** */
          footerSection={renderFooter()}
          /** **************************************
           * @Styles
           *************************************** */
          cssVars={{ ...dashboardLayoutVars(theme), ...cssVars }}
          sx={[
            {
              [`& .${layoutClasses.sidebarContainer}`]: {
                [theme.breakpoints.up(layoutQuery)]: {
                  pl: 'var(--layout-nav-vertical-width)',
                  transition: theme.transitions.create(['padding-left'], {
                    easing: 'var(--layout-transition-easing)',
                    duration: 'var(--layout-transition-duration)',
                  }),
                },
              },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {renderMain()}
        </LayoutSection>
      );

}


/* export function ClientLayout({

    children,

}: PropsWithChildren) {


    return (

        <Box
            sx={{
                minHeight:"100vh",
                display:"flex",
                flexDirection:"column",
                bgcolor:"background.default",
            }}
        >

            <ClientNav />


            <ClientContent>

                {children}

            </ClientContent>


        </Box>

    );

} */