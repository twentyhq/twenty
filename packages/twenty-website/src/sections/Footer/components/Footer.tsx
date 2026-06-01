import { FOOTER_DATA } from '@/sections/Footer/data';

import { Bottom } from './Bottom';
import { Logo } from './Logo';
import { Nav } from './Nav';
import { Root } from './Root';

export function Footer() {
  return (
    <Root>
      <Logo />
      <Nav groups={FOOTER_DATA.navGroups} />
      <Bottom
        copyright={FOOTER_DATA.bottom.copyright}
        links={FOOTER_DATA.socialLinks}
      />
    </Root>
  );
}
