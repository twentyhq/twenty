'use client';

import type {
  HalftoneBackgroundSettings,
  HalftoneGeometrySpec,
  HalftoneSourceMode,
  HalftoneStudioSettings,
  HalftoneTabId,
} from '@/app/halftone/_lib/types';
import { AnimationsTab } from './controls/AnimationsTab';
import { DesignTab } from './controls/DesignTab';
import { ExportTab } from './controls/ExportTab';
import { PanelShell, TabButton, TabsBar } from './controls/controls-ui';

type ControlsPanelProps = {
  activeTab: HalftoneTabId;
  defaultExportName: string;
  exportName: string;
  imageFileName: string | null;
  onAnimationSettingsChange: (
    value: Partial<HalftoneStudioSettings['animation']>,
  ) => void;
  onBackgroundChange: (value: Partial<HalftoneBackgroundSettings>) => void;
  onDashColorChange: (value: string) => void;
  onExportHalftoneImage: (width: number, height: number) => void;
  onExportHtml: () => void;
  onExportNameChange: (value: string) => void;
  onExportReact: () => void;
  onImportPreset: () => void;
  onHalftoneChange: (
    value: Partial<HalftoneStudioSettings['halftone']>,
  ) => void;
  onLightingChange: (
    value: Partial<HalftoneStudioSettings['lighting']>,
  ) => void;
  onMaterialChange: (
    value: Partial<HalftoneStudioSettings['material']>,
  ) => void;
  onPreviewDistanceChange: (value: number) => void;
  onShapeChange: (value: string) => void;
  onSourceModeChange: (value: HalftoneSourceMode) => void;
  onTabChange: (value: HalftoneTabId) => void;
  onUploadImage: () => void;
  onUploadModel: () => void;
  previewDistance: number;
  selectedShape: HalftoneGeometrySpec | undefined;
  settings: HalftoneStudioSettings;
  shapeOptions: Array<{ label: string; value: string }>;
};

const TABS: HalftoneTabId[] = ['design', 'animations', 'export'];

const TAB_LABELS: Record<HalftoneTabId, string> = {
  design: 'Design',
  animations: 'Animations',
  export: 'Export',
};

export function ControlsPanel({
  activeTab,
  defaultExportName,
  exportName,
  imageFileName,
  onAnimationSettingsChange,
  onBackgroundChange,
  onDashColorChange,
  onExportHalftoneImage,
  onExportHtml,
  onExportNameChange,
  onExportReact,
  onImportPreset,
  onHalftoneChange,
  onLightingChange,
  onMaterialChange,
  onPreviewDistanceChange,
  onShapeChange,
  onSourceModeChange,
  onTabChange,
  onUploadImage,
  onUploadModel,
  previewDistance,
  selectedShape,
  settings,
  shapeOptions,
}: ControlsPanelProps) {
  return (
    <PanelShell>
      <TabsBar>
        {TABS.map((tab) => (
          <TabButton
            $active={tab === activeTab}
            key={tab}
            onClick={() => onTabChange(tab)}
            type="button"
          >
            {TAB_LABELS[tab]}
          </TabButton>
        ))}
      </TabsBar>

      {activeTab === 'design' ? (
        <DesignTab
          imageFileName={imageFileName}
          onBackgroundChange={onBackgroundChange}
          onDashColorChange={onDashColorChange}
          onHalftoneChange={onHalftoneChange}
          onLightingChange={onLightingChange}
          onMaterialChange={onMaterialChange}
          onPreviewDistanceChange={onPreviewDistanceChange}
          onShapeChange={onShapeChange}
          onSourceModeChange={onSourceModeChange}
          onUploadImage={onUploadImage}
          onUploadModel={onUploadModel}
          previewDistance={previewDistance}
          settings={settings}
          shapeOptions={shapeOptions}
        />
      ) : null}

      {activeTab === 'animations' ? (
        <AnimationsTab
          onAnimationSettingsChange={onAnimationSettingsChange}
          settings={settings}
        />
      ) : null}

      {activeTab === 'export' ? (
        <ExportTab
          defaultExportName={defaultExportName}
          exportName={exportName}
          onExportHalftoneImage={onExportHalftoneImage}
          onExportHtml={onExportHtml}
          onExportNameChange={onExportNameChange}
          onExportReact={onExportReact}
          onImportPreset={onImportPreset}
          selectedShape={selectedShape}
          settings={settings}
        />
      ) : null}
    </PanelShell>
  );
}
