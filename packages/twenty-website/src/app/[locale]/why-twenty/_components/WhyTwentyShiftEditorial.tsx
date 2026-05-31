import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { Editorial } from '@/templates/Editorial';
import { theme } from '@/theme';

export function WhyTwentyShiftEditorial() {
  const i18n = getServerI18n();

  return (
    <Editorial
      scheme="dark"
      crosshair={{
        crossX: 'calc(100% - 120px)',
        crossY: '0px',
        lineColor: theme.colors.secondary.border[10],
      }}
      eyebrowColorScheme="secondary"
      eyebrow={i18n._(msg`The shift`)}
      heading={
        <Trans>
          <HeadingPart fontFamily="serif">CRM was a ledger.</HeadingPart>
          <HeadingPart fontFamily="sans">
            AI turned it into an operating system.
          </HeadingPart>
        </Trans>
      }
      bodyLayout="two-column-left"
      bodyParagraphs={[
        i18n._(
          msg`For twenty years, CRM meant the same thing: a place to log calls, track deals, and pull reports on Friday. The real work happened in people's heads, in Slack threads, in hallway conversations. The CRM kept score. Nobody expected more from it.`,
        ),
        i18n._(
          msg`AI agents are starting to draft outreach, score leads, research accounts, write follow-ups, update deal stages. Every one of these actions reads from and writes to the CRM. The scoreboard became the playbook. The database became the brain.`,
        ),
      ]}
    />
  );
}
