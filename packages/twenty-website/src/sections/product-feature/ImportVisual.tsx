'use client';

import { styled } from '@linaria/react';
import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconChevronDown,
  IconMail,
  IconUser,
} from '@tabler/icons-react';
import { type ComponentType } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

type FieldGlyph = ComponentType<{ size?: number; stroke?: number }>;

// twenty-front's spreadsheet-import "Match Columns" step: each imported column
// (header + example) maps to a Twenty field. Company maps to a relation.
const MAPPINGS: {
  Icon: FieldGlyph;
  example: string;
  field: string;
  header: string;
}[] = [
  { Icon: IconUser, example: 'Dario', field: 'Name', header: 'First Name' },
  {
    Icon: IconMail,
    example: 'dario@anthropic.com',
    field: 'Emails',
    header: 'Email',
  },
  {
    Icon: IconBuildingSkyscraper,
    example: 'Anthropic',
    field: 'Company',
    header: 'Company',
  },
  {
    Icon: IconBriefcase,
    example: 'CEO',
    field: 'Job Title',
    header: 'Job Title',
  },
];

const Root = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  font-family: var(--font-product), sans-serif;
  height: 100%;
  justify-content: center;
  overflow: hidden;
  width: 100%;
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const HeaderRow = styled.div`
  background-color: ${THEME_LIGHT.background.secondary};
  border-bottom: 1px solid ${THEME_LIGHT.border.color.medium};
  display: flex;
  flex-shrink: 0;
  min-height: 40px;
`;

const HeaderCell = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  padding: 0 16px;
`;

const MappingRow = styled.div`
  border-bottom: 1px solid ${THEME_LIGHT.border.color.medium};
  display: flex;
  min-height: 64px;

  &:last-child {
    border-bottom: none;
  }
`;

const ImportedCell = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
  padding: 16px 8px 16px 16px;
`;

const ColumnHeader = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ColumnExample = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FieldCell = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
  padding: 16px 16px 16px 8px;
`;

const FieldSelect = styled.span`
  align-items: center;
  background-color: ${THEME_LIGHT.background.transparent.lighter};
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  box-sizing: border-box;
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  gap: 6px;
  min-width: 0;
  padding: 6px 8px;
  width: 100%;
`;

const FieldName = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  flex: 1;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FieldIcon = styled.span`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
`;

export function ImportVisual({ active: _active }: { active: boolean }) {
  return (
    <Root>
      <Grid>
        <HeaderRow>
          <HeaderCell>Imported data</HeaderCell>
          <HeaderCell>Twenty fields</HeaderCell>
        </HeaderRow>
        {MAPPINGS.map(({ Icon, example, field, header }) => (
          <MappingRow key={header}>
            <ImportedCell>
              <ColumnHeader>{header}</ColumnHeader>
              <ColumnExample>ex: {example}</ColumnExample>
            </ImportedCell>
            <FieldCell>
              <FieldSelect>
                <FieldIcon>
                  <Icon size={16} stroke={2} />
                </FieldIcon>
                <FieldName>{field}</FieldName>
                <FieldIcon>
                  <IconChevronDown size={16} stroke={2} />
                </FieldIcon>
              </FieldSelect>
            </FieldCell>
          </MappingRow>
        ))}
      </Grid>
    </Root>
  );
}
