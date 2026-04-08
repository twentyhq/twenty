'use client';

import type {
  HalftoneGeometrySpec,
  HalftoneStudioSettings,
  HalftoneTabId,
} from '@/app/halftone/_lib/types';
import { DesignTab } from './controls/DesignTab';
import { ExportTab } from './controls/ExportTab';
import { PrototypeTab } from './controls/PrototypeTab';
import {
  ControlsHeader,
  ControlsTitle,
  PanelShell,
  TabButton,
  TabsBar,
} from './controls/controls-ui';

type ControlsPanelProps = {
  activeTab: HalftoneTabId;
  onAnimationModeSelect: (
    value: HalftoneStudioSettings['animation']['mode'],
  ) => void;
  onAnimationSettingsChange: (
    value: Partial<HalftoneStudioSettings['animation']>,
  ) => void;
  onBackgroundColorChange: (value: string) => void;
  onBackgroundTransparencyChange: (value: boolean) => void;
  onDashColorChange: (value: string) => void;
  onExportHtml: () => void;
  onExportReact: () => void;
  onHalftoneChange: (value: Partial<HalftoneStudioSettings['halftone']>) => void;
  onLightingChange: (value: Partial<HalftoneStudioSettings['lighting']>) => void;
  onMaterialChange: (value: Partial<HalftoneStudioSettings['material']>) => void;
  onRotateToggle: () => void;
  onShapeChange: (value: string) => void;
  onTabChange: (value: HalftoneTabId) => void;
  onUploadModel: () => void;
  selectedShape: HalftoneGeometrySpec | undefined;
  settings: HalftoneStudioSettings;
  shapeOptions: Array<{ label: string; value: string }>;
};

const TABS: HalftoneTabId[] = ['design', 'prototype', 'export'];

export function ControlsPanel({
  activeTab,
  onAnimationModeSelect,
  onAnimationSettingsChange,
  onBackgroundColorChange,
  onBackgroundTransparencyChange,
  onDashColorChange,
  onExportHtml,
  onExportReact,
  onHalftoneChange,
  onLightingChange,
  onMaterialChange,
  onRotateToggle,
  onShapeChange,
  onTabChange,
  onUploadModel,
  selectedShape,
  settings,
  shapeOptions,
}: ControlsPanelProps) {
  return (
    <PanelShell>
      <ControlsHeader>
        <ControlsTitle>Controls</ControlsTitle>
      </ControlsHeader>

      <TabsBar>
        {TABS.map((tab) => (
          <TabButton
            $active={tab === activeTab}
            key={tab}
            onClick={() => onTabChange(tab)}
            type="button"
          >
            {tab === 'design'
              ? 'Design'
              : tab === 'prototype'
                ? 'Prototype'
                : 'Export'}
          </TabButton>
        ))}
      </TabsBar>

      {activeTab === 'design' ? (
        <DesignTab
          onBackgroundColorChange={onBackgroundColorChange}
          onBackgroundTransparencyChange={onBackgroundTransparencyChange}
          onDashColorChange={onDashColorChange}
          onHalftoneChange={onHalftoneChange}
          onLightingChange={onLightingChange}
          onMaterialChange={onMaterialChange}
          onShapeChange={onShapeChange}
          onUploadModel={onUploadModel}
          settings={settings}
          shapeOptions={shapeOptions}
        />
      ) : null}

      {activeTab === 'prototype' ? (
        <PrototypeTab
          onAnimationModeSelect={onAnimationModeSelect}
          onAnimationSettingsChange={onAnimationSettingsChange}
          onRotateToggle={onRotateToggle}
          settings={settings}
        />
      ) : null}

      {activeTab === 'export' ? (
        <ExportTab
          onExportHtml={onExportHtml}
          onExportReact={onExportReact}
          selectedShape={selectedShape}
          settings={settings}
        />
      ) : null}
    </PanelShell>
  );
}
