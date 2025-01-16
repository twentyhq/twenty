import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createCustomTextFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-custom-text-field-metadata.util';
import { deleteOneFieldMetadataItemFactory } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata-factory.util';
import { updateOneFieldMetadataFactory } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-factory.util';
import { createListingCustomObject } from 'test/integration/metadata/suites/object-metadata/utils/create-test-object-metadata.util';
import { deleteOneObjectMetadataItem } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

describe('deleteOne', () => {
  describe('Kanban aggregate operation', () => {
    let listingObjectId = '';
    let testFieldId = '';
    let viewId = '';

    beforeEach(async () => {
      const { objectMetadataId: createdObjectId } =
        await createListingCustomObject();

      listingObjectId = createdObjectId;
      const { fieldMetadataId: createdFieldMetadaId } =
        await createCustomTextFieldMetadata(createdObjectId);

      testFieldId = createdFieldMetadaId;

      // create view
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'View',
        gqlFields: `
          id
          kanbanAggregateOperationFieldMetadataId
          kanbanAggregateOperation
        `,
        data: {
          kanbanAggregateOperationFieldMetadataId: testFieldId,
          kanbanAggregateOperation: 'MAX',
          objectMetadataId: listingObjectId,
          name: 'By Type',
          type: 'kanban',
          icon: 'IconLayoutKanban',
        },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      const createdView = response.body.data.createView;

      viewId = createdView.id;
    });
    afterEach(async () => {
      // delete view
      const deleteViewOperation = deleteOneOperationFactory({
        objectMetadataSingularName: 'View',
        gqlFields: 'id',
        recordId: viewId,
      });

      await makeGraphqlAPIRequest(deleteViewOperation);
      await deleteOneObjectMetadataItem(listingObjectId);
    });
    it('should reset kanban aggregate operation when deleting a field used as kanbanAggregateOperationFieldMetadataId', async () => {
      // Arrange
      // 1. Check that view has expcted kanbanAggregateOperationFieldMetadataId and kanbanAggregateOperation
      const findViewOperation = findOneOperationFactory({
        objectMetadataSingularName: 'view',
        gqlFields: `
          id
          kanbanAggregateOperationFieldMetadataId
          kanbanAggregateOperation
        `,
        filter: {
          id: {
            eq: viewId,
          },
        },
      });

      const viewResponse = await makeGraphqlAPIRequest(findViewOperation);

      expect(
        viewResponse.body.data.view.kanbanAggregateOperationFieldMetadataId,
      ).toBe(testFieldId);
      expect(viewResponse.body.data.view.kanbanAggregateOperation).toBe('MAX');

      // Deactivate field to be able to delete it after
      const deactivateFieldOperation = updateOneFieldMetadataFactory({
        input: { id: testFieldId, update: { isActive: false } },
        gqlFields: `
              id
              isActive
          `,
      });

      await makeMetadataAPIRequest(deactivateFieldOperation);

      // Act
      const graphqlOperation = deleteOneFieldMetadataItemFactory({
        idToDelete: testFieldId,
      });
      const response = await makeMetadataAPIRequest(graphqlOperation);

      // Assert
      // 1. Field is deleted
      expect(response.body.data.deleteOneField.id).toBe(testFieldId);

      // 2. Kanban aggregate operation has been reset on view using this field as kanbanAggregateOperationFieldMetadataId
      const updatedViewResponse =
        await makeGraphqlAPIRequest(findViewOperation);

      expect(
        updatedViewResponse.body.data.view
          .kanbanAggregateOperationFieldMetadataId,
      ).toBeNull();
      expect(updatedViewResponse.body.data.view.kanbanAggregateOperation).toBe(
        'COUNT',
      );
    });
  });
});
