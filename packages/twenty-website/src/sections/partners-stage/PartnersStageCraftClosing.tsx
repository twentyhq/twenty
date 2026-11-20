import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { SectionShell, Signoff } from '@/ui';

import { PARTNERS_STAGE_CRAFT_COLUMN } from './partners-stage-craft-column';

// PROTOTYPE (?direction=e): the site's Signoff for the closing call to
// action, then the integrator offer as a quiet row under a hairline.
const Offer = styled.div`
  align-items: center;
  border-top: 1px solid ${semanticColor.line};
  ${PARTNERS_STAGE_CRAFT_COLUMN}
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  padding: ${spacing(6)} 0;

  ${mediaUp('md')} {
    flex-direction: row;
    justify-content: space-between;
    padding: ${spacing(6)} 0;
  }
`;

const OfferText = styled.div`
  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const OfferTitle = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 22px;
`;

const OfferLink = styled(LocalizedLink)`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: ${semanticColor.ink};
  }
`;

const Bottom = styled.div`
  height: ${spacing(20)};

  ${mediaUp('md')} {
    height: ${spacing(30)};
  }
`;

type PartnersStageCraftClosingProps = {
  action: ReactNode;
  offerAction: ReactNode;
};

export function PartnersStageCraftClosing({
  action,
  offerAction,
}: PartnersStageCraftClosingProps) {
  const i18n = getServerI18n();

  return (
    <>
      <Signoff
        body={i18n._(
          msg`Tell us what you need and we'll match you with a certified Twenty partner.`,
        )}
        heading={i18n._(msg`Didn't find the *right partner*?`)}
        scheme="dark"
      >
        {action}
      </Signoff>
      <SectionShell flushInline rhythm="flush" scheme="dark">
        <Offer>
          <OfferText>
            <OfferTitle>
              {i18n._(
                msg`Agencies and freelancers who implement Twenty can join as integrators.`,
              )}
            </OfferTitle>
            <OfferLink href="/partners/integrators">
              {i18n._(msg`Learn more about the integrator program`)}
            </OfferLink>
          </OfferText>
          {offerAction}
        </Offer>
        <Bottom />
      </SectionShell>
    </>
  );
}
