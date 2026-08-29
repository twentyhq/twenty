import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Body } from '@/ui';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { ProfileEyebrow } from './ProfileEyebrow';
import { ProfileSectionTitle } from './ProfileSectionTitle';
import { MARKETPLACE_COPY } from './marketplace-copy';
import { resolvePartnerScopeCards } from './resolve-partner-scope-cards';
import { type PartnerScope } from './partner-scopes';

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
`;

const CoverageGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
`;

const CoverageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1.5)};
`;

const CoverageLabel = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.25;
`;

const SkillsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};

  &[data-separated='true'] {
    border-top: 1px solid ${semanticColor.line};
    padding-top: ${spacing(4)};
  }
`;

const SkillsRow = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1.5)};
  list-style: none;
  padding: 0;
`;

const SkillChip = styled.li`
  background-color: ${color('blue-5')};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  padding: ${spacing(1.5)} ${spacing(2.5)};
`;

export function PartnerCoverageSection({
  partnerScope,
  skills,
}: {
  partnerScope: readonly PartnerScope[];
  skills: readonly string[];
}) {
  const scopeCards = resolvePartnerScopeCards(partnerScope);
  const hasScopes = scopeCards.length > 0;
  const hasSkills = skills.length > 0;

  if (!hasScopes && !hasSkills) {
    return null;
  }

  const i18n = getServerI18n();

  return (
    <Section aria-labelledby="partner-coverage-title">
      <ProfileSectionTitle id="partner-coverage-title">
        {i18n._(MARKETPLACE_COPY.partnerScopeHeading)}
      </ProfileSectionTitle>
      {hasScopes && (
        <CoverageGroups>
          {scopeCards.map((scope) => (
            <CoverageGroup key={scope.value}>
              <CoverageLabel>{i18n._(scope.label)}</CoverageLabel>
              <Body as="p" muted size="sm">
                {i18n._(msg`ex. ${i18n._(scope.examples)}`)}
              </Body>
            </CoverageGroup>
          ))}
        </CoverageGroups>
      )}
      {hasSkills && (
        <SkillsBlock data-separated={hasScopes ? 'true' : undefined}>
          <ProfileEyebrow>{i18n._(msg`Technical skills`)}</ProfileEyebrow>
          <SkillsRow aria-label={i18n._(msg`Skills`)}>
            {skills.map((skill) => (
              <SkillChip key={skill}>{skill}</SkillChip>
            ))}
          </SkillsRow>
        </SkillsBlock>
      )}
    </Section>
  );
}
