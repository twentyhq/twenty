import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
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
import { AUDIENCE_MODEL_SETTINGS } from './audience-model-settings';

const AUDIENCE_MODEL_SIZE_PX = 160;

const HeadingMeasure = styled.div`
  scroll-margin-top: ${spacing(32)};

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
  padding: ${spacing(6)};

  ${mediaUp('sm')} {
    padding: ${spacing(8)};
  }

  & > * + * {
    margin-top: ${spacing(2)};
  }

  & > * + h3 {
    margin-top: ${spacing(4)};
  }
`;

const AudienceVisual = styled.div`
  --audience-model-size: ${spacing(30)};
  height: var(--audience-model-size);
  width: var(--audience-model-size);

  ${mediaUp('sm')} {
    --audience-model-size: ${AUDIENCE_MODEL_SIZE_PX}px;
  }

  img {
    display: block;
    height: 100%;
    width: 100%;
  }
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
    <SectionShell rhythm="section" scheme="muted">
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Who it's for`)}</Eyebrow>
          <HeadingMeasure id="audiences">
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`People that teams trust *to pick their tools*`)}
            </Heading>
          </HeadingMeasure>
        </SectionIntro>
        <AudienceGrid>
          {AFFILIATE_AUDIENCES.map((audience) => (
            <AudienceCard key={audience.title.id}>
              <AudienceVisual aria-hidden data-illustration={audience.model}>
                <HalftoneModel
                  modelUrl={`/models/${audience.model}.glb`}
                  poster={
                    <NextImage
                      alt=""
                      height={AUDIENCE_MODEL_SIZE_PX}
                      src={`/images/partners/audiences/${audience.model}.webp`}
                      unoptimized
                      width={AUDIENCE_MODEL_SIZE_PX}
                    />
                  }
                  reducedMotionMode="poster"
                  settings={AUDIENCE_MODEL_SETTINGS}
                />
              </AudienceVisual>
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
