import { createTestTextFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-test-field-metadata.util';
import { createListingCustomObject } from 'test/integration/metadata/suites/object-metadata/utils/create-test-object-metadata.util';
import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

describe('deleteOne', () => {
  describe('FieldMetadataService kanban aggregate operation reset', () => {
    let listingObjectId = '';
    let testFieldId = '';

    beforeEach(async () => {
      const { objectMetadataId: createdObjectId } =
        await createListingCustomObject();

      listingObjectId = createdObjectId;

      const { fieldMetadataId: createdFieldMetadaId } =
        await createTestTextFieldMetadata(createdObjectId);

      testFieldId = createdFieldMetadaId;
    });

    afterEach(async () => {
      await deleteOneObjectMetadataItem(listingObjectId);
    });

    it('should reset kanban aggregate operation when deleting a field used as kanbanAggregateOperationFieldMetadataId', async () => {
      // Arrange
      const deleteFieldInput = {
        id: testFieldId,
      };

      // Act
      const graphqlOperation = `
        mutation DeleteField($input: DeleteOneFieldInput!) {
          deleteOneField(input: $input) {
            id
            name
            label
          }
        }
      `;

      const response = await makeMetadataAPIRequest({
        query: graphqlOperation,
        variables: {
          input: deleteFieldInput,
        },
      });

      // Assert
      expect(response.body.data.deleteOneField.id).toBe(testFieldId);

      // Verify that views using this field as kanbanAggregateOperationFieldMetadataId are reset
      const viewsQuery = `
        query {
          views(where: { kanbanAggregateOperationFieldMetadataId: { eq: "${testFieldId}" } }) {
            id
            kanbanAggregateOperationFieldMetadataId
            kanbanAggregateOperation
          }
        }
      `;

      const viewsResponse = await makeMetadataAPIRequest({
        query: viewsQuery,
      });

      expect(viewsResponse.body.data.views).toEqual([]);
    });
  });
});
