import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { Operator } from 'src/modules/virtual-fields/types/Operator';
import { type ConditionalField } from 'src/modules/virtual-fields/types/VirtualField';
import {
  evaluateConditionalField,
  evaluateFieldCondition,
} from 'src/modules/virtual-fields/utils/evaluate-virtual-field-conditions.util';

describe('evaluate-virtual-field-conditions.util', () => {
  let objectMetadataMaps: ObjectMetadataMaps;

  beforeEach(async () => {
    objectMetadataMaps = {
      byId: {
        'company-object-id': {
          id: 'company-object-id',
          nameSingular: 'company',
          namePlural: 'companies',
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          labelSingular: 'Company',
          labelPlural: 'Companies',
          description: 'A company',
          icon: 'IconBuildingSkyscraper',
          labelIdentifierFieldMetadataId: 'name-field-id',
          imageIdentifierFieldMetadataId: null,
          indexMetadatas: [],
          fields: [],
          fieldsById: {
            [COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue]: {
              id: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
              type: 'CURRENCY',
              name: 'annualRecurringRevenue',
              label: 'ARR',
              description: 'Annual Recurring Revenue',
              icon: 'IconMoney',
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              fromRelationMetadata: null,
              toRelationMetadata: null,
              defaultValue: null,
              options: null,
              relationDefinition: null,
              objectMetadataId: 'company-object-id',
              standardId: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
            },
            [COMPANY_STANDARD_FIELD_IDS.connectionStrength]: {
              id: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
              type: 'NUMBER',
              name: 'connectionStrength',
              label: 'Connection Strength',
              description: 'Connection Strength',
              icon: 'IconNetwork',
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              fromRelationMetadata: null,
              toRelationMetadata: null,
              defaultValue: null,
              options: null,
              relationDefinition: null,
              objectMetadataId: 'company-object-id',
              standardId: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
            },
          },
          fieldIdByJoinColumnName: {},
          fieldIdByName: {
            annualRecurringRevenue:
              COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
            connectionStrength: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
          },
        },
      },
      idByNameSingular: {
        company: 'company-object-id',
      },
    } as unknown as ObjectMetadataMaps;
  });

  describe('evaluateConditionalField', () => {
    it('should evaluate customer tier - ENTERPRISE case', () => {
      const conditionalField: ConditionalField = {
        when: [
          {
            condition: {
              and: [
                {
                  field: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
                  operator: Operator.GTE,
                  value: 100_000_000_000,
                },
                {
                  field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
                  operator: Operator.GTE,
                  value: 50,
                },
              ],
            },
            value: 'ENTERPRISE',
          },
          {
            condition: {
              or: [
                {
                  field: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
                  operator: Operator.GTE,
                  value: 50_000_000_000,
                },
                {
                  field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
                  operator: Operator.GTE,
                  value: 25,
                },
              ],
            },
            value: 'BUSINESS',
          },
        ],
        default: 'BASIC',
      };

      const recordData = {
        annualRecurringRevenue: 150_000_000_000,
        connectionStrength: 75,
      };

      const result = evaluateConditionalField(
        conditionalField,
        recordData,
        objectMetadataMaps,
      );

      expect(result).toBe('ENTERPRISE');
    });

    it('should evaluate customer tier - BUSINESS case', () => {
      const conditionalField: ConditionalField = {
        when: [
          {
            condition: {
              and: [
                {
                  field: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
                  operator: Operator.GTE,
                  value: 100_000_000_000,
                },
                {
                  field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
                  operator: Operator.GTE,
                  value: 50,
                },
              ],
            },
            value: 'ENTERPRISE',
          },
          {
            condition: {
              or: [
                {
                  field: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
                  operator: Operator.GTE,
                  value: 50_000_000_000,
                },
                {
                  field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
                  operator: Operator.GTE,
                  value: 25,
                },
              ],
            },
            value: 'BUSINESS',
          },
        ],
        default: 'BASIC',
      };

      const recordData = {
        annualRecurringRevenue: 75_000_000_000,
        connectionStrength: 20,
      };

      const result = evaluateConditionalField(
        conditionalField,
        recordData,
        objectMetadataMaps,
      );

      expect(result).toBe('BUSINESS');
    });

    it('should evaluate customer tier - BASIC (default) case', () => {
      const conditionalField: ConditionalField = {
        when: [
          {
            condition: {
              and: [
                {
                  field: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
                  operator: Operator.GTE,
                  value: 100_000_000_000,
                },
                {
                  field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
                  operator: Operator.GTE,
                  value: 50,
                },
              ],
            },
            value: 'ENTERPRISE',
          },
          {
            condition: {
              or: [
                {
                  field: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
                  operator: Operator.GTE,
                  value: 50_000_000_000,
                },
                {
                  field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
                  operator: Operator.GTE,
                  value: 25,
                },
              ],
            },
            value: 'BUSINESS',
          },
        ],
        default: 'BASIC',
      };

      const recordData = {
        annualRecurringRevenue: 10_000_000,
        connectionStrength: 5,
      };

      const result = evaluateConditionalField(
        conditionalField,
        recordData,
        objectMetadataMaps,
      );

      expect(result).toBe('BASIC');
    });

    it('should handle edge case with missing field data', () => {
      const conditionalField: ConditionalField = {
        when: [
          {
            condition: {
              field: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
              operator: Operator.GTE,
              value: 100_000_000_000,
            },
            value: 'ENTERPRISE',
          },
        ],
        default: 'BASIC',
      };

      const recordData = {
        connectionStrength: 75,
      };

      const result = evaluateConditionalField(
        conditionalField,
        recordData,
        objectMetadataMaps,
      );

      expect(result).toBe('BASIC');
    });
  });

  describe('field condition evaluation', () => {
    it('should correctly evaluate EQ operator', () => {
      const condition = {
        field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
        operator: Operator.EQ,
        value: 50,
      };

      const recordData = { connectionStrength: 50 };

      const result = evaluateFieldCondition(
        condition,
        recordData,
        objectMetadataMaps,
      );

      expect(result).toBe(true);
    });

    it('should correctly evaluate NE operator', () => {
      const condition = {
        field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
        operator: Operator.NE,
        value: 50,
      };

      const recordData = { connectionStrength: 25 };

      const result = evaluateFieldCondition(
        condition,
        recordData,
        objectMetadataMaps,
      );

      expect(result).toBe(true);
    });

    it('should correctly evaluate GT operator', () => {
      const condition = {
        field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
        operator: Operator.GT,
        value: 50,
      };

      const recordData = { connectionStrength: 75 };

      const result = evaluateFieldCondition(
        condition,
        recordData,
        objectMetadataMaps,
      );

      expect(result).toBe(true);
    });

    it('should correctly evaluate LT operator', () => {
      const condition = {
        field: COMPANY_STANDARD_FIELD_IDS.connectionStrength,
        operator: Operator.LT,
        value: 50,
      };

      const recordData = { connectionStrength: 25 };

      const result = evaluateFieldCondition(
        condition,
        recordData,
        objectMetadataMaps,
      );

      expect(result).toBe(true);
    });
  });
});
