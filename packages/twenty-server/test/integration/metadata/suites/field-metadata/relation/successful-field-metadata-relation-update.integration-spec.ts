import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

const globalTestContext = {
  employeeObjectId: '',
  enterpriseObjectId: '',
  employerFieldMetadataId: '',
};

describe('Field metadata relation update should succeed', () => {
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
      await deleteOneObjectMetadata({
        input: {
          idToDelete: objectMetadataId,
        },
      });
    }
  });

  it('when isActive is updated to false', async () => {
    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: globalTestContext.employerFieldMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
      gqlFields: `
        id
        isActive
      `,
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneField.isActive).toBe(false);
  });
});
