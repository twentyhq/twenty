import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { PeopleGroupMark } from '@/icons';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import {
  Body,
  Button,
  ConnectingFrame,
  Eyebrow,
  Heading,
  SectionShell,
} from '@/ui';

import { CASE_STUDY_SLUGS } from './case-studies';
import { PromoMic } from './PromoMic';

// The section is a flush shell so its background frame can connect up to the
// TrustedBy band; the Grid is then the SOLE owner of the promo's generous
// vertical breathing (the old site's framed composition). The bottom inset
// runs deeper than the top because the frame's base line sits 48px up from the
// section's edge, so the content needs more room beneath it to read balanced.
const Grid = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr;
  padding-block: ${spacing(16)} ${spacing(28)};
  width: 100%;

  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    column-gap: ${spacing(16)};
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    /* Keep the content off the frame rails: without an internal inset the
       centred mic column shrinks onto the left rail as the viewport narrows. */
    padding-block: ${spacing(20)} ${spacing(36)};
    padding-inline: ${spacing(6)};

    & > * + * {
      margin-top: 0;
    }
  }
`;

const VisualColumn = styled.div`
  align-items: center;
  display: flex;
  min-height: 360px;
  min-width: 0;
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    min-height: 500px;
  }
`;

const VisualStage = styled.div`
  aspect-ratio: 1 / 1;
  margin-inline: auto;
  max-width: 480px;
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    max-width: 500px;
  }
`;

// The floating count chip overlaps the mic visual at its lower-left corner.
const CountChip = styled.div`
  align-items: center;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  bottom: ${spacing(4)};
  column-gap: ${spacing(2)};
  display: flex;
  left: ${spacing(4)};
  padding: ${spacing(2)} ${spacing(3)};
  position: absolute;
  z-index: 2;

  ${mediaUp('md')} {
    bottom: ${spacing(5)};
    left: ${spacing(5)};
  }
`;

const CountLabel = styled.span`
  align-items: center;
  color: ${color('black')};
  column-gap: ${spacing(1.5)};
  display: inline-flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

// The label text reads black, but the glyph stays brand blue on this white
// chip; scope the ink to the mark the way every currentColor icon is tinted.
const GlyphInk = styled.span`
  color: ${color('blue')};
  display: inline-flex;
`;

const TextColumn = styled.div`
  max-width: 520px;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    & > * + * {
      margin-top: ${spacing(8)};
    }
  }
`;

const BodyMeasure = styled.div`
  ${mediaUp('md')} {
    max-width: 400px;
  }
`;

export function CaseStudyPromo() {
  const i18n = getServerI18n();
  const count = CASE_STUDY_SLUGS.length;

  return (
    <SectionShell
      ariaLabel={i18n._(msg`Customer stories preview`)}
      background={<ConnectingFrame />}
      connectsUp
      rhythm="flush"
      scheme="light"
    >
      <Grid>
        <VisualColumn>
          <VisualStage>
            <PromoMic />
            <CountChip aria-hidden>
              <CountLabel>
                <GlyphInk>
                  <PeopleGroupMark sizePx={12} />
                </GlyphInk>
                {i18n._(msg`${count} Case Studies`)}
              </CountLabel>
            </CountChip>
          </VisualStage>
        </VisualColumn>

        <TextColumn>
          <Eyebrow>{i18n._(msg`Customer Stories`)}</Eyebrow>
          <Heading size="lg" weight="light">
            {i18n._(msg`How teams\n*built with Twenty*`)}
          </Heading>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Meet the teams who shaped Twenty into their own CRM with self-hosted deployments, AI-assisted workflows, and API-first product stacks.`,
              )}
            </Body>
          </BodyMeasure>
          <Button
            href="/customers"
            label={i18n._(msg`Explore customer stories`)}
            variant="outlined"
          />
        </TextColumn>
      </Grid>
    </SectionShell>
  );
}
