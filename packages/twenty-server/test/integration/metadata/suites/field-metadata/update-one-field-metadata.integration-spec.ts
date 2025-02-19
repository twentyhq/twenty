import { createCustomTextFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-custom-text-field-metadata.util';
import { deleteFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadataFactory } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-factory.util';
import { createListingCustomObject } from 'test/integration/metadata/suites/object-metadata/utils/create-test-object-metadata.util';
import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

describe('updateOne', () => {
  describe('FieldMetadataService name/label sync', () => {
    let listingObjectId = '';
    let testFieldId = '';

    beforeEach(async () => {
      const { objectMetadataId: createdObjectId } =
        await createListingCustomObject();

      listingObjectId = createdObjectId;

      const { fieldMetadataId: createdFieldMetadaId } =
        await createCustomTextFieldMetadata(createdObjectId);

      testFieldId = createdFieldMetadaId;
    });
    afterEach(async () => {
      await deleteFieldMetadata(testFieldId);
      await deleteOneObjectMetadataItem(listingObjectId);
    });

    it('should update a field name and label when they are synced correctly', async () => {
      // Arrange
      const updateFieldInput = {
        name: 'newName',
        label: 'New name',
      };

      // Act
      const graphqlOperation = updateOneFieldMetadataFactory({
        input: { id: testFieldId, update: updateFieldInput },
        gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
        `,
      });

      const response = await makeMetadataAPIRequest(graphqlOperation);

      // Assert
      expect(response.body.data.updateOneField.name).toBe('newName');
    });

    it('should update a field name and label when they are not synced correctly and labelSync is false', async () => {
      // Arrange
      const updateFieldInput = {
        name: 'differentName',
        label: 'New name',
        isLabelSyncedWithName: false,
      };

      // Act
      const graphqlOperation = updateOneFieldMetadataFactory({
        input: { id: testFieldId, update: updateFieldInput },
        gqlFields: `
              id
              name
              label
              isLabelSyncedWithName
          `,
      });

      const response = await makeMetadataAPIRequest(graphqlOperation);

      // Assert
      expect(response.body.data.updateOneField.name).toBe('differentName');
    });

    it('should not update a field name if it is not synced correctly with label and labelSync is true', async () => {
      // Arrange
      const updateFieldInput = {
        name: 'newName',
      };

      // Act
      const graphqlOperation = updateOneFieldMetadataFactory({
        input: { id: testFieldId, update: updateFieldInput },
        gqlFields: `
              id
              name
              label
              isLabelSyncedWithName
          `,
      });

      const response = await makeMetadataAPIRequest(graphqlOperation);

      // Assert
      expect(response.body.errors[0].message).toBe(
        'Name is not synced with label. Expected name: "testName", got newName',
      );
    });
  });
});
