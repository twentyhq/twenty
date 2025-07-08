import { CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

describe('createOne', () => {
  describe('FieldMetadataService name/label sync', () => {
    let createdObjectMetadataId = '';

    beforeEach(async () => {
      const {
        data: {
          createOneObject: { id: objectMetadataId },
        },
      } = await createOneObjectMetadata({
        input: {
          nameSingular: 'myTestObject',
          namePlural: 'myTestObjects',
          labelSingular: 'My Test Object',
          labelPlural: 'My Test Objects',
          icon: 'Icon123',
        },
      });

      createdObjectMetadataId = objectMetadataId;
    });
    afterEach(async () => {
      await deleteOneObjectMetadata({
        input: { idToDelete: createdObjectMetadataId },
      });
    });
    it('should create a field when name and label are synced correctly', async () => {
      // Arrange
      const FIELD_NAME = 'testField';
      const createFieldInput = {
        name: FIELD_NAME,
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
        isLabelSyncedWithName: true,
      };

      // Act
      const { data } = await createOneFieldMetadata({
        input: createFieldInput,
        gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
      });

      // Assert
      expect(data.createOneField.name).toBe(FIELD_NAME);
    });

    it('should set isLabelSyncWithName to false if not in input', async () => {
      // Arrange
      const createFieldInput = {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
      };

      // Act
      const { data } = await createOneFieldMetadata({
        input: createFieldInput,
        gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
          `,
      });

      // Assert
      expect(data.createOneField.isLabelSyncedWithName).toBe(false);
    });

    it('should return an error when name and label are not synced but isLabelSyncedWithName is true', async () => {
      // Arrange
      const createFieldInput = {
        name: 'testField',
        label: 'Different Label',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
        isLabelSyncedWithName: true,
      };

      // Act
      const { errors } = await createOneFieldMetadata({
        input: createFieldInput,
        gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
          `,
        expectToFail: true,
      });

      // Assert
      expect(errors[0].message).toBe(
        'Name is not synced with label. Expected name: "differentLabel", got testField',
      );
    });
  });
  describe('FieldMetadataService relation fields', () => {
    let createdObjectMetadataPersonId = '';
    let createdObjectMetadataOpportunityId = '';
    let createdObjectMetadataCompanyId = '';

    beforeEach(async () => {
      const {
        data: {
          createOneObject: { id: objectMetadataPersonId },
        },
      } = await createOneObjectMetadata({
        input: {
          nameSingular: 'personForRelation',
          namePlural: 'peopleForRelation',
          labelSingular: 'Person For Relation',
          labelPlural: 'People For Relation',
          icon: 'IconPerson',
        },
      });

      createdObjectMetadataPersonId = objectMetadataPersonId;

      const {
        data: {
          createOneObject: { id: objectMetadataCompanyId },
        },
      } = await createOneObjectMetadata({
        input: {
          nameSingular: 'companyForRelation',
          namePlural: 'companiesForRelation',
          labelSingular: 'Company For Relation',
          labelPlural: 'Companies For Relation',
          icon: 'IconCompany',
        },
      });

      createdObjectMetadataCompanyId = objectMetadataCompanyId;

      const {
        data: {
          createOneObject: { id: objectMetadataOpportunityId },
        },
      } = await createOneObjectMetadata({
        input: {
          nameSingular: 'opportunityForRelation',
          namePlural: 'opportunitiesForRelation',
          labelSingular: 'Opportunity For Relation',
          labelPlural: 'Opportunities For Relation',
          icon: 'IconOpportunity',
        },
      });

      createdObjectMetadataOpportunityId = objectMetadataOpportunityId;
    });
    afterEach(async () => {
      await deleteOneObjectMetadata({
        input: { idToDelete: createdObjectMetadataPersonId },
      });
      await deleteOneObjectMetadata({
        input: { idToDelete: createdObjectMetadataOpportunityId },
      });
      await deleteOneObjectMetadata({
        input: { idToDelete: createdObjectMetadataCompanyId },
      });
    });

    it('should create a RELATION field type', async () => {
      const createFieldInput: CreateOneFieldFactoryInput = {
        name: 'person',
        label: 'person field',
        type: FieldMetadataType.RELATION,
        objectMetadataId: createdObjectMetadataOpportunityId,
        isLabelSyncedWithName: false,
        relationCreationPayload: {
          targetObjectMetadataId: createdObjectMetadataPersonId,
          targetFieldLabel: 'opportunity',
          targetFieldIcon: 'IconListOpportunity',
          type: RelationType.MANY_TO_ONE,
        },
      };

      const { data: createdFieldPerson } = await createOneFieldMetadata({
        input: createFieldInput,
        gqlFields: `
              id
              name
              label
              isLabelSyncedWithName
            `,
        expectToFail: false,
      });

      expect(createdFieldPerson.createOneField.name).toBe('person');

      // TODO : find a way to filter by objectmetadataid toavoid loading all fieldMetadata objects
      const findOpportunityOperation = findManyFieldsMetadataQueryFactory({
        gqlFields: `
          id
          name
          object {
            id
            nameSingular
          }
          relation {
            type
          }
          settings
      `,
        input: {
          filter: {},
          paging: { first: 10000 },
        },
      });

      const opportunityFieldsResponse = await makeMetadataAPIRequest(
        findOpportunityOperation,
      );

      const allFields = opportunityFieldsResponse.body.data.fields.edges;
      const opportunityFieldOnPerson = allFields.find(
        (field: any) =>
          field.node?.object?.id === createdObjectMetadataPersonId &&
          field.node?.name ===
            createFieldInput.relationCreationPayload?.targetFieldLabel,
      ).node;

      expect(opportunityFieldOnPerson.object.nameSingular).toBe(
        'personForRelation',
      );
      expect(opportunityFieldOnPerson.relation.type).toBe(
        RelationType.ONE_TO_MANY,
      );

      await deleteOneFieldMetadata({
        input: { idToDelete: createdFieldPerson.createOneField.id },
      });
    });

    // TODO: replace xit by it once the Morph works
    xit('should create a MORPH_RELATION field type', async () => {
      const createFieldInput: CreateOneFieldFactoryInput = {
        name: 'owner',
        label: 'owner field',
        type: FieldMetadataType.MORPH_RELATION,
        objectMetadataId: createdObjectMetadataOpportunityId,
        isLabelSyncedWithName: false,
        morphRelationsCreationPayload: [
          {
            targetObjectMetadataId: createdObjectMetadataPersonId,
            targetFieldLabel: 'opportunity',
            targetFieldIcon: 'IconListOpportunity',
            type: RelationType.MANY_TO_ONE,
          },
          {
            targetObjectMetadataId: createdObjectMetadataCompanyId,
            targetFieldLabel: 'opportunity',
            targetFieldIcon: 'IconListOpportunity',
            type: RelationType.MANY_TO_ONE,
          },
        ],
      };

      const { data: createdFieldOwner } = await createOneFieldMetadata({
        input: createFieldInput,
        gqlFields: `
              id
              name
              label
              isLabelSyncedWithName
            `,
        expectToFail: false,
      });

      // expect(createdFieldOwner.createOneField.name).toBe('owner');

      await deleteOneFieldMetadata({
        input: { idToDelete: createdFieldOwner.createOneField.id },
      });
    });
  });
});
