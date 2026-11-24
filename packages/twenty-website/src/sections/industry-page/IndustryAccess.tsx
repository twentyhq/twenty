import { styled } from '@linaria/react';

import {
  getIndustryObjectLabel,
  type ResolvedIndustryPage,
} from '@/industries';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { fontFamily, fontSize, semanticColor, spacing } from '@/tokens';
import { SectionShell, SectionStack } from '@/ui';

import { IndustrySectionIntro } from './IndustrySectionIntro';

const TableScroll = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  border-collapse: collapse;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  min-width: 640px;
  width: 100%;

  th,
  td {
    border-bottom: 1px solid ${semanticColor.line};
    padding: ${spacing(3)} ${spacing(4)} ${spacing(3)} 0;
    text-align: left;
  }

  th {
    color: ${semanticColor.inkMuted};
    font-weight: inherit;
  }
`;

type IndustryAccessProps = {
  page: ResolvedIndustryPage;
};

export function IndustryAccess({ page }: IndustryAccessProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="muted">
      <SectionStack>
        <IndustrySectionIntro
          heading={page.access.heading}
          sectionId="access"
        />
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th scope="col" />
                {page.access.roles.map((role) => (
                  <th key={role.id} scope="col">
                    {i18n._(role.label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.access.rules.map((rule) => {
                const objectLabel = getIndustryObjectLabel(page, rule.objectId);
                return (
                  <tr key={rule.objectId}>
                    <th scope="row">
                      {objectLabel ? i18n._(objectLabel) : rule.objectId}
                    </th>
                    {page.access.roles.map((role) => {
                      const access = rule.accessByRoleId[role.id];
                      return (
                        <td key={role.id}>{access ? i18n._(access) : ''}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableScroll>
      </SectionStack>
    </SectionShell>
  );
}
