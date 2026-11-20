import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { color, mediaUp, radius, spacing } from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { PARTNERS_STAGE_CLOSING_MODEL } from './partners-stage-closing-model';

const Layout = styled.div`
  align-items: center;
  display: grid;
  gap: ${spacing(10)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    gap: ${spacing(16)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

const Copy = styled.div`
  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const BodyMeasure = styled.div`
  max-width: 440px;
`;

const Actions = styled.div`
  padding-top: ${spacing(2)};
`;

// Square slot, framed so a new model drops in without layout work.
const ModelSlot = styled.div`
  aspect-ratio: 1;
  border: 1px solid ${color('white-10')};
  border-radius: ${radius(2)};
  box-shadow: inset 0 1px 0 ${color('white-10')};
  margin-inline: auto;
  max-width: 480px;
  overflow: hidden;
  width: 100%;
`;

type PartnersStageClosingProps = {
  cta: ReactNode;
};

// PROTOTYPE
// The match offer again at the end of the page, on dark, with the 3D slot.
export function PartnersStageClosing({ cta }: PartnersStageClosingProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="dark">
      <Layout>
        <Copy>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`Didn't find the *right partner*?`)}
          </Heading>
          <BodyMeasure>
            <Body muted size="md">
              {i18n._(
                msg`Tell us what you need and we'll match you with a certified Twenty partner.`,
              )}
            </Body>
          </BodyMeasure>
          <Actions>{cta}</Actions>
        </Copy>
        <ModelSlot aria-hidden data-illustration="partners-closing-slot">
          <HalftoneModel
            modelUrl={PARTNERS_STAGE_CLOSING_MODEL.modelUrl}
            settings={PARTNERS_STAGE_CLOSING_MODEL.settings}
          />
        </ModelSlot>
      </Layout>
    </SectionShell>
  );
}
