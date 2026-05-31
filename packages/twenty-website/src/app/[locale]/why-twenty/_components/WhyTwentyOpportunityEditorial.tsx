import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { Editorial } from '@/templates/Editorial';
import { theme } from '@/theme';

export function WhyTwentyOpportunityEditorial() {
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
      eyebrow={i18n._(msg`The opportunity`)}
      heading={
        <Trans>
          <HeadingPart fontFamily="serif">
            Build it in an afternoon.
          </HeadingPart>
          <HeadingPart fontFamily="sans">
            AI made the gap that small.
          </HeadingPart>
        </Trans>
      }
      bodyLayout="two-column-left"
      bodyParagraphs={[
        i18n._(
          msg`A year ago, customizing your CRM meant hiring a Salesforce consultant, learning Apex, waiting months. The gap between "I want this" and "it's live" was measured in quarters and invoices. So people settled. They bent their process to fit the tool and called it adoption.`,
        ),
        i18n._(
          msg`Now a developer can describe what they want to Claude Code and have a working app in an afternoon. A custom object, a scoring workflow, a new view, an integration. The bottleneck isn't building anymore. It's whether your platform lets you.`,
        ),
      ]}
    />
  );
}
