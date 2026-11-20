import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { mediaUp, semanticColor, spacing } from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { CREATOR_CLOSING_MODEL } from './creator-closing-model';
import { CreatorApplyButton } from './CreatorApplyButton';

// Same frame as the integrators closing: title, model, then the action.
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

// The slot a new 3D shape drops into (creator-closing-model.ts).
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
  max-width: 420px;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

// PROTOTYPE the last call, the integrators' closing pattern.
export function CreatorClosing() {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="dark">
      <Layout>
        <Heading as="h2" size="xl" weight="light">
          {i18n._(msg`Ready to *apply?*`)}
        </Heading>
        <ModelSlot aria-hidden data-illustration="closing-slot">
          <HalftoneModel
            modelUrl={CREATOR_CLOSING_MODEL.modelUrl}
            settings={CREATOR_CLOSING_MODEL.settings}
          />
        </ModelSlot>
        <Aside>
          <Body muted size="sm">
            {i18n._(
              msg`We review every application within 5 business days and send your link once you're approved.`,
            )}
          </Body>
          <CreatorApplyButton />
        </Aside>
      </Layout>
    </SectionShell>
  );
}
