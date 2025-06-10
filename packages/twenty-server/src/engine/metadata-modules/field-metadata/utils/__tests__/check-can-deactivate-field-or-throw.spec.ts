import { EachTestingContext } from 'twenty-shared/testing';

import { checkCanDeactivateFieldOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/check-can-deactivate-field-or-throw';

type CheckCanDeactivateFieldOrThrowTestContext = EachTestingContext<{
  input: Parameters<typeof checkCanDeactivateFieldOrThrow>[0];
  shouldNotThrow?: true;
}>;

const checkCanDeactivateFieldOrThrowTestCases: CheckCanDeactivateFieldOrThrowTestContext[] =
  [
    {
      title: 'does not throw if nominal case',
      context: {
        input: {
          labelIdentifierFieldMetadataId: 'fieldIdentifierId',
          existingFieldMetadata: {
            id: 'myFieldId',
            isSystem: false,
            name: 'myFieldName',
          },
        },
        shouldNotThrow: true,
      },
    },
    {
      title: 'throws if trying to deactivate label identifier field',
      context: {
        input: {
          labelIdentifierFieldMetadataId: 'fieldId',
          existingFieldMetadata: {
            id: 'fieldId',
            isSystem: false,
            name: 'name',
          },
        },
      },
    },
    {
      title: 'throws if trying to deactivate system field',
      context: {
        input: {
          labelIdentifierFieldMetadataId: 'fieldIdentifierId',
          existingFieldMetadata: {
            id: 'systemFieldId',
            isSystem: true,
            name: 'systemField',
          },
        },
      },
    },
    {
      title: 'throws if trying to deactivate createdAt field',
      context: {
        input: {
          labelIdentifierFieldMetadataId: 'fieldIdentifierId',
          existingFieldMetadata: {
            id: 'createdAtId',
            isSystem: false,
            name: 'createdAt',
          },
        },
      },
    },
    {
      title: 'throws if trying to deactivate updatedAt field',
      context: {
        input: {
          labelIdentifierFieldMetadataId: 'fieldIdentifierId',
          existingFieldMetadata: {
            id: 'updatedAtId',
            isSystem: false,
            name: 'updatedAt',
          },
        },
      },
    },
    {
      title: 'throws if trying to deactivate deletedAt field',
      context: {
        input: {
          labelIdentifierFieldMetadataId: 'fieldIdentifierId',
          existingFieldMetadata: {
            id: 'deletedAtId',
            isSystem: false,
            name: 'deletedAt',
          },
        },
      },
    },
  ];

describe('checkCanDeactivateFieldOrThrow', () => {
  it.each(checkCanDeactivateFieldOrThrowTestCases)(
    '$title',
    ({ context: { input, shouldNotThrow } }) => {
      if (shouldNotThrow) {
        expect(() => checkCanDeactivateFieldOrThrow(input)).not.toThrow();
      } else {
        expect(() =>
          checkCanDeactivateFieldOrThrow(input),
        ).toThrowErrorMatchingSnapshot();
      }
    },
  );
});
