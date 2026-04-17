import {
  generateReactComponent,
  generateStandaloneHtml,
  parseExportedPreset,
  type ReactExportSettings,
} from '@/app/halftone/_lib/exporters';
import { resolveExportArtifactNames } from '@/app/halftone/_lib/exportNames';
import {
  DEFAULT_HALFTONE_SETTINGS,
  normalizeHalftoneStudioSettings,
  type HalftoneGeometrySpec,
} from '@/app/halftone/_lib/state';

const IMPORTED_GLB_SHAPE: HalftoneGeometrySpec = {
  key: 'userUpload_connect',
  label: 'connect.glb',
  kind: 'imported',
  loader: 'glb',
  filename: 'connect.glb',
};

const GENERIC_REACT_EXPORT_SETTINGS: ReactExportSettings = {
  includeNamedAndDefaultExport: false,
  includePublicAssetUrl: false,
  includeRegistryComment: false,
  includeTsNoCheck: false,
  includeUseClientDirective: false,
  includeStyledMount: false,
};

describe('halftone export naming', () => {
  it('normalizes free-form export names into safe component and file names', () => {
    expect(resolveExportArtifactNames('hero export 2026')).toEqual({
      componentName: 'HeroExport2026',
      fileBaseName: 'hero-export-2026',
    });
  });

  it('sanitizes generated React component identifiers for the default Twenty export', () => {
    const output = generateReactComponent(
      DEFAULT_HALFTONE_SETTINGS,
      undefined,
      'hero export 2026',
    );

    expect(output).toContain('// @ts-nocheck');
    expect(output).toContain('export function HeroExport2026({');
    expect(output).toContain('export default HeroExport2026;');
    expect(output).toContain('type HeroExport2026Props = {');
    expect(output).not.toContain('type hero export 2026Props = {');
  });

  it('sanitizes generated standalone HTML titles', async () => {
    const output = await generateStandaloneHtml(
      DEFAULT_HALFTONE_SETTINGS,
      undefined,
      'hero export 2026',
    );

    expect(output).toContain('<title>HeroExport2026</title>');
  });

  it('parses legacy exported presets without a hover dash color', () => {
    const output = generateReactComponent(
      DEFAULT_HALFTONE_SETTINGS,
      undefined,
      'legacy hover color preset',
    );
    const legacyOutput = output.replace(
      /("dashColor": "[^"]+"),\n(\s*)"hoverDashColor": "[^"]+"/,
      '$1',
    );

    const parsed = parseExportedPreset(legacyOutput);

    expect(
      normalizeHalftoneStudioSettings(parsed.settings).halftone.hoverDashColor,
    ).toBe(DEFAULT_HALFTONE_SETTINGS.halftone.hoverDashColor);
  });

  it('uses the initial pose as the export runtime rotation baseline', async () => {
    const reactOutput = generateReactComponent(
      DEFAULT_HALFTONE_SETTINGS,
      undefined,
      'rotation baseline export',
    );
    const htmlOutput = await generateStandaloneHtml(
      DEFAULT_HALFTONE_SETTINGS,
      undefined,
      'rotation baseline export',
    );

    expect(reactOutput).toContain('let baseRotationY = initialPose.rotationY;');
    expect(htmlOutput).toContain('let baseRotationY = initialPose.rotationY;');
  });
});

describe('halftone react export presets', () => {
  it('emits a Twenty-ready GLB export with Draco support and no torus fallback', () => {
    const output = generateReactComponent(
      DEFAULT_HALFTONE_SETTINGS,
      IMPORTED_GLB_SHAPE,
      'PartnerConnect',
      {
        assetUrl: '/illustrations/generated/partner-connect.glb',
        modelFilenameOverride: 'partner-connect.glb',
      },
    );

    expect(output).toContain('// @ts-nocheck');
    expect(output).toContain("'use client';");
    expect(output).toContain('DRACOLoader');
    expect(output).toContain('export function PartnerConnect({');
    expect(output).toContain('export default PartnerConnect;');
    expect(output).toContain(
      'modelUrl = "/illustrations/generated/partner-connect.glb"',
    );
    expect(output).toContain(
      '// Suggested public asset destination: public/illustrations/generated/partner-connect.glb',
    );
    expect(output).not.toContain("createBuiltinGeometry('torusKnot')");
  });

  it('emits a Twenty-ready image export without model loaders', () => {
    const imageSettings = normalizeHalftoneStudioSettings({
      ...DEFAULT_HALFTONE_SETTINGS,
      sourceMode: 'image',
    });
    const output = generateReactComponent(
      imageSettings,
      undefined,
      'PartnerLogo',
      {
        assetUrl: '/illustrations/generated/partner-logo.svg',
        imageFilename: 'partner-logo.svg',
      },
    );

    expect(output).toContain(
      'imageUrl = "/illustrations/generated/partner-logo.svg"',
    );
    expect(output).not.toContain('GLTFLoader');
    expect(output).not.toContain('FBXLoader');
    expect(output).not.toContain('DRACOLoader');
  });

  it('keeps pointer cancel wiring and removes window listeners from window in the model runtime', () => {
    const output = generateReactComponent(
      DEFAULT_HALFTONE_SETTINGS,
      IMPORTED_GLB_SHAPE,
      'PartnerConnect',
      {
        assetUrl: '/illustrations/generated/partner-connect.glb',
        modelFilenameOverride: 'partner-connect.glb',
      },
    );

    expect(output).toContain('const handlePointerCancel = () =>');
    expect(output).toContain(
      "canvas.addEventListener('pointercancel', handlePointerCancel);",
    );
    expect(output).toContain(
      "window.removeEventListener('pointerup', handlePointerUp);",
    );
    expect(output).toContain(
      "window.removeEventListener('pointermove', handleWindowPointerMove);",
    );
    expect(output).not.toContain(
      "canvas.removeEventListener('pointerup', handlePointerUp);",
    );
  });

  it('parses Twenty exports with header comments and named/default exports', () => {
    const output = generateReactComponent(
      DEFAULT_HALFTONE_SETTINGS,
      IMPORTED_GLB_SHAPE,
      'PartnerConnect',
      {
        assetUrl: '/illustrations/generated/partner-connect.glb',
        modelFilenameOverride: 'partner-connect.glb',
      },
    );
    const parsed = parseExportedPreset(output);

    expect(parsed.componentName).toBe('PartnerConnect');
    expect(parsed.modelAssetReference).toBe(
      '/illustrations/generated/partner-connect.glb',
    );
  });

  it('keeps the generic React export available with relative asset paths', () => {
    const output = generateReactComponent(
      DEFAULT_HALFTONE_SETTINGS,
      IMPORTED_GLB_SHAPE,
      'PartnerConnect',
      {
        exportSettings: GENERIC_REACT_EXPORT_SETTINGS,
        modelFilenameOverride: 'partner-connect.glb',
      },
    );

    expect(output).toContain('modelUrl = "./partner-connect.glb"');
    expect(output).toContain('export default function PartnerConnect({');
    expect(output).not.toContain("'use client';");
  });
});
