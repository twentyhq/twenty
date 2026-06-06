import { Trans } from '@lingui/react/macro';
import { css } from '@linaria/core';

import { HeadingPart } from '@/design-system/components';
import { HeroBody, HeroHeading, HeroSection } from '@/templates/Hero';
import { WhyTwentyVisual } from '@/sections/Hero';
import { theme } from '@/theme';

const headingClassName = css`
  color: ${theme.colors.secondary.text[100]};
`;

export function WhyTwentyHero() {
  return (
    <HeroSection scheme="dark">
      <HeroHeading className={headingClassName} size="xl">
        <Trans>
          <HeadingPart fontFamily="serif">
            The future of CRM is built,
          </HeadingPart>
          <HeadingPart fontFamily="sans">not bought.</HeadingPart>
        </Trans>
      </HeroHeading>
      <HeroBody maxWidthMd={443}>
        <Trans>
          CRM was a database you filled on Fridays. AI turned it into the system
          that runs your go-to-market. To differentiate, you have to build what
          your competitors can't buy.
        </Trans>
      </HeroBody>
      <WhyTwentyVisual />
    </HeroSection>
  );
}
