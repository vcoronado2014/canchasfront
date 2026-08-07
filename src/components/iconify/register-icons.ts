import type { IconifyIcon } from '@iconify/react';
import { addIcon } from '@iconify/react';
import allIcons from './icon-sets';

export const allIconNames = Object.keys(allIcons) as IconifyName[];
//export type IconifyName = keyof typeof allIcons;
export type IconifyName = keyof typeof allIcons | (string & {});

let areIconsRegistered = false;

export function registerIcons() {
  if (areIconsRegistered) {
    return;
  }

  Object.entries(allIcons).forEach(([iconName, iconData]) => {
    const isCarbon = iconName.startsWith('carbon:');
    const defaultSize = isCarbon ? 32 : 24;
    
    // Casteamos a IconifyIcon para que TypeScript reconozca width/height opcionales
    const icon = iconData as IconifyIcon;

    addIcon(iconName, {
      ...icon,
      width: icon.width ?? defaultSize,
      height: icon.height ?? defaultSize,
    });
  });

  areIconsRegistered = true;
}

/* import type { IconifyJSON } from '@iconify/react';

import { addCollection } from '@iconify/react';

import allIcons from './icon-sets';

// ----------------------------------------------------------------------

export const iconSets = Object.entries(allIcons).reduce((acc, [key, value]) => {
  const [prefix, iconName] = key.split(':');
  const existingPrefix = acc.find((item) => item.prefix === prefix);

  if (existingPrefix) {
    existingPrefix.icons[iconName] = value;
  } else {
    acc.push({
      prefix,
      icons: {
        [iconName]: value,
      },
    });
  }

  return acc;
}, [] as IconifyJSON[]);

export const allIconNames = Object.keys(allIcons) as IconifyName[];

export type IconifyName = keyof typeof allIcons;

// ----------------------------------------------------------------------

let areIconsRegistered = false;

export function registerIcons() {
  if (areIconsRegistered) {
    return;
  }

  iconSets.forEach((iconSet) => {
    const iconSetConfig = {
      ...iconSet,
      width: (iconSet.prefix === 'carbon' && 32) || 24,
      height: (iconSet.prefix === 'carbon' && 32) || 24,
    };

    addCollection(iconSetConfig);
  });

  areIconsRegistered = true;
}
 */