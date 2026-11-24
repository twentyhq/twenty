import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { renderTableCellValue } from '../table/TableCellValue';
import { type RecordWidgetDefinition } from '../../types';

const Panel = styled.div`
  padding: 16px 24px 24px;
`;

const Card = styled.div`
  background: ${THEME_LIGHT.background.primary};
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.md};
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
`;

const Title = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-weight: 500;
`;

const Caption = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
`;

const Row = styled.div<{ $columns: number; $highlighted?: boolean }>`
  align-items: center;
  background: ${({ $highlighted }) =>
    $highlighted
      ? THEME_LIGHT.background.transparent.lighter
      : THEME_LIGHT.background.primary};
  border-top: 1px solid ${THEME_LIGHT.border.color.light};
  display: grid;
  gap: 8px;
  grid-template-columns: ${({ $columns }) => `repeat(${$columns}, minmax(0, 1fr))`};
  min-height: 36px;
  padding: 0 12px;
`;

const HeaderRow = styled(Row)`
  border-top: 0;
  color: ${THEME_LIGHT.font.color.tertiary};
`;

const Cell = styled.div`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
`;

const Footnote = styled.div`
  border-top: 1px solid ${THEME_LIGHT.border.color.light};
  color: ${THEME_LIGHT.font.color.secondary};
  padding: 10px 12px;
`;

export function RecordWidget({ widget }: { widget: RecordWidgetDefinition }) {
  const columnCount = widget.columns.length;

  return (
    <Panel>
      <Card>
        <CardHeader>
          <Title>{widget.title}</Title>
          {widget.caption ? <Caption>{widget.caption}</Caption> : null}
        </CardHeader>
        <HeaderRow $columns={columnCount}>
          {widget.columns.map((column) => (
            <Cell key={column}>{column}</Cell>
          ))}
        </HeaderRow>
        {widget.rows.map((row) => (
          <Row
            $columns={columnCount}
            $highlighted={row.highlighted}
            key={row.id}
          >
            {widget.columns.map((column, index) => {
              const cell = row.cells[index];
              return (
                <Cell key={column}>
                  {cell
                    ? renderTableCellValue({
                        cell,
                        columnId: column,
                        hovered: false,
                        isFirstColumn: false,
                      })
                    : null}
                </Cell>
              );
            })}
          </Row>
        ))}
        {widget.footnote ? <Footnote>{widget.footnote}</Footnote> : null}
      </Card>
    </Panel>
  );
}
