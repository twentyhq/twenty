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

// The site header is the same composition on every page — logo, primary nav,
// social links and CTA over the shared Root chrome (sticky bar + mobile
// drawer). Only the surface background and color scheme vary per page, so the
// section owns the nav-item list and the child composition itself; pages just
// supply the per-page background, scheme, and stats-labelled social links.
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
