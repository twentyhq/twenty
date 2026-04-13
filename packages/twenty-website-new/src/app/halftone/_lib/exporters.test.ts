import {
  generateReactComponent,
  generateStandaloneHtml,
} from '@/app/halftone/_lib/exporters';
import { resolveExportArtifactNames } from '@/app/halftone/_lib/exportNames';
import { DEFAULT_HALFTONE_SETTINGS } from '@/app/halftone/_lib/state';

describe('halftone export naming', () => {
  it('normalizes free-form export names into safe component and file names', () => {
    expect(resolveExportArtifactNames('hero export 2026')).toEqual({
      componentName: 'HeroExport2026',
      fileBaseName: 'hero-export-2026',
    });
  });

  it('sanitizes generated React component identifiers', () => {
    const output = generateReactComponent(
      DEFAULT_HALFTONE_SETTINGS,
      undefined,
      'hero export 2026',
    );

    expect(output).toContain('type HeroExport2026Props = {');
    expect(output).toContain('export default function HeroExport2026({');
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
});
