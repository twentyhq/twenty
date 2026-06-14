import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { HeadingPart } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { Editorial } from '@/templates/Editorial';
import { theme } from '@/theme';

export function WhyTwentyMeaningEditorial() {
  const i18n = getServerI18n();

  return (
    <Editorial
      scheme="dark"
      crosshair={{
        crossX: '120px',
        crossY: '0px',
        lineColor: theme.colors.secondary.border[10],
      }}
      introAlign="right"
      eyebrowColorScheme="secondary"
      eyebrow={i18n._(msg`What this means`)}
      heading={
        <Trans>
          <HeadingPart fontFamily="serif">Differentiation now</HeadingPart>
          <HeadingPart fontFamily="sans">
            lives in the code you own.
          </HeadingPart>
        </Trans>
      }
      bodyLayout="two-column-right"
      bodyParagraphs={[
        i18n._(
          msg`You don't buy your deployment pipeline off the shelf. You don't rent your data warehouse from a vendor who decides the schema. You build it, you own it, you iterate on it every week. CRM is going the same way. The teams that treat it as infrastructure they own will compound an advantage every quarter.`,
        ),
        i18n._(
          msg`Tuesday your team learns that deals with a technical champion close 3x faster. Wednesday you add the field, wire up the scoring, adjust the workflow. By Thursday your agents are acting on it. That feedback loop is the edge. And it only works if the CRM is yours.`,
        ),
      ]}
    />
  );
}
