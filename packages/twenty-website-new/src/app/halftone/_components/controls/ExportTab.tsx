'use client';

import { formatAnimationName } from '@/app/halftone/_lib/formatters';
import type {
  HalftoneGeometrySpec,
  HalftoneStudioSettings,
} from '@/app/halftone/_lib/types';
import { useState } from 'react';
import {
  ExportButton,
  ExportNameInput,
  ExportNote,
  ExportPreview,
  Section,
  SectionTitle,
  SelectControl,
  SmallBody,
  TabContent,
} from './controls-ui';

const RESOLUTION_OPTIONS = [
  { label: '720p (1280 × 720)', value: '1280x720' },
  { label: '1080p (1920 × 1080)', value: '1920x1080' },
  { label: '2K (2560 × 1440)', value: '2560x1440' },
  { label: '4K (3840 × 2160)', value: '3840x2160' },
];

type ExportTabProps = {
  defaultExportName: string;
  exportName: string;
  onExportHalftoneImage: (width: number, height: number) => void;
  onExportHtml: () => void;
  onExportNameChange: (value: string) => void;
  onExportReact: () => void;
  selectedShape: HalftoneGeometrySpec | undefined;
  settings: HalftoneStudioSettings;
};

export function ExportTab({
  defaultExportName,
  exportName,
  onExportHalftoneImage,
  onExportHtml,
  onExportNameChange,
  onExportReact,
  selectedShape,
  settings,
}: ExportTabProps) {
  const [resolution, setResolution] = useState('1920x1080');
  const isImageMode = settings.sourceMode === 'image';
  const animationLabel = formatAnimationName(
    settings.animation,
    settings.sourceMode,
  );

  const componentName = exportName || defaultExportName;

  const handleDownloadHalftoneImage = () => {
    const [widthStr, heightStr] = resolution.split('x');
    const width = parseInt(widthStr, 10);
    const height = parseInt(heightStr, 10);
    onExportHalftoneImage(width, height);
  };

  return (
    <TabContent>
      <Section $first>
        <SectionTitle>Download Image</SectionTitle>
        <SmallBody>
          Downloads a PNG snapshot of the current halftone effect at the selected
          resolution.
        </SmallBody>

        <SelectControl
          onChange={(event) => setResolution(event.target.value)}
          options={RESOLUTION_OPTIONS}
          value={resolution}
        >
          Resolution
        </SelectControl>

        <ExportButton
          onClick={handleDownloadHalftoneImage}
          style={{ marginTop: 12 }}
          type="button"
        >
          Download Halftone Image
        </ExportButton>
      </Section>

      <Section>
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
            <span
              style={{ color: '#9d90fa' }}
            >{`// ${componentName}.tsx`}</span>
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
            {`// Rows: ${settings.halftone.numRows}`}
          </div>
        </ExportPreview>

        <ExportButton onClick={onExportReact} type="button">
          Download React Component
        </ExportButton>
        <ExportButton onClick={onExportHtml} type="button">
          Download Standalone HTML
        </ExportButton>

        <ExportNote>
          {isImageMode
            ? 'The original image is downloaded alongside the export so the halftone effect can be rendered on top of it.'
            : selectedShape?.kind === 'imported'
              ? 'The standalone HTML export includes the current lighting, material, halftone, and animation settings, and embeds the uploaded model directly in the HTML file.'
              : 'The standalone HTML export includes the current lighting, material, halftone, and animation settings.'}
        </ExportNote>
      </Section>
    </TabContent>
  );
}
