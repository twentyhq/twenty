'use client';

import { AnimationsTab } from './controls/AnimationsTab';
import { DesignTab } from './controls/DesignTab';
import { ExportTab } from './controls/ExportTab';
import { PanelShell, TabButton, TabsBar } from './controls/controls-ui';

type HalftoneTabId = 'design' | 'animations' | 'export';
type HalftoneSourceMode = 'shape' | 'image';
type HalftoneRotateAxis = 'x' | 'y' | 'z' | 'xy' | '-x' | '-y' | '-z' | '-xy';
type HalftoneRotatePreset = 'axis' | 'lissajous' | 'orbit' | 'tumble';
type HalftoneModelLoader = 'fbx' | 'glb';

interface HalftoneLightingSettings {
  intensity: number;
  fillIntensity: number;
  ambientIntensity: number;
  angleDegrees: number;
  height: number;
}

interface HalftoneMaterialSettings {
  roughness: number;
  metalness: number;
}

interface HalftoneEffectSettings {
  enabled: boolean;
  numRows: number;
  contrast: number;
  power: number;
  shading: number;
  baseInk: number;
  maxBar: number;
  rowMerge: number;
  cellRatio: number;
  cutoff: number;
  highlightOpen: number;
  shadowGrouping: number;
  shadowCrush: number;
  dashColor: string;
}

interface HalftoneBackgroundSettings {
  transparent: boolean;
  color: string;
}

interface HalftoneAnimationSettings {
  autoRotateEnabled: boolean;
  breatheEnabled: boolean;
  cameraParallaxEnabled: boolean;
  followHoverEnabled: boolean;
  followDragEnabled: boolean;
  floatEnabled: boolean;
  hoverLightEnabled: boolean;
  dragFlowEnabled: boolean;
  lightSweepEnabled: boolean;
  rotateEnabled: boolean;
  autoSpeed: number;
  autoWobble: number;
  breatheAmount: number;
  breatheSpeed: number;
  cameraParallaxAmount: number;
  cameraParallaxEase: number;
  driftAmount: number;
  hoverRange: number;
  hoverEase: number;
  hoverReturn: boolean;
  dragSens: number;
  dragFriction: number;
  dragMomentum: boolean;
  rotateAxis: HalftoneRotateAxis;
  rotatePreset: HalftoneRotatePreset;
  rotateSpeed: number;
  rotatePingPong: boolean;
  floatAmplitude: number;
  floatSpeed: number;
  lightSweepHeightRange: number;
  lightSweepRange: number;
  lightSweepSpeed: number;
  springDamping: number;
  springReturnEnabled: boolean;
  springStrength: number;
  hoverLightIntensity: number;
  hoverLightRadius: number;
  dragFlowDecay: number;
  dragFlowRadius: number;
  dragFlowStrength: number;
  hoverWarpStrength: number;
  hoverWarpRadius: number;
  dragWarpStrength: number;
  waveEnabled: boolean;
  waveSpeed: number;
  waveAmount: number;
}

interface HalftoneStudioSettings {
  sourceMode: HalftoneSourceMode;
  shapeKey: string;
  lighting: HalftoneLightingSettings;
  material: HalftoneMaterialSettings;
  halftone: HalftoneEffectSettings;
  background: HalftoneBackgroundSettings;
  animation: HalftoneAnimationSettings;
}

interface HalftoneGeometrySpec {
  key: string;
  label: string;
  kind: 'builtin' | 'imported';
  loader?: HalftoneModelLoader;
  filename?: string;
  description?: string;
  extensions?: readonly string[];
  userProvided?: boolean;
}

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
