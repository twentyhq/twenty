import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  getFieldMetadata,
  getObjectMetadataByName,
  resolveField,
  resolveFieldById,
  resolveFieldByStandardId,
  resolveObjectById,
} from 'src/modules/virtual-fields/utils/metadata-resolver.util';

describe('metadata-resolver.util', () => {
  const mockObjectMetadataMaps: ObjectMetadataMaps = {
    byId: {
      [STANDARD_OBJECT_IDS.company]: {
        id: STANDARD_OBJECT_IDS.company,
        nameSingular: 'company',
        namePlural: 'companies',
        standardId: STANDARD_OBJECT_IDS.company,
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
          'name-field-id': {
            id: 'name-field-id',
            type: 'TEXT',
            name: 'name',
            standardId: COMPANY_STANDARD_FIELD_IDS.name,
            label: 'Name',
            description: 'Company name',
            icon: 'IconText',
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
            objectMetadataId: STANDARD_OBJECT_IDS.company,
          },
        },
        fieldIdByJoinColumnName: {},
        fieldIdByName: {
          name: 'name-field-id',
        },
      },
    },
    idByNameSingular: {
      company: STANDARD_OBJECT_IDS.company,
    },
  } as unknown as ObjectMetadataMaps;

  describe('resolveFieldByStandardId', () => {
    it('should resolve field by standard ID', () => {
      const result = resolveFieldByStandardId(
        COMPANY_STANDARD_FIELD_IDS.name,
        mockObjectMetadataMaps,
      );

      expect(result).toEqual({
        objectName: 'company',
        fieldName: 'name',
      });
    });

    it('should return null for non-existent standard ID', () => {
      const result = resolveFieldByStandardId(
        'non-existent-standard-id' as any,
        mockObjectMetadataMaps,
      );

      expect(result).toBeNull();
    });
  });

  describe('resolveFieldById', () => {
    it('should resolve field by field ID', () => {
      const result = resolveFieldById('name-field-id', mockObjectMetadataMaps);

      expect(result).toEqual({
        objectName: 'company',
        fieldName: 'name',
      });
    });

    it('should return null for non-existent field ID', () => {
      const result = resolveFieldById(
        'non-existent-id',
        mockObjectMetadataMaps,
      );

      expect(result).toBeNull();
    });
  });

  describe('resolveField', () => {
    it('should resolve field by standard ID first', () => {
      const result = resolveField(
        COMPANY_STANDARD_FIELD_IDS.name,
        mockObjectMetadataMaps,
      );

      expect(result).toEqual({
        objectName: 'company',
        fieldName: 'name',
      });
    });

    it('should resolve field by field ID as fallback', () => {
      const result = resolveField('name-field-id', mockObjectMetadataMaps);

      expect(result).toEqual({
        objectName: 'company',
        fieldName: 'name',
      });
    });

    it('should throw error when shouldThrowOnError is true and field not found', () => {
      expect(() =>
        resolveField('non-existent-id', mockObjectMetadataMaps, {
          shouldThrowOnError: true,
        }),
      ).toThrow('Could not resolve field ID: non-existent-id');
    });

    it('should return null when shouldThrowOnError is false and field not found', () => {
      const result = resolveField('non-existent-id', mockObjectMetadataMaps, {
        shouldThrowOnError: false,
      });

      expect(result).toBeNull();
    });
  });

  describe('resolveObjectById', () => {
    it('should resolve object by direct ID', () => {
      const result = resolveObjectById(
        STANDARD_OBJECT_IDS.company,
        mockObjectMetadataMaps,
      );

      expect(result).toBe('company');
    });

    it('should return null for non-existent object ID', () => {
      const result = resolveObjectById(
        'non-existent-id' as any,
        mockObjectMetadataMaps,
      );

      expect(result).toBeNull();
    });
  });

  describe('getFieldMetadata', () => {
    it('should get field metadata by standard ID', () => {
      const result = getFieldMetadata(
        COMPANY_STANDARD_FIELD_IDS.name,
        mockObjectMetadataMaps,
      );

      expect(result).toEqual(
        mockObjectMetadataMaps.byId[STANDARD_OBJECT_IDS.company]!.fieldsById[
          'name-field-id'
        ],
      );
    });

    it('should get field metadata by field ID', () => {
      const result = getFieldMetadata('name-field-id', mockObjectMetadataMaps);

      expect(result).toEqual(
        mockObjectMetadataMaps.byId[STANDARD_OBJECT_IDS.company]!.fieldsById[
          'name-field-id'
        ],
      );
    });

    it('should return null for non-existent field', () => {
      const result = getFieldMetadata(
        'non-existent-id',
        mockObjectMetadataMaps,
      );

      expect(result).toBeNull();
    });
  });

  describe('getObjectMetadataByName', () => {
    it('should get object metadata by name', () => {
      const result = getObjectMetadataByName('company', mockObjectMetadataMaps);

      expect(result).toEqual(
        mockObjectMetadataMaps.byId[STANDARD_OBJECT_IDS.company],
      );
    });

    it('should return undefined for non-existent object name', () => {
      const result = getObjectMetadataByName(
        'non-existent',
        mockObjectMetadataMaps,
      );

      expect(result).toBeUndefined();
    });
  });
});
