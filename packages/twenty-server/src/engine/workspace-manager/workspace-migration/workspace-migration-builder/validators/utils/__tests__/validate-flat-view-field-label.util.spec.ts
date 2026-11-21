import { validateFlatViewFieldLabel } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-label.util';

const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';
const OTHER_APPLICATION = 'other-application';

const validate = ({
  label,
  universalOverrides = null,
  applicationUniversalIdentifier = WORKSPACE_CUSTOM_APPLICATION,
}: {
  label: string | null;
  universalOverrides?: Record<string, { label?: string | null }> | null;
  applicationUniversalIdentifier?: string;
}) =>
  validateFlatViewFieldLabel({
    flatViewField: {
      label,
      universalOverrides,
      applicationUniversalIdentifier,
    },
    buildOptions: {
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION,
    },
  });

describe('validateFlatViewFieldLabel', () => {
  it('accepts a column without a custom label', () => {
    expect(validate({ label: null })).toEqual([]);
  });

  it('accepts a custom label', () => {
    expect(validate({ label: 'Open tasks' })).toEqual([]);
  });

  it('accepts a label of the maximum length', () => {
    expect(validate({ label: 'a'.repeat(63) })).toEqual([]);
  });

  it('rejects a label longer than the maximum length', () => {
    expect(validate({ label: 'a'.repeat(64) })).toEqual([
      expect.objectContaining({
        message: 'A view field label cannot be longer than 63 characters',
      }),
    ]);
  });

  it('rejects a blank label', () => {
    expect(validate({ label: '  ' })).toEqual([
      expect.objectContaining({
        message:
          'A view field label cannot be empty, use null to show the default label',
      }),
    ]);
  });

  it('rejects a too long workspace rename of an application-owned column', () => {
    expect(
      validate({
        label: 'Open tasks',
        applicationUniversalIdentifier: OTHER_APPLICATION,
        universalOverrides: {
          [WORKSPACE_CUSTOM_APPLICATION]: { label: 'a'.repeat(64) },
        },
      }),
    ).toHaveLength(1);
  });

  it('accepts a workspace rename of an application-owned column', () => {
    expect(
      validate({
        label: null,
        applicationUniversalIdentifier: OTHER_APPLICATION,
        universalOverrides: {
          [WORKSPACE_CUSTOM_APPLICATION]: { label: 'My tasks' },
        },
      }),
    ).toEqual([]);
  });
});
