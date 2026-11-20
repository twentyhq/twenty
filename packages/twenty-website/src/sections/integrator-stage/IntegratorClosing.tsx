import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import {
  FONT_WEIGHT,
  fontFamily,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { Heading, SectionShell } from '@/ui';

import { INTEGRATOR_CLOSING_MODEL } from './integrator-closing-model-settings';
import { IntegratorApplyButton } from './IntegratorApplyButton';

// Same frame as the creators closing: title, model, then the action.
const Layout = styled.div`
  border-top: 1px solid ${semanticColor.line};
  padding-top: ${spacing(12)};

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    align-items: end;
    column-gap: ${spacing(16)};
    display: grid;
    grid-template-columns: minmax(0, 6fr) minmax(0, 3fr) minmax(0, 4fr);
    padding-top: ${spacing(20)};

    & > * + * {
      margin-top: 0;
    }
  }
`;

const ModelSlot = styled.div`
  aspect-ratio: 1 / 1;
  margin-inline: auto;
  max-width: 140px;
  width: 40%;

  ${mediaUp('md')} {
    max-width: 160px;
    width: 100%;
  }
`;

const Aside = styled.div`
  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const Notes = styled.ul`
  list-style: none;
  padding: 0;

  & > li {
    color: ${semanticColor.inkMuted};
    font-family: ${fontFamily('mono')};
    font-size: 11px;
    font-weight: ${FONT_WEIGHT.medium};
    letter-spacing: 0.06em;
    line-height: 20px;
    text-transform: uppercase;
  }
`;

type IntegratorClosingProps = {
  heading: MessageDescriptor;
  notes: readonly MessageDescriptor[];
};

// PROTOTYPE direction d: the last call, no frame.
export function IntegratorClosing({ heading, notes }: IntegratorClosingProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="dark">
      <Layout>
        <Heading as="h2" size="xl" weight="light">
          {i18n._(heading)}
        </Heading>
        <ModelSlot aria-hidden data-model-slot="integrator-closing">
          <HalftoneModel
            initialPose={INTEGRATOR_CLOSING_MODEL.initialPose}
            modelUrl={INTEGRATOR_CLOSING_MODEL.modelUrl}
            settings={INTEGRATOR_CLOSING_MODEL.settings}
          />
        </ModelSlot>
        <Aside>
          <Notes>
            {notes.map((note) => (
              <li key={note.id}>{i18n._(note)}</li>
            ))}
          </Notes>
          <IntegratorApplyButton />
        </Aside>
      </Layout>
    </SectionShell>
  );
}
