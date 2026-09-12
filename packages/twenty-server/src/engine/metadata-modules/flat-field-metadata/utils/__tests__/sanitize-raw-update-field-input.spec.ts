import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import type { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { sanitizeRawUpdateFieldInput } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-raw-update-field-input';

describe('sanitizeRawUpdateFieldInput', () => {
  const systemManagedCreatedAtField: FlatFieldMetadata = {
    id: 'field-id-1',
    name: 'createdAt',
    label: 'Creation date',
    type: FieldMetadataType.DATE_TIME,
    isCustom: false,
    isActive: true,
    isSystemSideEffect: true,
    applicationId: 'twenty-standard',
    settings: {
      displayFormat: 'RELATIVE',
    },
  } as unknown as FlatFieldMetadata;

  it('should allow updating settings on a system-managed field', () => {
    const result = sanitizeRawUpdateFieldInput({
      existingFlatFieldMetadata: systemManagedCreatedAtField,
      rawUpdateFieldInput: {
        id: 'field-id-1',
        workspaceId: 'workspace-id-1',
        settings: {
          displayFormat: 'USER_SETTINGS',
        },
      },
      isSystemBuild: false,
    });

    expect(result.updatedEditableFieldProperties.settings).toEqual({
      displayFormat: 'USER_SETTINGS',
    });
  });

  it('should allow updating isActive on a system-managed field', () => {
    const result = sanitizeRawUpdateFieldInput({
      existingFlatFieldMetadata: systemManagedCreatedAtField,
      rawUpdateFieldInput: {
        id: 'field-id-1',
        workspaceId: 'workspace-id-1',
        isActive: false,
      },
      isSystemBuild: false,
    });

    expect(result.updatedEditableFieldProperties.isActive).toBe(false);
  });

  it('should throw when attempting to update forbidden properties on a system-managed field', () => {
    expect(() =>
      sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: systemManagedCreatedAtField,
        rawUpdateFieldInput: {
          id: 'field-id-1',
          workspaceId: 'workspace-id-1',
          description: 'New Description',
        },
        isSystemBuild: false,
      }),
    ).toThrow(
      expect.objectContaining({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message:
          'Cannot edit system-managed field "createdAt" properties: description',
      }),
    );
  });
});
