import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { AppPreview } from '@/app-preview/AppPreview';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { HERO_COMPOSITION, spacing } from '@/tokens';
import { Button, Eyebrow, Heading, SectionIntro, SectionShell } from '@/ui';

// The closer: the full product mockup in its static frame under a "try
// it live" intro, with the dash pattern fading in behind the lower half
// of the section (the shell's background slot, as on the home hero).
const PatternLayer = styled.div`
  bottom: 0;
  height: 60%;
  left: 50%;
  opacity: 0.6;
  pointer-events: none;
  position: absolute;
  transform: translateX(-50%);
  width: 100%;
`;

const patternImageClassName = css`
  object-fit: cover;
  object-position: center top;
`;

/* Block flow, not grid: a grid would blockify the inline-flex eyebrow
   and stretch it off-center. text-align centers every child as one
   mechanism. */
const IntroMeasure = styled.div`
  margin-inline: auto;
  text-align: center;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

// The old site hard-breaks the heading after "a"; the measure makes the
// same two-line break emerge (hero precedent — no <br>).
const HeadingMeasure = styled.div`
  max-width: 560px;
`;

// The mockup hangs at the hero's CTA-to-window measure, not the stack
// rhythm (user-ratified: the two CTA-over-mockup moments read the same).
const PreviewRoot = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

// Fixed at the scene's full width, not a responsive fit: on viewports narrower
// than the scene the mockup stays full-size and bleeds past the gutter, clipping
// at the section edge (the shell's overflow: clip) — the old site's full-size
// demo rather than a scaled-down one. The stage token is the single source.
const SceneBox = styled.div`
  aspect-ratio: ${APP_PREVIEW_STAGE.windowScene.widthPx} /
    ${APP_PREVIEW_STAGE.windowScene.heightPx};
  margin-inline: auto;
  width: ${APP_PREVIEW_STAGE.windowScene.widthPx}px;
`;

export function ProductDemo() {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={
        <PatternLayer aria-hidden>
          <NextImage
            alt=""
            className={patternImageClassName}
            fill
            sizes="(min-width: 921px) 100vw"
            src="/images/product/demo/background.webp"
          />
        </PatternLayer>
      }
      scheme="light"
    >
      <div>
        <SectionIntro>
          <IntroMeasure>
            <Eyebrow>{i18n._(msg`Try it live`)}</Eyebrow>
            <HeadingMeasure>
              <Heading as="h2" size="lg" weight="light">
                {i18n._(msg`A demo worth a *thousand words*`)}
              </Heading>
            </HeadingMeasure>
            <Button
              href="https://app.twenty.com/welcome"
              label={i18n._(msg`Try Twenty Cloud`)}
            />
          </IntroMeasure>
        </SectionIntro>
        <PreviewRoot>
          <SceneBox>
            <AppPreview mode="static" />
          </SceneBox>
        </PreviewRoot>
      </div>
    </SectionShell>
  );
}
