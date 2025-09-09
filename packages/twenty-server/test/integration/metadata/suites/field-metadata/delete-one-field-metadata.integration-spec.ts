import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import {
  createTestViewWithRestApi,
  findViewByIdWithRestApi,
} from 'test/integration/rest/utils/view-rest-api.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

describe('deleteOne', () => {
  describe('Kanban aggregate operation', () => {
    let listingObjectId = '';
    let testFieldId = '';
    let viewId = '';

    beforeEach(async () => {
      const { data } = await createOneObjectMetadata({
        expectToFail: false,
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
        expectToFail: false,
        input: {
          name: 'house',
          type: FieldMetadataType.TEXT,
          label: 'House',
          objectMetadataId: listingObjectId,
        },
      });

      testFieldId = createdFieldData.createOneField.id;

      const createdView = await createTestViewWithRestApi({
        name: generateRecordName('By Type'),
        objectMetadataId: listingObjectId,
        type: ViewType.KANBAN,
        kanbanAggregateOperationFieldMetadataId: testFieldId,
        kanbanAggregateOperation: AggregateOperations.MAX,
        icon: 'IconLayoutKanban',
      });

      viewId = createdView.id;
    });
    afterEach(async () => {
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: listingObjectId },
      });
    });
    it('should reset kanban aggregate operation when deleting a field used as kanbanAggregateOperationFieldMetadataId', async () => {
      const viewThatShouldBeUpdated = await findViewByIdWithRestApi(viewId);

      if (!isDefined(viewThatShouldBeUpdated)) {
        throw new Error('View not found, this should not happen');
      }

      expect(
        viewThatShouldBeUpdated.kanbanAggregateOperationFieldMetadataId,
      ).toBe(testFieldId);
      expect(viewThatShouldBeUpdated.kanbanAggregateOperation).toBe('MAX');

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

      const { data } = await deleteOneFieldMetadata({
        input: { idToDelete: testFieldId },
      });

      expect(data.deleteOneField.id).toBe(testFieldId);

      const updatedViewResponse = await findViewByIdWithRestApi(viewId);

      if (!isDefined(updatedViewResponse)) {
        throw new Error('View not found, this should not happen');
      }

      expect(
        updatedViewResponse.kanbanAggregateOperationFieldMetadataId,
      ).toBeNull();
      expect(updatedViewResponse.kanbanAggregateOperation).toBe(null);
    });
  });
});
