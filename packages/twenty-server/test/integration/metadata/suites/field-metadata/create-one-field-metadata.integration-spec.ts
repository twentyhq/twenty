import { createOneFieldMetadataFactory } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-factory.util';
import { createListingCustomObject } from 'test/integration/metadata/suites/object-metadata/utils/create-test-object-metadata.util';
import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared';

describe('createOne', () => {
  describe('FieldMetadataService name/label sync', () => {
    let listingObjectId = '';

    beforeEach(async () => {
      const { objectMetadataId: createdObjectId } =
        await createListingCustomObject();

      listingObjectId = createdObjectId;
    });
    afterEach(async () => {
      await deleteOneObjectMetadataItem(listingObjectId);
    });
    it('should create a field when name and label are synced correctly', async () => {
      // Arrange
      const FIELD_NAME = 'testField';
      const createFieldInput = {
        name: FIELD_NAME,
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: listingObjectId,
        isLabelSyncedWithName: true,
      };

      // Act
      const graphqlOperation = createOneFieldMetadataFactory({
        input: { field: createFieldInput },
        gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
        `,
      });

      const response = await makeMetadataAPIRequest(graphqlOperation);

      // Assert
      expect(response.body.data.createOneField.name).toBe(FIELD_NAME);
    });

    it('should set isLabelSyncWithName to false if not in input', async () => {
      // Arrange
      const createFieldInput = {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: listingObjectId,
      };

      // Act
      const graphqlOperation = createOneFieldMetadataFactory({
        input: { field: createFieldInput },
        gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
        `,
      });

      const response = await makeMetadataAPIRequest(graphqlOperation);

      // Assert
      expect(response.body.data.createOneField.isLabelSyncedWithName).toBe(
        false,
      );
    });

    it('should return an error when name and label are not synced but isLabelSyncedWithName is true', async () => {
      // Arrange
      const createFieldInput = {
        name: 'testField',
        label: 'Different Label',
        type: FieldMetadataType.TEXT,
        objectMetadataId: listingObjectId,
        isLabelSyncedWithName: true,
      };

      const graphqlOperation = createOneFieldMetadataFactory({
        input: { field: createFieldInput },
        gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
        `,
      });

      // Act
      const response = await makeMetadataAPIRequest(graphqlOperation);

      // Assert
      expect(response.body.errors[0].message).toBe(
        'Name is not synced with label. Expected name: "differentLabel", got testField',
      );
    });
  });
});
