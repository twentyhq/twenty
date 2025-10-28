import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/generate-column-definitions.util';

describe('Generate Column Definitions', () => {
  const mockObjectMetadata = getFlatObjectMetadataMock({
    universalIdentifier: 'person',
    id: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    nameSingular: 'person',
  });

  const mockSchemaName = getWorkspaceSchemaName(mockObjectMetadata.workspaceId);

  describe('Enum Field Schema Generation', () => {
    it('should generate deterministic enum names to prevent schema conflicts', () => {
      const enumField = getFlatFieldMetadataMock({
        universalIdentifier: 'status',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.SELECT,
        name: 'status',
        options: [
          {
            id: '1',
            value: 'ACTIVE',
            label: 'Active',
            color: 'green',
            position: 0,
          },
          {
            id: '2',
            value: 'INACTIVE',
            label: 'Inactive',
            color: 'red',
            position: 1,
          },
        ],
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: enumField,
        flatObjectMetadata: mockObjectMetadata,
      });

      expect(columns).toHaveLength(1);

      const column = columns[0];

      expect(column).toEqual({
        name: 'status',
        type: `"${mockSchemaName}"."_person_status_enum"`,
        isArray: false,
        isNullable: true,
        isPrimary: false,
        isUnique: false,
        default: 'NULL',
      });
    });

    it('should handle multi-select fields with proper enum generation', () => {
      const multiSelectField = getFlatFieldMetadataMock({
        universalIdentifier: 'tags',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.MULTI_SELECT,
        name: 'tags',
        options: [
          {
            id: '1',
            value: 'URGENT',
            label: 'Urgent',
            color: 'red',
            position: 0,
          },
          {
            id: '2',
            value: 'LOW_PRIORITY',
            label: 'Low Priority',
            color: 'blue',
            position: 1,
          },
        ],
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: multiSelectField,
        flatObjectMetadata: mockObjectMetadata,
      });

      expect(columns).toHaveLength(1);

      const column = columns[0];

      expect(column).toEqual({
        name: 'tags',
        type: `"${mockSchemaName}"."_person_tags_enum"`,
        isArray: true,
        isNullable: true,
        isPrimary: false,
        isUnique: false,
        default: 'NULL',
      });
    });
  });

  describe('Relation Field Schema Generation', () => {
    it('should handle null relation settings without crashing', () => {
      const relationField = getFlatFieldMetadataMock({
        universalIdentifier: 'company',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.RELATION,
        name: 'company',
        settings: undefined,
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: relationField,
        flatObjectMetadata: mockObjectMetadata,
      });

      // Relations without join columns must return empty array
      expect(columns).toStrictEqual([]);
    });

    it('should generate proper UUID foreign key columns for valid relations', () => {
      const relationField = getFlatFieldMetadataMock({
        universalIdentifier: 'company',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.RELATION,
        name: 'company',
        settings: {
          relationType: 'MANY_TO_ONE' as any,
          joinColumnName: 'companyId',
        },
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: relationField,
        flatObjectMetadata: mockObjectMetadata,
      });

      expect(columns).toHaveLength(1);

      const column = columns[0];

      expect(column).toEqual({
        name: 'companyId',
        type: 'uuid',
        isNullable: true,
        isPrimary: false,
        isUnique: false,
        default: null,
        isArray: false,
      });
    });
  });

  describe('Composite Field Schema Generation', () => {
    it('should generate all required columns for ADDRESS composite type', () => {
      const addressField = getFlatFieldMetadataMock({
        universalIdentifier: 'address',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.ADDRESS,
        name: 'homeAddress',
        isNullable: true,
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: addressField,
        flatObjectMetadata: mockObjectMetadata,
      });

      expect(columns).toHaveLength(8);

      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toEqual([
        'homeAddressAddressStreet1',
        'homeAddressAddressStreet2',
        'homeAddressAddressCity',
        'homeAddressAddressPostcode',
        'homeAddressAddressState',
        'homeAddressAddressCountry',
        'homeAddressAddressLat',
        'homeAddressAddressLng',
      ]);

      // All composite columns must inherit parent nullable constraint
      columns.forEach((column) => {
        expect(column.isNullable).toBe(true);
        expect(column.isPrimary).toBe(false);
        expect(column.isUnique).toBe(false);
        expect(column.default).toBe('NULL');
      });
    });

    it('should handle CURRENCY composite type properly', () => {
      const currencyField = getFlatFieldMetadataMock({
        universalIdentifier: 'price',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.CURRENCY,
        name: 'price',
        defaultValue: {
          amountMicros: "'100000000'",
          currencyCode: "'USD'",
        },
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: currencyField,
        flatObjectMetadata: mockObjectMetadata,
      });

      expect(columns).toHaveLength(2);

      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toEqual(['priceAmountMicros', 'priceCurrencyCode']);

      expect(columns[0]).toMatchObject({
        name: 'priceAmountMicros',
        type: 'numeric',
        isNullable: true,
        isPrimary: false,
        isUnique: false,
        default: "'100000000'::numeric",
      });

      expect(columns[1]).toMatchObject({
        name: 'priceCurrencyCode',
        type: 'text',
        isNullable: true,
        isPrimary: false,
        isUnique: false,
        default: "'USD'::text",
      });
    });
  });

  describe('Default Value Schema Generation', () => {
    it('should handle null and undefined default values safely', () => {
      const textField = getFlatFieldMetadataMock({
        universalIdentifier: 'description',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.TEXT,
        name: 'description',
        defaultValue: null,
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: textField,
        flatObjectMetadata: mockObjectMetadata,
      });

      expect(columns).toStrictEqual([
        {
          name: 'description',
          type: 'text',
          isNullable: true,
          isPrimary: false,
          isUnique: false,
          default: 'NULL',
          isArray: false,
        },
      ]);
    });

    it('should handle boolean fields with default values', () => {
      const booleanField = getFlatFieldMetadataMock({
        universalIdentifier: 'isActive',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.BOOLEAN,
        name: 'isActive',
        defaultValue: true,
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: booleanField,
        flatObjectMetadata: mockObjectMetadata,
      });

      expect(columns).toStrictEqual([
        {
          name: 'isActive',
          type: 'boolean',
          isNullable: true,
          isPrimary: false,
          isUnique: false,
          default: "'true'::boolean",
          isArray: false,
        },
      ]);
    });
  });

  describe('Field Definition Generation', () => {
    it('should handle text fields without crashing', () => {
      const textField = getFlatFieldMetadataMock({
        universalIdentifier: 'content',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.TEXT,
        name: 'content',
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: textField,
        flatObjectMetadata: mockObjectMetadata,
      });

      expect(columns).toStrictEqual([
        {
          name: 'content',
          type: 'text',
          isNullable: true,
          isPrimary: false,
          isUnique: false,
          default: 'NULL',
          isArray: false,
        },
      ]);
    });

    it('should handle UUID fields properly', () => {
      const uuidField = getFlatFieldMetadataMock({
        universalIdentifier: 'uuid',
        objectMetadataId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        type: FieldMetadataType.UUID,
        name: 'uuid',
      });

      const columns = generateColumnDefinitions({
        flatFieldMetadata: uuidField,
        flatObjectMetadata: mockObjectMetadata,
      });

      expect(columns).toStrictEqual([
        {
          name: 'uuid',
          type: 'uuid',
          isNullable: true,
          isPrimary: false,
          isUnique: false,
          default: 'NULL',
          isArray: false,
        },
      ]);
    });
  });
});
