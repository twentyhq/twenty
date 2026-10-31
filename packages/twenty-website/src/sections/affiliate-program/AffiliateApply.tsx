import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { AffiliateApplicationForm } from '@/affiliate-application';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { color, mediaUp, radius, semanticColor, spacing } from '@/tokens';
import { Body, CornerMarkers, Heading, HeadingPair, SectionShell } from '@/ui';

const ApplyStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const HeadingMeasure = styled.div`
  max-width: 615px;
`;

const BodyMeasure = styled.div`
  max-width: 440px;
`;

const FormCard = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  max-width: 720px;
  padding: ${spacing(6)};
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    padding: ${spacing(10)};
  }
`;

export function AffiliateApply() {
  const i18n = getServerI18n();

  return (
    <SectionShell
      ariaLabel={i18n._(msg`Affiliate program application`)}
      rhythm="section"
      scheme="light"
    >
      <ApplyStack id="apply">
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Ready *to start?*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`We review every application within 5 business days and send your link once you're approved.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <FormCard>
          <CornerMarkers />
          <AffiliateApplicationForm />
        </FormCard>
      </ApplyStack>
    </SectionShell>
  );
}
