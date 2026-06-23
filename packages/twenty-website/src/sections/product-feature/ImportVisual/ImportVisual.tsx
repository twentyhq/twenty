'use client';

import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { MappingRow } from './components/MappingRow';
import { MAPPINGS } from './data/import-mappings';

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

export function ImportVisual({ active: _active }: { active: boolean }) {
  return (
    <Root>
      <Grid>
        <HeaderRow>
          <HeaderCell>Imported data</HeaderCell>
          <HeaderCell>Twenty fields</HeaderCell>
        </HeaderRow>
        {MAPPINGS.map((mapping) => (
          <MappingRow key={mapping.header} mapping={mapping} />
        ))}
      </Grid>
    </Root>
  );
}
