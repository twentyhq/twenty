import {
  type ConditionalDisplaySurface,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { validateConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

const OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000000';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-000000000001';
const TEXT_FIELD_UNIVERSAL_IDENTIFIER = '20202020-1111-4111-8111-000000000001';
const OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-2222-4222-8222-000000000002';
const ROLE_UNIVERSAL_IDENTIFIER = '20202020-3333-4333-8333-000000000003';
const UNKNOWN_ROLE_UNIVERSAL_IDENTIFIER =
  '20202020-9999-4999-8999-000000000009';
const INVALID_DATA_CODE = 'INVALID_DATA';

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    [TEXT_FIELD_UNIVERSAL_IDENTIFIER]: {
      universalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.TEXT,
    },
    [OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER]: {
      universalIdentifier: OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.TEXT,
    },
  },
} as unknown as MetadataUniversalFlatEntityMaps<'fieldMetadata'>;

const flatRoleMaps = {
  byUniversalIdentifier: {
    [ROLE_UNIVERSAL_IDENTIFIER]: {
      universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
    },
  },
} as unknown as MetadataUniversalFlatEntityMaps<'role'>;

const validate = ({
  conditionalDisplay,
  surface = 'pageLayoutWidget',
  objectMetadataUniversalIdentifier = OBJECT_UNIVERSAL_IDENTIFIER,
}: {
  conditionalDisplay: unknown;
  surface?: ConditionalDisplaySurface;
  objectMetadataUniversalIdentifier?: string | null;
}) =>
  validateConditionalDisplay({
    conditionalDisplay,
    surface,
    objectMetadataUniversalIdentifier,
    invalidDataCode: INVALID_DATA_CODE,
    flatFieldMetadataMaps,
    flatRoleMaps,
  });

const DEVICE_LEAF = {
  id: '0',
  contextKey: 'device',
  operand: ViewFilterOperand.IS,
  value: '["MOBILE"]',
};

