import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect, useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useAuth } from 'src/auth/use-auth';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

import { NavUpgrade } from '../components/nav-upgrade';
import { WorkspacesPopover } from '../components/workspaces-popover';

import type { NavItem } from '../nav-config-dashboard';
import type { WorkspacesPopoverProps } from '../components/workspaces-popover';

import { Iconify } from 'src/components/iconify';
import { Collapse } from '@mui/material';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces: WorkspacesPopoverProps['data'];
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, workspaces, sx }: NavContentProps) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const { user } = useAuth();

  // Función auxiliar para verificar si el usuario tiene el rol requerido
  const hasPermission = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(user?.rol ?? '');
  };

  // Filtrar ítems principales:
  // Se muestra si el usuario tiene acceso al padre O si tiene acceso a al menos un hijo
  const menu = data.filter((item) => {
    const parentAllowed = hasPermission(item.roles);
    const hasAllowedChildren = item.children?.some((child) => hasPermission(child.roles));

    return parentAllowed || hasAllowedChildren;
  });

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <>
      <Logo />

      {slots?.topArea}

      <Scrollbar fillContent sx={{ my: 2 }}>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {menu.map((item) => {
              // Filtrar submenús (hijos) según los roles del usuario
              const filteredChildren = item.children?.filter((child) =>
                hasPermission(child.roles)
              );

              const hasChildren = !!filteredChildren?.length;
              const isOpen = !!openMenus[item.title];

              const isActived = hasChildren
                ? filteredChildren!.some((child) => pathname.startsWith(child.path))
                : pathname === item.path;

              return (
                <ListItem
                  disableGutters
                  disablePadding
                  key={item.title}
                  sx={{ display: 'block' }}
                >
                  {/* BOTÓN PADRE */}
                  <ListItemButton
                    disableGutters
                    component={hasChildren ? 'div' : RouterLink}
                    href={!hasChildren ? item.path : undefined}
                    onClick={hasChildren ? () => toggleMenu(item.title) : undefined}
                    sx={(theme) => ({
                      pl: 2,
                      py: 1,
                      gap: 2,
                      pr: 1.5,
                      borderRadius: 0.75,
                      typography: 'body2',
                      fontWeight: 'fontWeightMedium',
                      color: theme.vars.palette.text.secondary,
                      minHeight: 44,
                      ...(isActived && {
                        fontWeight: 'fontWeightSemiBold',
                        color: theme.vars.palette.primary.main,
                        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                      }),
                    })}
                  >
                    {item.icon && (
                      <Box component="span" sx={{ width: 24, height: 24 }}>
                        {item.icon}
                      </Box>
                    )}

                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Box>

                    {hasChildren && (
                      <Iconify
                        icon={isOpen ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
                        width={16}
                      />
                    )}
                  </ListItemButton>

                  {/* SUBMENÚ (HIJOS FILTRADOS) */}
                  {hasChildren && (
                    <Collapse
                      in={isOpen}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box component="ul" sx={{ pl: 3, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {filteredChildren!.map((child) => {
                          const childActive = pathname === child.path;

                          return (
                            <ListItem key={child.title} disablePadding>
                              <ListItemButton
                                disableGutters
                                component={RouterLink}
                                href={child.path}
                                sx={(theme) => ({
                                  pl: 3,
                                  py: 0.75,
                                  gap: 1.5,
                                  pr: 1.5,
                                  borderRadius: 0.75,
                                  typography: 'body2',
                                  fontWeight: 'fontWeightMedium',
                                  color: theme.vars.palette.text.secondary,
                                  minHeight: 36,
                                  ...(childActive && {
                                    fontWeight: 'fontWeightSemiBold',
                                    color: theme.vars.palette.primary.main,
                                    bgcolor: varAlpha(
                                      theme.vars.palette.primary.mainChannel,
                                      0.08
                                    ),
                                  }),
                                  '&:hover': {
                                    bgcolor: varAlpha(
                                      theme.vars.palette.primary.mainChannel,
                                      0.04
                                    ),
                                  },
                                })}
                              >
                                {child.icon && (
                                  <Box component="span" sx={{ width: 20, height: 20 }}>
                                    {child.icon}
                                  </Box>
                                )}

                                <Box component="span" sx={{ flexGrow: 1 }}>
                                  {child.title}
                                </Box>

                                {child.info}
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </Box>
                    </Collapse>
                  )}
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      <NavUpgrade /> 

      {slots?.bottomArea}
    </>
  );
}
