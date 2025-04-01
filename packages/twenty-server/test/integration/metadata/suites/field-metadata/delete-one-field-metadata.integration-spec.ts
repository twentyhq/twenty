import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

describe('deleteOne', () => {
  describe('Kanban aggregate operation', () => {
    let listingObjectId = '';
    let testFieldId = '';
    let viewId = '';

    beforeEach(async () => {
      const { data } = await createOneObjectMetadata({
        input: {
          nameSingular: LISTING_NAME_SINGULAR,
          namePlural: LISTING_NAME_PLURAL,
          labelSingular: 'Listing',
          labelPlural: 'Listings',
          icon: 'IconBuildingSkyscraper',
        },
      });

      listingObjectId = data.createOneObject.id;
      const { data: createdFieldData } = await createOneFieldMetadata({
        input: {
          name: 'house',
          type: FieldMetadataType.TEXT,
          label: 'House',
          objectMetadataId: listingObjectId,
        },
      });

      testFieldId = createdFieldData.createOneField.id;

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
      await deleteOneObjectMetadata({
        input: { idToDelete: listingObjectId },
      });
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
      await updateOneFieldMetadata({
        input: {
          idToUpdate: testFieldId,
          updatePayload: { isActive: false },
        },
        gqlFields: `
              id
              isActive
          `,
      });

      // Act
      const { data } = await deleteOneFieldMetadata({
        input: { idToDelete: testFieldId },
      });

      // Assert
      // 1. Field is deleted
      expect(data.deleteOneField.id).toBe(testFieldId);

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
