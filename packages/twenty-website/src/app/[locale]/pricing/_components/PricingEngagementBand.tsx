import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { BecomePartnerButton } from '@/app/[locale]/partners/components/PartnerApplication';
import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { EngagementBand } from '@/sections/EngagementBand';
import { theme } from '@/theme';

const PricingBannerContainer = styled.div`
  margin: 0 auto;
  width: 100%;
`;

export function PricingEngagementBand() {
  const i18n = getServerI18n();

  return (
    <EngagementBand.Root scheme="muted">
      <PricingBannerContainer>
        <EngagementBand.Strip
          desktopCopyMaxWidth="60%"
          fillColor={theme.colors.primary.background[100]}
          variant="primary"
        >
          <EngagementBand.Copy>
            <EngagementBand.Heading>
              <HeadingPart fontFamily="serif">
                {i18n._(msg`Need help with customization?`)}
              </HeadingPart>
            </EngagementBand.Heading>
            <EngagementBand.Body>
              {i18n._(
                msg`Find the right partner to implement, customize, and tailor Twenty to your team.`,
              )}
            </EngagementBand.Body>
          </EngagementBand.Copy>
          <EngagementBand.Actions>
            <BecomePartnerButton
              color="secondary"
              label={msg`Find a partner`}
              variant="outlined"
            />
          </EngagementBand.Actions>
        </EngagementBand.Strip>
      </PricingBannerContainer>
    </EngagementBand.Root>
  );
}
