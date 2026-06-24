import { styled } from '@linaria/react';
import { IconChevronDown } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { type ColumnMapping } from '../types/column-mapping';

const Row = styled.div`
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

export function MappingRow({ mapping }: { mapping: ColumnMapping }) {
  const { Icon, example, field, header } = mapping;
  return (
    <Row>
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
    </Row>
  );
}