describe('validateConditionalDisplay', () => {
  it('should accept a device rule on a widget', () => {
    expect(
      validate({ conditionalDisplay: { recordFilters: [DEVICE_LEAF] } }),
    ).toEqual([]);
  });

  it('should reject a device rule on a command menu item', () => {
    expect(
      validate({
        conditionalDisplay: { recordFilters: [DEVICE_LEAF] },
        surface: 'commandMenuItem',
      }),
    ).toEqual([
      expect.objectContaining({ code: INVALID_DATA_CODE, value: 'device' }),
    ]);
  });

  it('should reject a device value outside the allowed devices', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [{ ...DEVICE_LEAF, value: '["TABLET"]' }],
        },
      }),
    ).toEqual([expect.objectContaining({ value: '["TABLET"]' })]);
  });

  it('should reject a device rule matching two devices at once', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [{ ...DEVICE_LEAF, value: '["MOBILE","DESKTOP"]' }],
        },
      }),
    ).toEqual([expect.objectContaining({ value: '["MOBILE","DESKTOP"]' })]);
  });

  it('should reject a context rule with an operand other than IS', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [
            { ...DEVICE_LEAF, operand: ViewFilterOperand.IS_NOT },
          ],
        },
      }),
    ).toEqual([expect.objectContaining({ value: ViewFilterOperand.IS_NOT })]);
  });

  it('should reject an unknown context key', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [{ ...DEVICE_LEAF, contextKey: 'currentLocale' }],
        },
      }),
    ).toEqual([expect.objectContaining({ value: 'currentLocale' })]);
  });

  it('should accept a workspace member rule selecting the current member', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [
            {
              id: '0',
              contextKey: 'currentWorkspaceMemberId',
              operand: ViewFilterOperand.IS,
              value: JSON.stringify({
                isCurrentWorkspaceMemberSelected: true,
                selectedRecordIds: [],
              }),
            },
          ],
        },
      }),
    ).toEqual([]);
  });

  it('should reject a workspace member rule whose value is not a member selection', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [
            {
              id: '0',
              contextKey: 'currentWorkspaceMemberId',
              operand: ViewFilterOperand.IS,
              value: '["20202020-0000-4000-8000-000000000000"]',
            },
          ],
        },
      }),
    ).toEqual([
      expect.objectContaining({
        value: '["20202020-0000-4000-8000-000000000000"]',
      }),
    ]);
  });

  it('should accept a field rule on a field of the surface object', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [
            {
              id: '0',
              fieldMetadataUniversalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
        },
      }),
    ).toEqual([]);
  });

  it('should reject a field rule on a field of another object', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [
            {
              id: '0',
              fieldMetadataUniversalIdentifier:
                OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER,
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
        },
      }),
    ).toEqual([
      expect.objectContaining({
        value: OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    ]);
  });

  it('should reject a field rule on a surface without an object', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [
            {
              id: '0',
              fieldMetadataUniversalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
        },
        surface: 'navigationMenuItem',
        objectMetadataUniversalIdentifier: null,
      }),
    ).toEqual([
      expect.objectContaining({ value: TEXT_FIELD_UNIVERSAL_IDENTIFIER }),
    ]);
  });

  it('should reject a role rule referencing a role that does not exist', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [
            {
              id: '0',
              contextKey: 'currentRoleId',
              operand: ViewFilterOperand.IS,
              value: JSON.stringify([
                ROLE_UNIVERSAL_IDENTIFIER,
                UNKNOWN_ROLE_UNIVERSAL_IDENTIFIER,
              ]),
            },
          ],
        },
        surface: 'navigationMenuItem',
        objectMetadataUniversalIdentifier: null,
      }),
    ).toEqual([
      expect.objectContaining({ value: UNKNOWN_ROLE_UNIVERSAL_IDENTIFIER }),
    ]);
  });

  it('should reject a quantifier on a widget', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [DEVICE_LEAF],
          quantifier: 'SOME',
        },
      }),
    ).toEqual([expect.objectContaining({ value: 'SOME' })]);
  });

  it('should accept a quantifier on a command menu item', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [
            {
              id: '0',
              fieldMetadataUniversalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
          quantifier: 'SOME',
        },
        surface: 'commandMenuItem',
      }),
    ).toEqual([]);
  });

  it('should reject a rule with both a field and a context key', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [
            {
              ...DEVICE_LEAF,
              fieldMetadataUniversalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
            },
          ],
        },
      }),
    ).toEqual([expect.objectContaining({ value: '0' })]);
  });

  it('should reject groups forming a cycle', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [{ ...DEVICE_LEAF, recordFilterGroupId: 'a' }],
          recordFilterGroups: [
            { id: 'a', logicalOperator: 'AND', parentRecordFilterGroupId: 'b' },
            { id: 'b', logicalOperator: 'OR', parentRecordFilterGroupId: 'a' },
          ],
        },
      }),
    ).toEqual([
      expect.objectContaining({ value: 'a' }),
      expect.objectContaining({ value: 'b' }),
    ]);
  });

  it('should reject a group whose parent group does not exist', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [{ ...DEVICE_LEAF, recordFilterGroupId: 'a' }],
          recordFilterGroups: [
            {
              id: 'a',
              logicalOperator: 'AND',
              parentRecordFilterGroupId: 'missing',
            },
          ],
        },
      }),
    ).toEqual([expect.objectContaining({ value: 'missing' })]);
  });

  it('should reject a group with a logical operator other than AND or OR', () => {
    expect(
      validate({
        conditionalDisplay: {
          recordFilters: [{ ...DEVICE_LEAF, recordFilterGroupId: 'a' }],
          recordFilterGroups: [{ id: 'a', logicalOperator: 'XOR' }],
        },
      }),
    ).toEqual([expect.objectContaining({ value: 'XOR' })]);
  });

  it('should reject record filter groups that are not an array', () => {
    const conditionalDisplay = {
      recordFilters: [DEVICE_LEAF],
      recordFilterGroups: { id: 'a', logicalOperator: 'AND' },
    };

    expect(validate({ conditionalDisplay })).toEqual([
      expect.objectContaining({ value: conditionalDisplay }),
    ]);
  });

  it('should reject a json-logic rule', () => {
    const jsonLogicConditionalDisplay = {
      and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
    };

    expect(
      validate({ conditionalDisplay: jsonLogicConditionalDisplay }),
    ).toEqual([
      expect.objectContaining({ value: jsonLogicConditionalDisplay }),
    ]);
  });
});
