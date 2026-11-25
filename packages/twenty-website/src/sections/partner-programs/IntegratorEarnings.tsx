import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  Body,
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { IntegratorLedger } from './IntegratorLedger';

export function IntegratorEarnings() {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="light">
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Commission`)}</Eyebrow>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`Earn from *day one*`)}
          </Heading>
          <Body muted size="md">
            {i18n._(
              msg`20% of seat revenue on every client you bring, every month for a year.`,
            )}
          </Body>
        </SectionIntro>
        <IntegratorLedger
          footnote={i18n._(
            msg`Commission on Organization and Enterprise plans`,
          )}
        />
      </SectionStack>
    </SectionShell>
  );
}
