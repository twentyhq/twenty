'use client';

import { resolveExportArtifactNames } from '@/app/halftone/_lib/exportNames';
import { formatAnimationName } from '@/app/halftone/_lib/formatters';
import type {
  HalftoneGeometrySpec,
  HalftoneStudioSettings,
} from '@/app/halftone/_lib/state';
import { useState } from 'react';
import {
  ExportButton,
  ExportNameInput,
  ExportNote,
  ExportPreview,
  LabelWithTooltip,
  Section,
  SectionTitle,
  SelectControl,
  TabContent,
  ToggleControl,
} from './controls-ui';

const RESOLUTION_OPTIONS = [
  { label: '720p (1280 × 720)', value: '1280x720' },
  { label: '1080p (1920 × 1080)', value: '1920x1080' },
  { label: '2K (2560 × 1440)', value: '2560x1440' },
  { label: '4K (3840 × 2160)', value: '3840x2160' },
];
const DEFAULT_IMAGE_FILE_NAME = 'twenty-logo.svg';
const DEFAULT_IMAGE_LABEL = 'Twenty image';

function sectionLabel(label: string, description: string) {
  return <LabelWithTooltip description={description} label={label} />;
}

type ExportTabProps = {
  defaultExportName: string;
  exportBackground: boolean;
  exportName: string;
  imageFileName: string | null;
  onExportHalftoneImage: (width: number, height: number) => void;
  onExportBackgroundChange: (value: boolean) => void;
  onExportHtml: () => void;
  onExportNameChange: (value: string) => void;
  onExportReact: () => void;
  onImportPreset: () => void;
  selectedShape: HalftoneGeometrySpec | undefined;
  settings: HalftoneStudioSettings;
};

export function ExportTab({
  defaultExportName,
  exportBackground,
  exportName,
  imageFileName,
  onExportHalftoneImage,
  onExportBackgroundChange,
  onExportHtml,
  onExportNameChange,
  onExportReact,
  onImportPreset,
  selectedShape,
  settings,
}: ExportTabProps) {
  const [resolution, setResolution] = useState('1920x1080');
  const isImageMode = settings.sourceMode === 'image';
  const animationLabel = formatAnimationName(
    settings.animation,
    settings.sourceMode,
  );
  const sourceLabel = isImageMode
    ? imageFileName === null || imageFileName === DEFAULT_IMAGE_FILE_NAME
      ? DEFAULT_IMAGE_LABEL
      : imageFileName
    : (selectedShape?.label ?? settings.shapeKey);
  const inputName = exportName || defaultExportName;
  const { componentName } = resolveExportArtifactNames(
    exportName,
    defaultExportName,
  );

  const handleDownloadHalftoneImage = () => {
    const [widthStr, heightStr] = resolution.split('x');
    const width = parseInt(widthStr, 10);
    const height = parseInt(heightStr, 10);
    onExportHalftoneImage(width, height);
  };

  return (
    <TabContent>
      <Section $first>
        <SectionTitle>
          {sectionLabel(
            'Export Name',
            'Sets the base name used across the PNG, React component, and standalone HTML exports.',
          )}
        </SectionTitle>

        <ExportNameInput
          onChange={(event) => onExportNameChange(event.target.value)}
          onClick={(event) => event.currentTarget.select()}
          onFocus={(event) => event.currentTarget.select()}
          placeholder={defaultExportName}
          type="text"
          value={inputName}
        />

        <ToggleControl
          checked={exportBackground}
          label={sectionLabel(
            'Export background',
            'Includes the current background color in PNG, React component, and standalone HTML exports instead of keeping them transparent.',
          )}
          onChange={(event) => onExportBackgroundChange(event.target.checked)}
        />
      </Section>

      <Section>
        <SectionTitle>
          {sectionLabel(
            'Download Image',
            'Downloads a PNG snapshot of the current halftone effect at the selected resolution.',
          )}
        </SectionTitle>

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
        <SectionTitle>
          {sectionLabel(
            'Code Exports',
            'Downloads either a self-contained React component or standalone HTML with the current design and animation settings baked in. React exports require three.',
          )}
        </SectionTitle>

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
            {`// Source: ${sourceLabel}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Animation: ${animationLabel}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Dash color: ${settings.halftone.dashColor}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Hover color: ${settings.halftone.hoverDashColor}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Scale: ${settings.halftone.scale.toFixed(2)}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Power: ${settings.halftone.power.toFixed(2)}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Width: ${settings.halftone.width.toFixed(2)}`}
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

      <Section>
        <SectionTitle>
          {sectionLabel(
            'Import Preset',
            'Loads a previously exported TSX or HTML halftone preset. If that preset depends on a separate image or model file, select that asset in the picker too.',
          )}
        </SectionTitle>

        <ExportButton onClick={onImportPreset} type="button">
          Import Exported Preset
        </ExportButton>
      </Section>
    </TabContent>
  );
}
