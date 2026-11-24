import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import {
  getIndustryObjectLabel,
  type ResolvedIndustryPage,
} from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { fontFamily, fontSize, semanticColor, spacing } from '@/tokens';
import { SectionShell, SectionStack } from '@/ui';

import { IndustryPointGrid } from './IndustryPointGrid';
import { IndustrySectionIntro } from './IndustrySectionIntro';

const FieldList = styled.ul`
  list-style: none;
  padding: 0;

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const FieldItem = styled.li`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

type IndustryDataModelProps = {
  page: ResolvedIndustryPage;
};

export function IndustryDataModel({ page }: IndustryDataModelProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="dark">
      <SectionStack>
        <IndustrySectionIntro
          heading={page.dataModel.heading}
          sectionId="dataModel"
        />
        <IndustryPointGrid
          items={page.dataModel.objects.map((object) => ({
            key: object.id,
            title: i18n._(object.label),
            body: i18n._(object.purpose),
            detail: (
              <FieldList>
                {object.fields.map((field) => {
                  const label = i18n._(field.label);
                  const targetLabel = isDefined(field.relatesTo)
                    ? getIndustryObjectLabel(page, field.relatesTo)
                    : undefined;
                  const target = isDefined(targetLabel)
                    ? i18n._(targetLabel)
                    : undefined;
                  return (
                    <FieldItem key={field.label.id}>
                      {isDefined(target) ? `${label} → ${target}` : label}
                    </FieldItem>
                  );
                })}
              </FieldList>
            ),
          }))}
        />
        <IndustryPointGrid
          items={page.dataModel.notes.map((note) => ({
            key: note.title.id,
            title: i18n._(note.title),
            body: i18n._(note.body),
          }))}
        />
      </SectionStack>
    </SectionShell>
  );
}
