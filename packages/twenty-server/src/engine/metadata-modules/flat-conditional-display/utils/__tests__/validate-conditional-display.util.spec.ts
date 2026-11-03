import {
  type ConditionalDisplaySurface,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { type ConditionalDisplayProperty } from 'src/engine/metadata-modules/flat-conditional-display/types/conditional-display-property.type';
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

const contextRule = ({
  contextKey,
  value,
  operand = ViewFilterOperand.IS,
  subFieldName,
}: {
  contextKey: string;
  value: string | null;
  operand?: ViewFilterOperand;
  subFieldName?: string;
}) => ({
  id: '0',
  contextKey,
  subFieldName,
  operand,
  value,
});

const fieldRule = (fieldMetadataUniversalIdentifier: string) => ({
  id: '0',
  fieldMetadataUniversalIdentifier,
  operand: ViewFilterOperand.IS_NOT_EMPTY,
  value: '',
});

const DEVICE_RULE = contextRule({ contextKey: 'device', value: '["MOBILE"]' });

const validate = ({
  conditionalDisplay,
  property = 'conditionalDisplay',
  surface = 'pageLayoutWidget',
  objectMetadataUniversalIdentifier = OBJECT_UNIVERSAL_IDENTIFIER,
}: {
  conditionalDisplay: unknown;
  property?: ConditionalDisplayProperty;
  surface?: ConditionalDisplaySurface;
  objectMetadataUniversalIdentifier?: string | null;
}) =>
  validateConditionalDisplay({
    conditionalDisplay,
    property,
    surface,
    objectMetadataUniversalIdentifier,
    invalidDataCode: 'INVALID_DATA',
    flatFieldMetadataMaps,
    flatRoleMaps,
  });

const validateCommandAvailability = (recordFilter: object) =>
  validate({
    conditionalDisplay: { recordFilters: [recordFilter] },
    property: 'conditionalAvailability',
    surface: 'commandMenuItem',
  });

describe('validateConditionalDisplay', () => {
  describe('admin rules', () => {
    it('should accept device, member and own-object field rules', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({
                contextKey: 'device',
                value: '["MOBILE","DESKTOP"]',
              }),
              contextRule({
                contextKey: 'currentWorkspaceMemberId',
                value: JSON.stringify({
                  isCurrentWorkspaceMemberSelected: true,
                  selectedRecordIds: [],
                }),
              }),
              fieldRule(TEXT_FIELD_UNIVERSAL_IDENTIFIER),
            ],
          },
        }),
      ).toEqual([]);
    });

    it('should reject an unknown context key', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({ contextKey: 'currentLocale', value: '"en"' }),
            ],
          },
        }),
      ).toEqual([expect.objectContaining({ value: 'currentLocale' })]);
    });

    it('should reject an engine key in the display of a command menu item', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({ contextKey: 'isSelectAll', value: 'true' }),
            ],
          },
          surface: 'commandMenuItem',
        }),
      ).toEqual([
        expect.objectContaining({
          message:
            'Conditional display context key "isSelectAll" is not allowed in conditionalDisplay',
        }),
      ]);
    });

    it('should reject a value its virtual field cannot parse', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({
                contextKey: 'currentWorkspaceMemberId',
                value: '"me"',
              }),
            ],
          },
        }),
      ).toEqual([expect.objectContaining({ value: '"me"' })]);
    });

    it('should reject a role that does not exist', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({
                contextKey: 'currentRoleId',
                value: JSON.stringify([
                  ROLE_UNIVERSAL_IDENTIFIER,
                  UNKNOWN_ROLE_UNIVERSAL_IDENTIFIER,
                ]),
              }),
            ],
          },
          surface: 'navigationMenuItem',
          objectMetadataUniversalIdentifier: null,
        }),
      ).toEqual([
        expect.objectContaining({ value: UNKNOWN_ROLE_UNIVERSAL_IDENTIFIER }),
      ]);
    });

    it('should reject a field of another object', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [fieldRule(OTHER_OBJECT_FIELD_UNIVERSAL_IDENTIFIER)],
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
            recordFilters: [fieldRule(TEXT_FIELD_UNIVERSAL_IDENTIFIER)],
          },
          surface: 'navigationMenuItem',
          objectMetadataUniversalIdentifier: null,
        }),
      ).toEqual([
        expect.objectContaining({ value: TEXT_FIELD_UNIVERSAL_IDENTIFIER }),
      ]);
    });

    it('should reject selectedRecordsMatch outside an engine condition', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [DEVICE_RULE],
            selectedRecordsMatch: 'SOME',
          },
        }),
      ).toEqual([expect.objectContaining({ value: 'SOME' })]);
    });
  });

  describe('engine rules', () => {
    it('should accept engine keys in the availability of a command menu item', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({ contextKey: 'isSelectAll', value: 'true' }),
              contextRule({
                contextKey: 'numberOfSelectedRecords',
                operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
                value: '0',
              }),
              contextRule({
                contextKey: 'pageType',
                operand: ViewFilterOperand.IS_NOT,
                value: '["RECORD_PAGE"]',
              }),
              contextRule({
                contextKey: 'objectMetadataItem',
                subFieldName: 'duplicateCriteria',
                operand: ViewFilterOperand.IS_EMPTY,
                value: '',
              }),
            ],
          },
          property: 'conditionalAvailability',
          surface: 'commandMenuItem',
        }),
      ).toEqual([]);
    });

    it('should accept a feature flag rule in the availability of a widget', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({
                contextKey: 'featureFlags',
                subFieldName: 'IS_AI_ENABLED',
                value: 'true',
              }),
            ],
          },
          property: 'conditionalAvailability',
        }),
      ).toEqual([]);
    });

    it('should accept a selected records path matched on every record', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({
                contextKey: 'selectedRecords',
                subFieldName: 'inboxStatus.isUnread',
                value: 'true',
              }),
            ],
            selectedRecordsMatch: 'EVERY',
          },
          property: 'conditionalPinned',
          surface: 'commandMenuItem',
        }),
      ).toEqual([]);
    });

    it('should reject an admin key in the pinned condition of a command menu item', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({
                contextKey: 'currentRoleId',
                value: JSON.stringify([ROLE_UNIVERSAL_IDENTIFIER]),
              }),
            ],
          },
          property: 'conditionalPinned',
          surface: 'commandMenuItem',
        }),
      ).toEqual([
        expect.objectContaining({
          message:
            'Conditional display context key "currentRoleId" is not allowed in conditionalPinned',
        }),
      ]);
    });

    it('should reject an engine key not available on widgets', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              contextRule({ contextKey: 'pageType', value: '["RECORD_PAGE"]' }),
            ],
          },
          property: 'conditionalAvailability',
        }),
      ).toEqual([
        expect.objectContaining({
          message:
            'Conditional display context key "pageType" is not allowed on pageLayoutWidget',
        }),
      ]);
    });

    it('should reject a field rule in the availability of a widget', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [fieldRule(TEXT_FIELD_UNIVERSAL_IDENTIFIER)],
          },
          property: 'conditionalAvailability',
        }),
      ).toEqual([
        expect.objectContaining({
          message:
            'Conditional display rules in conditionalAvailability cannot reference a record field',
        }),
      ]);
    });

    it('should reject an operand the key type does not support', () => {
      expect(
        validateCommandAvailability(
          contextRule({
            contextKey: 'numberOfSelectedRecords',
            operand: ViewFilterOperand.CONTAINS,
            value: '1',
          }),
        ),
      ).toEqual([
        expect.objectContaining({
          message:
            'Operand "CONTAINS" is not supported on conditional display context key "numberOfSelectedRecords" of type "NUMBER". Supported operands: IS, IS_NOT, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, IS_EMPTY, IS_NOT_EMPTY.',
        }),
      ]);
    });

    it('should reject an option the key does not define', () => {
      expect(
        validateCommandAvailability(
          contextRule({ contextKey: 'pageType', value: '["UNKNOWN_PAGE"]' }),
        ),
      ).toEqual([
        expect.objectContaining({
          message:
            'Conditional display context key "pageType" uses option(s) UNKNOWN_PAGE that do not exist. Allowed values: INDEX_PAGE, RECORD_PAGE, STANDALONE_PAGE, SETTINGS_PAGE.',
        }),
      ]);
    });
  });

  describe('sub field names', () => {
    it('should reject a sub field name on a scalar key', () => {
      expect(
        validateCommandAvailability(
          contextRule({
            contextKey: 'isSelectAll',
            subFieldName: 'value',
            value: 'true',
          }),
        ),
      ).toEqual([
        expect.objectContaining({
          message:
            'Conditional display context key "isSelectAll" does not accept a sub field name',
        }),
      ]);
    });

    it('should reject a map key without a sub field name', () => {
      expect(
        validateCommandAvailability(
          contextRule({ contextKey: 'featureFlags', value: 'true' }),
        ),
      ).toEqual([
        expect.objectContaining({
          message:
            'Conditional display context key "featureFlags" requires a sub field name',
        }),
      ]);
    });

    it('should reject a map key whose sub field name is a path', () => {
      expect(
        validateCommandAvailability(
          contextRule({
            contextKey: 'featureFlags',
            subFieldName: 'IS_AI_ENABLED.value',
            value: 'true',
          }),
        ),
      ).toEqual([expect.objectContaining({ value: 'IS_AI_ENABLED.value' })]);
    });

    it('should reject an unknown object property', () => {
      expect(
        validateCommandAvailability(
          contextRule({
            contextKey: 'objectMetadataItem',
            subFieldName: 'labelSingular',
            value: 'true',
          }),
        ),
      ).toEqual([expect.objectContaining({ value: 'labelSingular' })]);
    });

    it('should reject a selected records path with an empty segment', () => {
      expect(
        validateCommandAvailability(
          contextRule({
            contextKey: 'selectedRecords',
            subFieldName: 'inboxStatus..isUnread',
            value: 'true',
          }),
        ),
      ).toEqual([expect.objectContaining({ value: 'inboxStatus..isUnread' })]);
    });
  });

  describe('selected records values', () => {
    it('should reject a value on an emptiness operand', () => {
      expect(
        validateCommandAvailability(
          contextRule({
            contextKey: 'selectedRecords',
            subFieldName: 'inboxStatus.isUnread',
            operand: ViewFilterOperand.IS_NOT_EMPTY,
            value: 'true',
          }),
        ),
      ).toEqual([
        expect.objectContaining({
          message:
            'Value "true" of conditional display context key "selectedRecords" must be empty for operand "IS_NOT_EMPTY"',
        }),
      ]);
    });

    it('should reject a value that is not a JSON literal', () => {
      expect(
        validateCommandAvailability(
          contextRule({
            contextKey: 'selectedRecords',
            subFieldName: 'inboxStatus.isUnread',
            value: '[true]',
          }),
        ),
      ).toEqual([
        expect.objectContaining({
          message:
            'Value "[true]" of conditional display context key "selectedRecords" must be a JSON string, number or boolean',
        }),
      ]);
    });
  });

  describe('tree structure', () => {
    it('should reject a payload that is not a record filter tree', () => {
      const jsonLogic = { and: [{ '===': [{ var: 'device' }, 'MOBILE'] }] };
      const groupsNotArray = {
        recordFilters: [DEVICE_RULE],
        recordFilterGroups: { id: 'a', logicalOperator: 'AND' },
      };

      expect(validate({ conditionalDisplay: jsonLogic })).toEqual([
        expect.objectContaining({ value: jsonLogic }),
      ]);
      expect(validate({ conditionalDisplay: groupsNotArray })).toEqual([
        expect.objectContaining({ value: groupsNotArray }),
      ]);
    });

    it('should reject a rule with both a field and a context key', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [
              {
                ...DEVICE_RULE,
                fieldMetadataUniversalIdentifier:
                  TEXT_FIELD_UNIVERSAL_IDENTIFIER,
              },
            ],
          },
        }),
      ).toEqual([expect.objectContaining({ value: '0' })]);
    });

    it('should reject a logical operator other than AND or OR', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [{ ...DEVICE_RULE, recordFilterGroupId: 'a' }],
            recordFilterGroups: [{ id: 'a', logicalOperator: 'XOR' }],
          },
        }),
      ).toEqual([expect.objectContaining({ value: 'XOR' })]);
    });

    it('should reject a group whose parent does not exist', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [{ ...DEVICE_RULE, recordFilterGroupId: 'a' }],
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

    it('should reject groups forming a cycle', () => {
      expect(
        validate({
          conditionalDisplay: {
            recordFilters: [{ ...DEVICE_RULE, recordFilterGroupId: 'a' }],
            recordFilterGroups: [
              {
                id: 'a',
                logicalOperator: 'AND',
                parentRecordFilterGroupId: 'b',
              },
              {
                id: 'b',
                logicalOperator: 'OR',
                parentRecordFilterGroupId: 'a',
              },
            ],
          },
        }),
      ).toEqual([
        expect.objectContaining({ value: 'a' }),
        expect.objectContaining({ value: 'b' }),
      ]);
    });
  });
});
