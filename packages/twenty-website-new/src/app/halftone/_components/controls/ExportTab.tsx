'use client';

import { formatAnimationName, formatRows } from '@/app/halftone/_lib/formatters';
import type {
  HalftoneGeometrySpec,
  HalftoneStudioSettings,
} from '@/app/halftone/_lib/types';
import {
  ExportButton,
  ExportNameInput,
  ExportNote,
  ExportPreview,
  Section,
  SectionTitle,
  SmallBody,
  TabContent,
} from './controls-ui';

type ExportTabProps = {
  defaultExportName: string;
  exportName: string;
  onExportHtml: () => void;
  onExportNameChange: (value: string) => void;
  onExportReact: () => void;
  selectedShape: HalftoneGeometrySpec | undefined;
  settings: HalftoneStudioSettings;
};

export function ExportTab({
  defaultExportName,
  exportName,
  onExportHtml,
  onExportNameChange,
  onExportReact,
  selectedShape,
  settings,
}: ExportTabProps) {
  const animationLabel = formatAnimationName(settings.animation);

  const componentName = exportName || defaultExportName;

  return (
    <TabContent>
      <Section $first>
        <SectionTitle>Export React Component</SectionTitle>
        <SmallBody>
          Downloads a self-contained React component with the current design and
          animation settings baked in. Requires <code>three</code>.
        </SmallBody>

        <ExportNameInput
          onChange={(event) => onExportNameChange(event.target.value)}
          placeholder={defaultExportName}
          type="text"
          value={exportName}
        />

        <ExportPreview>
          <div>
            <span style={{ color: '#9d90fa' }}>{`// ${componentName}.tsx`}</span>
          </div>
          <div>
            <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
              {'// Auto-generated from current settings'}
            </span>
          </div>
          <br />
          <div>
            <span style={{ color: '#e0a856' }}>import</span>{' '}
            <span style={{ color: '#8bc58b' }}>{componentName}</span>{' '}
            <span style={{ color: '#e0a856' }}>from</span>{' '}
            <span style={{ color: '#8bc58b' }}>{`'./${componentName}'`}</span>
          </div>
          <br />
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Shape: ${selectedShape?.key ?? settings.shapeKey}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Animation: ${animationLabel}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Dash color: ${settings.halftone.dashColor}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Rows: ${formatRows(settings.halftone.numRows)}`}
          </div>
        </ExportPreview>

        <ExportButton $primary onClick={onExportReact} type="button">
          Download React Component
        </ExportButton>
        <ExportButton onClick={onExportHtml} type="button">
          Download Standalone HTML
        </ExportButton>

        <ExportNote>
          The standalone HTML export includes the current lighting, material,
          halftone, and animation settings. If the current shape comes from an
          uploaded model, the original file is downloaded alongside the export.
        </ExportNote>
      </Section>
    </TabContent>
  );
}
