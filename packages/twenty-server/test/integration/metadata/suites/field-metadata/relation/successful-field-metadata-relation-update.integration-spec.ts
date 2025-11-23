import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
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

  it('should successfully update the name of a relation field', async () => {
    const { fields } = await findManyFieldsMetadata({
      input: {
        filter: {
          id: { eq: globalTestContext.employerFieldMetadataId },
        },
        paging: { first: 1 },
      },
      gqlFields: `
        id
        name
      `,
    });

    const field = fields[0]?.node;

    expect(field?.name).toBe('employer');

    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: globalTestContext.employerFieldMetadataId,
        updatePayload: {
          name: 'leadEmployer',
        },
      },
      gqlFields: `
        id
        name
      `,
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneField.name).toBe('leadEmployer');
  });
});

describe('Field metadata self-relation update should succeed', () => {
  let personObjectId: string;

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'peopleForUpdate',
        nameSingular: 'personForUpdate',
      }),
    });

    personObjectId = objectId;
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: personObjectId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: {
        idToDelete: personObjectId,
      },
    });
  });

  it('should successfully update MANY_TO_ONE self-relation field label', async () => {
    const createdField = await createRelationBetweenObjects({
      objectMetadataId: personObjectId,
      targetObjectMetadataId: personObjectId,
      relationType: RelationType.MANY_TO_ONE,
      type: FieldMetadataType.RELATION,
      name: 'supervisor',
    });

    jestExpectToBeDefined(createdField.id);

    const { data } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdField.id,
        updatePayload: {
          label: 'Direct Supervisor',
          description: 'The direct supervisor of this person',
        },
      },
      gqlFields: `
        id
        label
        description
      `,
    });

    expect(data.updateOneField).toMatchObject({
      id: createdField.id,
      label: 'Direct Supervisor',
      description: 'The direct supervisor of this person',
    });
  });

  it('should successfully update ONE_TO_MANY self-relation field label', async () => {
    const createdField = await createRelationBetweenObjects({
      objectMetadataId: personObjectId,
      targetObjectMetadataId: personObjectId,
      relationType: RelationType.ONE_TO_MANY,
      type: FieldMetadataType.RELATION,
      name: 'directReports',
      targetFieldLabel: 'supervisor',
    });

    jestExpectToBeDefined(createdField.id);

    const { data } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdField.id,
        updatePayload: {
          label: 'Direct Reports',
          description: 'All direct reports under this person',
          icon: 'IconUsers',
        },
      },
      gqlFields: `
        id
        label
        description
        icon
      `,
    });

    expect(data.updateOneField).toMatchObject({
      id: createdField.id,
      label: 'Direct Reports',
      description: 'All direct reports under this person',
      icon: 'IconUsers',
    });
  });

  it('should successfully update both sides of self-relation independently', async () => {
    const createdField = await createRelationBetweenObjects({
      objectMetadataId: personObjectId,
      targetObjectMetadataId: personObjectId,
      relationType: RelationType.MANY_TO_ONE,
      type: FieldMetadataType.RELATION,
      name: 'mentor',
    });

    jestExpectToBeDefined(createdField.id);
    jestExpectToBeDefined(createdField.relation?.targetFieldMetadata.id);

    const mentorFieldId = createdField.id;
    const menteesFieldId = createdField.relation.targetFieldMetadata.id;

    // Update the MANY_TO_ONE side
    const { data: mentorUpdateData } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: mentorFieldId,
        updatePayload: {
          label: 'Mentor',
          description: 'The mentor of this person',
        },
      },
      gqlFields: `
        id
        label
        description
      `,
    });

    expect(mentorUpdateData.updateOneField).toMatchObject({
      id: mentorFieldId,
      label: 'Mentor',
      description: 'The mentor of this person',
    });

    // Update the ONE_TO_MANY side
    const { data: menteesUpdateData } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: menteesFieldId,
        updatePayload: {
          label: 'Mentees',
          description: 'All mentees under this person',
        },
      },
      gqlFields: `
        id
        label
        description
      `,
    });

    expect(menteesUpdateData.updateOneField).toMatchObject({
      id: menteesFieldId,
      label: 'Mentees',
      description: 'All mentees under this person',
    });
  });
});
