import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import {
  Body,
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { AFFILIATE_AUDIENCES } from './affiliate-audiences.data';

const HeadingMeasure = styled.div`
  ${mediaUp('md')} {
    max-width: 640px;
  }
`;

const AudienceGrid = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const AudienceCard = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)} ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const AudienceMarker = styled.span`
  background-color: ${color('blue')};
  border-radius: 1px;
  display: block;
  height: 7px;
  width: 14px;
`;

const AudienceTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
  line-height: 1.3;
`;

export function AffiliateAudiences() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Who it's for`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`People teams trust *to pick their tools*`)}
            </Heading>
          </HeadingMeasure>
        </SectionIntro>
        <AudienceGrid>
          {AFFILIATE_AUDIENCES.map((audience) => (
            <AudienceCard key={audience.title.id}>
              <AudienceMarker aria-hidden />
              <AudienceTitle>{i18n._(audience.title)}</AudienceTitle>
              <Body muted size="sm">
                {i18n._(audience.body)}
              </Body>
            </AudienceCard>
          ))}
        </AudienceGrid>
      </SectionStack>
    </SectionShell>
  );
}
