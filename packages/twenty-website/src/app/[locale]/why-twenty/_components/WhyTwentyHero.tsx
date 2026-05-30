import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';

import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import {
  HeroBody,
  HeroHeading,
  HeroSection,
  WhyTwentyVisual,
} from '@/sections/Hero';
import { theme } from '@/theme';

const headingClassName = css`
  color: ${theme.colors.secondary.text[100]};
`;

export function WhyTwentyHero() {
  const i18n = getServerI18n();

  return (
    <HeroSection scheme="dark">
      <HeroHeading className={headingClassName} size="xl">
        <HeadingPart fontFamily="serif">
          {i18n._(msg`The future of CRM is built,`)}
        </HeadingPart>{' '}
        <HeadingPart fontFamily="sans">{i18n._(msg`not bought.`)}</HeadingPart>
      </HeroHeading>
      <HeroBody maxWidthMd={443}>
        {i18n._(
          msg`CRM was a database you filled on Fridays. AI turned it into the system that runs your go-to-market. To differentiate, you have to build what your competitors can't buy.`,
        )}
      </HeroBody>
      <WhyTwentyVisual />
    </HeroSection>
  );
}
