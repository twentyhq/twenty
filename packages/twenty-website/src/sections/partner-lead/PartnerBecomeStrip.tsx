import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { BecomePartnerButton } from '@/partner-application';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  fontFamily,
  mediaUp,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

const BecomeRow = styled.div`
  align-items: center;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  column-gap: ${spacing(6)};
  display: flex;
  flex-direction: column;
  padding: ${spacing(6)};
  row-gap: ${spacing(4)};

  ${mediaUp('sm')} {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const BecomeCopy = styled.div`
  max-width: 520px;

  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const LearnMoreLink = styled(LocalizedLink)`
  color: ${semanticColor.inkMuted};
  display: inline-block;
  font-family: ${fontFamily('sans')};
  text-decoration: underline;
  text-underline-offset: 2px;
  ${typeRampDeclarations('bodySm')}

  &:hover {
    color: ${semanticColor.ink};
  }
`;

export function PartnerBecomeStrip() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="muted">
      <BecomeRow>
        <BecomeCopy>
          <Heading as="h2" size="xs" weight="regular">
            {i18n._(msg`Want to *offer* Twenty services?`)}
          </Heading>
          <Body muted size="sm">
            {i18n._(
              msg`Agencies and freelancers can apply to join the certified directory.`,
            )}
          </Body>
          <LearnMoreLink href="/partners/become">
            {i18n._(msg`Learn more about the partner program`)}
          </LearnMoreLink>
        </BecomeCopy>
        <BecomePartnerButton label={msg`Become a partner`} variant="outlined" />
      </BecomeRow>
    </SectionShell>
  );
}
