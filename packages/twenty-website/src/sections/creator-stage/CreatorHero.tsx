import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import {
  color,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Button, Heading, SectionShell } from '@/ui';

import { CREATOR_HERO_MODEL_SETTINGS } from './creator-hero-model-settings';
import { CreatorApplyButton } from './CreatorApplyButton';

// Faint rows behind the object only, tone on tone, fading out before the copy.
const Backdrop = styled.div`
  inset: 0;
  position: absolute;

  &::after {
    background-image: repeating-linear-gradient(
      to bottom,
      ${color('white-10')} 0,
      ${color('white-10')} 1px,
      transparent 1px,
      transparent ${spacing(2)}
    );
    content: '';
    inset: 0;
    mask-image: radial-gradient(
      ellipse 40% 34% at 50% 78%,
      black 0%,
      transparent 74%
    );
    position: absolute;
  }
`;

// The /apps editorial hero: label, title, lede, actions, centred on the page
// column; the one lit object sits under the copy.
const Column = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-block: ${spacing(16)} ${spacing(12)};
  text-align: center;

  @keyframes creator-rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  @keyframes creator-fade {
    from {
      opacity: 0;
    }
  }

  ${mediaUp('md')} {
    padding-block: ${spacing(28)} ${spacing(16)};
  }
`;

const Copy = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;

  & > * {
    animation: creator-rise ${DURATION.xl} ${EASING.standard} both;
  }

  & > *:nth-child(2) {
    animation-delay: 80ms;
  }

  & > *:nth-child(3) {
    animation-delay: 160ms;
  }

  & > *:nth-child(4) {
    animation-delay: 240ms;
  }

  & > * + * {
    margin-top: ${spacing(6)};
  }

  & > * + [data-slot='actions'] {
    margin-top: ${spacing(8)};
  }

  ${REDUCED_MOTION} {
    & > * {
      animation: none;
    }
  }
`;

const Label = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.08em;
  line-height: 16px;
  text-transform: uppercase;
`;

const Lede = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 1.55;
  max-width: 480px;

  ${mediaUp('md')} {
    font-size: ${fontSize(4.5)};
  }
`;

const CtaRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

const ObjectStage = styled.div`
  animation: creator-fade 1600ms ${EASING.gentle} 400ms both;
  aspect-ratio: 1 / 1;
  margin-top: ${spacing(10)};
  max-width: 300px;
  width: 80%;

  ${mediaUp('md')} {
    margin-top: ${spacing(12)};
    max-width: 400px;
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

type CreatorHeroProps = {
  howItWorksAnchorId: string;
};

// PROTOTYPE direction D hero for /partners/creators.
export function CreatorHero({ howItWorksAnchorId }: CreatorHeroProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<Backdrop />}
      fullBleedBackground
      rhythm="flush"
      scheme="dark"
    >
      <Column>
        <Copy>
          <Label>{i18n._(msg`Partner program`)}</Label>
          <Heading as="h1" size="xl" weight="light">
            {i18n._(msg`Become a\n*Twenty creator*`)}
          </Heading>
          <Lede>
            {i18n._(
              msg`Create content or run a community. Earn 20% on every team you bring to Twenty, every month for a year.`,
            )}
          </Lede>
          <CtaRow data-slot="actions">
            <CreatorApplyButton />
            <Button
              href={`#${howItWorksAnchorId}`}
              label={i18n._(msg`How it works`)}
              variant="outlined"
            />
          </CtaRow>
        </Copy>
        <ObjectStage aria-hidden data-illustration="megaphone">
          <HalftoneModel
            loading="eager"
            modelUrl="/models/megaphone.glb"
            priority
            settings={CREATOR_HERO_MODEL_SETTINGS}
          />
        </ObjectStage>
      </Column>
    </SectionShell>
  );
}
