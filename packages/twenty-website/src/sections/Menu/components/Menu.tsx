import { MENU_DATA } from '@/sections/Menu/data';
import type { MenuScheme, MenuSocialLinkType } from '@/sections/Menu/types';

import { Cta } from './Cta';
import { Logo } from './Logo';
import { Nav } from './Nav';
import { Root } from './Root';
import { Social } from './Social';

type MenuProps = {
  backgroundColor: string;
  scheme?: MenuScheme;
  socialLinks: MenuSocialLinkType[];
};

export function Menu({
  backgroundColor,
  scheme = 'primary',
  socialLinks,
}: MenuProps) {
  return (
    <Root
      backgroundColor={backgroundColor}
      navItems={MENU_DATA.navItems}
      scheme={scheme}
      socialLinks={socialLinks}
    >
      <Logo scheme={scheme} />
      <Nav navItems={MENU_DATA.navItems} scheme={scheme} />
      <Social scheme={scheme} socialLinks={socialLinks} />
      <Cta scheme={scheme} />
    </Root>
  );
}
