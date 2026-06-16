import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { SALESFARCE_DATA } from './salesfarce-data';
import { SalesfarceFlow } from './salesfarce-flow';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    align-items: start;
    column-gap: ${spacing(10)};
    grid-template-columns: minmax(0, 400px) minmax(0, 672px);
    justify-content: space-between;

    & > * + * {
      margin-top: 0;
    }
  }
`;

const CopyColumn = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }

  ${mediaUp('md')} {
    align-self: center;
  }
`;

export function PricingSalesfarce() {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="muted">
      <Grid>
        <CopyColumn>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`Trust the n°1 CRM, *or not!*`)}
          </Heading>
          <Body muted size="sm">
            {i18n._(SALESFARCE_DATA.body)}
          </Body>
        </CopyColumn>
        <SalesfarceFlow pricing={SALESFARCE_DATA.pricing} />
      </Grid>
    </SectionShell>
  );
}
