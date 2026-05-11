'use client';

import type { ReactExportSettings } from '@/lib/halftone/utils/exporters';
import { resolveExportArtifactNames } from '@/lib/halftone/utils/export-names';
import { formatAnimationName } from '@/lib/halftone/utils/formatters';
import type {
  HalftoneGeometrySpec,
  HalftoneStudioSettings,
} from '@/lib/halftone/utils/state';
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
const REACT_EXPORT_SETTING_OPTIONS: Array<{
  description: string;
  key: keyof ReactExportSettings;
  label: string;
}> = [
  {
    key: 'includePublicAssetUrl',
    label: 'Use public asset URL',
    description:
      'Bakes the public asset path into the React export instead of using a relative file path.',
  },
  {
    key: 'includeStyledMount',
    label: 'Use Linaria wrapper',
    description:
      'Wraps the mount node with a StyledVisualMount using @linaria/react and keeps the Twenty-ready mount shape.',
  },
  {
    key: 'includeUseClientDirective',
    label: "Add 'use client'",
    description:
      'Prepends the Next.js client directive so the exported component can be dropped into the Twenty website directly.',
  },
  {
    key: 'includeTsNoCheck',
    label: 'Add @ts-nocheck',
    description:
      'Prepends // @ts-nocheck so generated self-contained files do not need hand-cleaning to satisfy strict TypeScript.',
  },
  {
    key: 'includeNamedAndDefaultExport',
    label: 'Named + default export',
    description:
      'Exports both a named component and a default export to match the current Twenty illustration import pattern.',
  },
  {
    key: 'includeRegistryComment',
    label: 'Add Twenty header comment',
    description:
      'Adds suggested destination and registry wiring comments at the top of the generated file.',
  },
];

function sectionLabel(label: string, description: string) {
  return <LabelWithTooltip description={description} label={label} />;
}

type ExportTabProps = {
  defaultExportName: string;
  exportBackground: boolean;
  exportName: string;
  imageFileName: string | null;
  onCopyHalftoneImage: (width: number, height: number) => void;
  onCopyHalftoneSvg: (width: number, height: number) => void;
  onExportHalftoneImage: (width: number, height: number) => void;
  onExportHalftoneSvg: (width: number, height: number) => void;
  onExportBackgroundChange: (value: boolean) => void;
  onExportHtml: () => void;
  onExportNameChange: (value: string) => void;
  onExportReact: () => void;
  onImportPreset: () => void;
  onReactAssetPublicUrlChange: (value: string) => void;
  onReactExportSettingChange: (
    key: keyof ReactExportSettings,
    value: boolean,
  ) => void;
  reactAssetPublicUrl: string;
  reactExportSettings: ReactExportSettings;
  selectedShape: HalftoneGeometrySpec | undefined;
  settings: HalftoneStudioSettings;
  defaultReactAssetPublicUrl: string;
  showReactAssetPublicUrl: boolean;
};

export function ExportTab({
  defaultExportName,
  exportBackground,
  exportName,
  imageFileName,
  onCopyHalftoneImage,
  onCopyHalftoneSvg,
  onExportHalftoneImage,
  onExportHalftoneSvg,
  onExportBackgroundChange,
  onExportHtml,
  onExportNameChange,
  onExportReact,
  onImportPreset,
  onReactAssetPublicUrlChange,
  onReactExportSettingChange,
  reactAssetPublicUrl,
  reactExportSettings,
  selectedShape,
  settings,
  defaultReactAssetPublicUrl,
  showReactAssetPublicUrl,
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

  const getSelectedResolution = () => {
    const [widthStr, heightStr] = resolution.split('x');
    const width = parseInt(widthStr ?? '', 10);
    const height = parseInt(heightStr ?? '', 10);

    return { width, height };
  };

  const handleDownloadHalftoneImage = () => {
    const { width, height } = getSelectedResolution();
    onExportHalftoneImage(width, height);
  };

  const handleCopyHalftoneImage = () => {
    const { width, height } = getSelectedResolution();
    onCopyHalftoneImage(width, height);
  };

  const handleDownloadHalftoneSvg = () => {
    const { width, height } = getSelectedResolution();
    onExportHalftoneSvg(width, height);
  };

  const handleCopyHalftoneSvg = () => {
    const { width, height } = getSelectedResolution();
    onCopyHalftoneSvg(width, height);
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
            'Image Export',
            isImageMode
              ? 'Downloads either a PNG snapshot or an SVG vector export of the current halftone effect, and can copy either format to the clipboard at the selected resolution.'
              : 'Downloads a PNG snapshot of the current halftone effect or copies it to the clipboard at the selected resolution.',
          )}
        </SectionTitle>

        <SelectControl
          onChange={(event) => setResolution(event.target.value)}
          options={RESOLUTION_OPTIONS}
          value={resolution}
        >
          Resolution
        </SelectControl>

        <div style={{ marginTop: 12 }}>
          <SectionTitle $preserveCase>Download</SectionTitle>
          <div style={{ display: 'flex', gap: 8 }}>
            <ExportButton
              onClick={handleDownloadHalftoneImage}
              style={{ flex: 1, marginTop: 0 }}
              type="button"
            >
              PNG
            </ExportButton>
            {isImageMode ? (
              <ExportButton
                onClick={handleDownloadHalftoneSvg}
                style={{ flex: 1, marginTop: 0 }}
                type="button"
              >
                SVG
              </ExportButton>
            ) : null}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <SectionTitle $preserveCase>Copy</SectionTitle>
          <div style={{ display: 'flex', gap: 8 }}>
            <ExportButton
              onClick={handleCopyHalftoneImage}
              style={{ flex: 1, marginTop: 0 }}
              type="button"
            >
              PNG
            </ExportButton>
            {isImageMode ? (
              <ExportButton
                onClick={handleCopyHalftoneSvg}
                style={{ flex: 1, marginTop: 0 }}
                type="button"
              >
                SVG
              </ExportButton>
            ) : null}
          </div>
        </div>
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
            {`// Public asset URL: ${reactExportSettings.includePublicAssetUrl ? 'on' : 'off'}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// Linaria wrapper: ${reactExportSettings.includeStyledMount ? 'on' : 'off'}`}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
            {`// use client: ${reactExportSettings.includeUseClientDirective ? 'on' : 'off'}`}
          </div>
          {showReactAssetPublicUrl ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
              {`// Asset URL: ${reactAssetPublicUrl || defaultReactAssetPublicUrl}`}
            </div>
          ) : null}
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

        {REACT_EXPORT_SETTING_OPTIONS.map((option) => (
          <ToggleControl
            checked={reactExportSettings[option.key]}
            key={option.key}
            label={sectionLabel(option.label, option.description)}
            onChange={(event) =>
              onReactExportSettingChange(option.key, event.target.checked)
            }
          />
        ))}

        {showReactAssetPublicUrl ? (
          <div style={{ marginTop: 12 }}>
            <SectionTitle $preserveCase>
              {sectionLabel(
                'Asset public URL',
                'Used as the baked-in public path for the downloaded image or model asset when "Use public asset URL" is enabled.',
              )}
            </SectionTitle>
            <ExportNameInput
              onChange={(event) =>
                onReactAssetPublicUrlChange(event.target.value)
              }
              placeholder={defaultReactAssetPublicUrl}
              type="text"
              value={reactAssetPublicUrl}
            />
          </div>
        ) : null}

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
