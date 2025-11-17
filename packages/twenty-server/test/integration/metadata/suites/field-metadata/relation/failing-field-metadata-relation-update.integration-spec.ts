import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type UpdateOneFieldMetadataTestingContext = EachTestingContext<{
  name: string;
}>;

const globalTestContext = {
  employeeObjectId: '',
  enterpriseObjectId: '',
  employerFieldMetadataId: '',
};

describe('Field metadata relation update should fail', () => {
  const failingRelationUpdateTestsUseCase: UpdateOneFieldMetadataTestingContext[] =
    [
      {
        title: 'when name is not in camel case',
        context: { name: 'New Name' },
      },
    ];

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: employeeObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'employees',
        nameSingular: 'employee',
      }),
    });

    const {
      data: {
        createOneObject: { id: enterpriseObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'enterprises',
        nameSingular: 'enterprise',
      }),
    });

    const { data } = await createOneFieldMetadata({
      input: {
        objectMetadataId: employeeObjectId,
        name: 'employer',
        label: 'Employer',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetFieldLabel: 'employees',
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadataId: enterpriseObjectId,
          targetFieldIcon: 'IconBuildingSkyscraper',
        },
      },
    });

    globalTestContext.employeeObjectId = employeeObjectId;
    globalTestContext.enterpriseObjectId = enterpriseObjectId;
    globalTestContext.employerFieldMetadataId = data.createOneField.id;

    expect(data).toBeDefined();
  });

  afterAll(async () => {
    for (const objectMetadataId of [
      globalTestContext.employeeObjectId,
      globalTestContext.enterpriseObjectId,
    ]) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: {
            isActive: false,
          },
        },
      });
      await deleteOneObjectMetadata({
        input: {
          idToDelete: objectMetadataId,
        },
      });
    }
  });

  it.each(failingRelationUpdateTestsUseCase)(
    'relation $title',
    async ({ context }) => {
      const { errors } = await updateOneFieldMetadata({
        expectToFail: true,
        input: {
          idToUpdate: globalTestContext.employerFieldMetadataId,
          updatePayload: {
            name: context.name,
          },
        },
      });

      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
    },
  );
});
