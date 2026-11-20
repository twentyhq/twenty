import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import {
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Heading, SectionShell } from '@/ui';

import { CREATOR_FACTS } from './creator-facts.data';
import { CREATOR_TERMS_MODEL } from './creator-terms-model';

const Card = styled.article`
  animation: creator-terms-card-in ${DURATION.xl} ${EASING.standard} backwards;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  margin-inline: auto;
  max-width: 1040px;
  overflow: hidden;

  ${mediaUp('md')} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  @keyframes creator-terms-card-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Copy = styled.div`
  padding: ${spacing(8)};

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const Head = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Tagline = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 1.5;
  max-width: 420px;
`;

const Terms = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const TermsIntro = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
`;

const TermList = styled.ul`
  list-style: none;
  padding: 0;

  & > li {
    align-items: center;
    column-gap: ${spacing(3)};
    display: flex;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    line-height: 22px;
    padding-block: ${spacing(1.5)};
  }

  & > li > svg {
    color: ${semanticColor.ink};
    flex-shrink: 0;
  }
`;

const TermValue = styled.span`
  color: ${semanticColor.ink};
`;

const TermLabel = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

// The 3D slot: Twenty dash rows behind the coin, fading at the edges.
const Visual = styled.div`
  align-items: center;
  display: flex;
  height: 240px;
  justify-content: center;
  position: relative;

  ${mediaUp('md')} {
    height: auto;
    min-height: 320px;
  }

  &::before {
    background-image: repeating-linear-gradient(
      to bottom,
      ${semanticColor.line} 0 1px,
      transparent 1px 8px
    );
    content: '';
    inset: 0;
    mask-image: radial-gradient(ellipse 60% 70% at 50% 50%, black, transparent);
    position: absolute;
  }
`;

const ModelMount = styled.div`
  aspect-ratio: 1 / 1;
  height: 200px;
  position: relative;

  ${mediaUp('md')} {
    height: 240px;
  }
`;

export function CreatorTermsCard() {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm scheme="dark">
      <Card>
        <Copy>
          <Head>
            <Heading as="h2" size="md" weight="light">
              {i18n._(msg`Earn 20% *for 12 months*`)}
            </Heading>
            <Tagline>
              {i18n._(
                msg`Of seat revenue on Cloud Organization and Enterprise plans, per customer, counted from their first payment.`,
              )}
            </Tagline>
          </Head>
          <Terms>
            <TermsIntro>{i18n._(msg`Includes`)}</TermsIntro>
            <TermList>
              {CREATOR_FACTS.map((fact) => {
                const FactIcon = fact.icon;

                return (
                  <li key={fact.label.id}>
                    <FactIcon aria-hidden size={16} />
                    <TermValue>{i18n._(fact.value)}</TermValue>
                    <TermLabel>{i18n._(fact.label)}</TermLabel>
                  </li>
                );
              })}
            </TermList>
          </Terms>
        </Copy>
        <Visual aria-hidden data-model-slot="creator-terms-coin">
          <ModelMount>
            <HalftoneModel
              initialPose={CREATOR_TERMS_MODEL.initialPose}
              modelUrl={CREATOR_TERMS_MODEL.modelUrl}
              settings={CREATOR_TERMS_MODEL.settings}
            />
          </ModelMount>
        </Visual>
      </Card>
    </SectionShell>
  );
}
