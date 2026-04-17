'use client';

import type { ReactExportSettings } from '@/app/halftone/_lib/exporters';
import { IconLayoutSidebarRightCollapse, IconShare } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import type {
  HalftoneBackgroundSettings,
  HalftoneGeometrySpec,
  HalftoneSourceMode,
  HalftoneStudioSettings,
  HalftoneTabId,
} from '@/app/halftone/_lib/state';
import { AnimationsTab } from './controls/AnimationsTab';
import { DesignTab } from './controls/DesignTab';
import { ExportTab } from './controls/ExportTab';
import { PanelShell, TabButton, TabsBar } from './controls/controls-ui';

type ControlsPanelProps = {
  activeTab: HalftoneTabId;
  defaultExportName: string;
  exportBackground: boolean;
  exportName: string;
  imageFileName: string | null;
  onAnimationSettingsChange: (
    value: Partial<HalftoneStudioSettings['animation']>,
  ) => void;
  onBackgroundChange: (value: Partial<HalftoneBackgroundSettings>) => void;
  onCopyShareLink: () => void;
  onDashColorChange: (value: string) => void;
  onHoverDashColorChange: (value: string) => void;
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
  onToggleVisibility: () => void;
  onUploadSource: () => void;
  previewDistance: number;
  reactAssetPublicUrl: string;
  reactExportSettings: ReactExportSettings;
  visible: boolean;
  selectedShape: HalftoneGeometrySpec | undefined;
  settings: HalftoneStudioSettings;
  shapeOptions: Array<{ label: string; value: string }>;
  defaultReactAssetPublicUrl: string;
  showReactAssetPublicUrl: boolean;
};

const TABS: HalftoneTabId[] = ['design', 'animations', 'export'];

const TAB_LABELS: Record<HalftoneTabId, string> = {
  design: 'Design',
  animations: 'Animations',
  export: 'Export',
};

const TabsGroup = styled.div`
  display: flex;
  gap: 6px;
  min-width: 0;
`;

const TABLER_STROKE = 1.7;

const PanelActions = styled.div`
  display: inline-flex;
  gap: 2px;
  margin-left: auto;
`;

const PanelActionButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 7px;
  color: rgba(255, 255, 255, 0.44);
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  height: 28px;
  justify-content: center;
  padding: 0;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  width: 28px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.74);
  }

  &:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.35);
    outline-offset: 1px;
  }
`;

const PanelToggleTabButton = styled(PanelActionButton)<{ $collapsed: boolean }>`
  & > svg {
    transform: ${(props) => (props.$collapsed ? 'scaleX(-1)' : 'none')};
    transition: transform 0.18s ease;
  }
`;

export function ControlsPanel({
  activeTab,
  defaultExportName,
  exportBackground,
  exportName,
  imageFileName,
  onAnimationSettingsChange,
  onBackgroundChange,
  onCopyShareLink,
  onDashColorChange,
  onHoverDashColorChange,
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
  onHalftoneChange,
  onLightingChange,
  onMaterialChange,
  onPreviewDistanceChange,
  onShapeChange,
  onSourceModeChange,
  onTabChange,
  onToggleVisibility,
  onUploadSource,
  previewDistance,
  reactAssetPublicUrl,
  reactExportSettings,
  visible,
  selectedShape,
  settings,
  shapeOptions,
  defaultReactAssetPublicUrl,
  showReactAssetPublicUrl,
}: ControlsPanelProps) {
  return (
    <PanelShell $collapsed={!visible}>
      <TabsBar $collapsed={!visible}>
        {visible ? (
          <TabsGroup>
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
          </TabsGroup>
        ) : null}
        <PanelActions>
          <PanelActionButton
            aria-label="Copy share link"
            onClick={onCopyShareLink}
            title="Copy share link"
            type="button"
          >
            <IconShare aria-hidden size={16} stroke={TABLER_STROKE} />
          </PanelActionButton>
          <PanelToggleTabButton
            $collapsed={!visible}
            aria-expanded={visible}
            aria-label={visible ? 'Hide right panel' : 'Show right panel'}
            onClick={onToggleVisibility}
            title={visible ? 'Hide right panel' : 'Show right panel'}
            type="button"
          >
            <IconLayoutSidebarRightCollapse
              aria-hidden
              size={16}
              stroke={TABLER_STROKE}
            />
          </PanelToggleTabButton>
        </PanelActions>
      </TabsBar>

      {visible && activeTab === 'design' ? (
        <DesignTab
          imageFileName={imageFileName}
          onAnimationSettingsChange={onAnimationSettingsChange}
          onBackgroundChange={onBackgroundChange}
          onDashColorChange={onDashColorChange}
          onHalftoneChange={onHalftoneChange}
          onLightingChange={onLightingChange}
          onMaterialChange={onMaterialChange}
          onPreviewDistanceChange={onPreviewDistanceChange}
          onShapeChange={onShapeChange}
          onSourceModeChange={onSourceModeChange}
          onUploadSource={onUploadSource}
          previewDistance={previewDistance}
          settings={settings}
          shapeOptions={shapeOptions}
        />
      ) : null}

      {visible && activeTab === 'animations' ? (
        <AnimationsTab
          onAnimationSettingsChange={onAnimationSettingsChange}
          onHoverDashColorChange={onHoverDashColorChange}
          settings={settings}
        />
      ) : null}

      {visible && activeTab === 'export' ? (
        <ExportTab
          defaultExportName={defaultExportName}
          exportBackground={exportBackground}
          exportName={exportName}
          imageFileName={imageFileName}
          onCopyHalftoneImage={onCopyHalftoneImage}
          onCopyHalftoneSvg={onCopyHalftoneSvg}
          onExportHalftoneImage={onExportHalftoneImage}
          onExportHalftoneSvg={onExportHalftoneSvg}
          onExportBackgroundChange={onExportBackgroundChange}
          onExportHtml={onExportHtml}
          onExportNameChange={onExportNameChange}
          onExportReact={onExportReact}
          onImportPreset={onImportPreset}
          onReactAssetPublicUrlChange={onReactAssetPublicUrlChange}
          onReactExportSettingChange={onReactExportSettingChange}
          reactAssetPublicUrl={reactAssetPublicUrl}
          reactExportSettings={reactExportSettings}
          selectedShape={selectedShape}
          settings={settings}
          defaultReactAssetPublicUrl={defaultReactAssetPublicUrl}
          showReactAssetPublicUrl={showReactAssetPublicUrl}
        />
      ) : null}
    </PanelShell>
  );
}
