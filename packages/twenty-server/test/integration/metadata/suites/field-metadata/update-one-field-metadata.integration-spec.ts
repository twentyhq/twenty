import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { FieldMetadataType } from 'twenty-shared/types';

describe('updateOne', () => {
  describe('successful fieldMetadataService name/label sync', () => {
    let listingObjectId = '';
    let testFieldId = '';

    beforeEach(async () => {
      const { data } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          labelSingular: LISTING_NAME_SINGULAR,
          labelPlural: LISTING_NAME_PLURAL,
          nameSingular: LISTING_NAME_SINGULAR,
          namePlural: LISTING_NAME_PLURAL,
          icon: 'IconBuildingSkyscraper',
          isLabelSyncedWithName: true,
        },
      });

      listingObjectId = data.createOneObject.id;

      const { data: createdFieldMetadata } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          objectMetadataId: listingObjectId,
          type: FieldMetadataType.TEXT,
          name: 'testName',
          label: 'Test name',
          isLabelSyncedWithName: true,
        },
      });

      testFieldId = createdFieldMetadata.createOneField.id;
    });
    afterEach(async () => {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: listingObjectId,
          updatePayload: {
            isActive: false,
          },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: listingObjectId },
      });
    });

    it('should update a field name and label when they are synced correctly', async () => {
      // Arrange
      const updateFieldInput = {
        name: 'newName',
        label: 'New name',
        isLabelSyncedWithName: true,
      };

      // Act
      const { data } = await updateOneFieldMetadata({
        input: { idToUpdate: testFieldId, updatePayload: updateFieldInput },
        gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
        `,
      });

      // Assert
      expect(data.updateOneField.name).toBe('newName');
    });

    it('should update a field name and label when they are not synced correctly and labelSync is false', async () => {
      // Arrange
      const updateFieldInput = {
        name: 'differentName',
        label: 'New name',
        isLabelSyncedWithName: false,
      };

      // Act
      const { data } = await updateOneFieldMetadata({
        input: { idToUpdate: testFieldId, updatePayload: updateFieldInput },
        gqlFields: `
              id
              name
              label
              isLabelSyncedWithName
          `,
      });

      // Assert
      expect(data.updateOneField.name).toBe('differentName');
    });
  });

  describe('failing update', () => {
    let listingObjectId = '';
    let testFieldId = '';

    beforeAll(async () => {
      const { data } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          labelSingular: LISTING_NAME_SINGULAR,
          labelPlural: LISTING_NAME_PLURAL,
          nameSingular: LISTING_NAME_SINGULAR,
          namePlural: LISTING_NAME_PLURAL,
          icon: 'IconBuildingSkyscraper',
          isLabelSyncedWithName: true,
        },
      });

      listingObjectId = data.createOneObject.id;

      const { data: createdFieldMetadata } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          objectMetadataId: listingObjectId,
          type: FieldMetadataType.TEXT,
          name: 'testName',
          label: 'Test name',
          isLabelSyncedWithName: true,
        },
      });

      testFieldId = createdFieldMetadata.createOneField.id;
    });
    afterAll(async () => {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: listingObjectId,
          updatePayload: {
            isActive: false,
          },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: listingObjectId },
      });
    });

    it('should not update a field name if it is not synced correctly with label and labelSync is true', async () => {
      // Arrange
      const updateFieldInput = {
        name: 'newName',
        isLabelSyncedWithName: true,
      };

      // Act
      const { errors } = await updateOneFieldMetadata({
        input: { idToUpdate: testFieldId, updatePayload: updateFieldInput },
        gqlFields: `
              id
              name
              label
              isLabelSyncedWithName
          `,
        expectToFail: true,
      });

      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
    });

    it('should throw if the field name is not available because of other field with the same name', async () => {
      await createOneFieldMetadata({
        expectToFail: false,
        input: {
          objectMetadataId: listingObjectId,
          type: FieldMetadataType.TEXT,
          name: 'otherTestName',
          label: 'Test name',
        },
      });

      const { errors } = await updateOneFieldMetadata({
        expectToFail: true,
        input: {
          idToUpdate: testFieldId,
          updatePayload: { name: 'otherTestName' },
        },
      });

      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
    });
  });
});
