import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';

import {
  getFieldUniversalIdentifier,
  getSystemRelationFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { capitalize, isDefined } from 'twenty-shared/utils';

const SYSTEM_FIELD_NAMES = [
  'id',
  'name',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
  'searchVector',
];

const DEFAULT_RELATION_FORWARD_FIELD_NAMES = [
  'timelineActivities',
  'attachments',
  'noteTargets',
  'taskTargets',
];

const OBJECT_NAME_SINGULAR = 'rocketForUniversalIdentifier';

type FetchedField = {
  id: string;
  name: string;
  universalIdentifier: string;
  relation: {
    targetFieldMetadata: {
      id: string;
      name: string;
      universalIdentifier: string;
    };
    targetObjectMetadata: {
      id: string;
      nameSingular: string;
      universalIdentifier: string;
    };
  } | null;
};

describe('Custom object creation deterministic field universal identifiers', () => {
  let createdObjectMetadataId: string;
  let objectUniversalIdentifier: string;
  let applicationUniversalIdentifier: string;
  let fetchedFields: FetchedField[];

  beforeAll(async () => {
    const { data: createObjectData } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: `${OBJECT_NAME_SINGULAR}s`,
        labelSingular: 'Rocket For Universal Identifier',
        labelPlural: 'Rockets For Universal Identifier',
        icon: 'IconRocket',
      },
      gqlFields: 'id universalIdentifier applicationId',
    });

    createdObjectMetadataId = createObjectData.createOneObject.id;
    objectUniversalIdentifier =
      createObjectData.createOneObject.universalIdentifier;

    const { data: findManyApplicationsData } = await findManyApplications({
      expectToFail: false,
    });

    const workspaceCustomApplication =
      findManyApplicationsData.findManyApplications.find(
        (application) =>
          application.id === createObjectData.createOneObject.applicationId,
      );

    if (!isDefined(workspaceCustomApplication)) {
      throw new Error(
        'Could not resolve the application of the created custom object',
      );
    }

    applicationUniversalIdentifier =
      workspaceCustomApplication.universalIdentifier;

    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { objectMetadataId: { eq: createdObjectMetadataId } },
        paging: { first: 100 },
      },
      gqlFields: `
        id
        name
        universalIdentifier
        relation {
          targetFieldMetadata { id name universalIdentifier }
          targetObjectMetadata { id nameSingular universalIdentifier }
        }
      `,
    });

    fetchedFields = fields.map((edge: { node: FetchedField }) => edge.node);
  });

  afterAll(async () => {
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it.each(SYSTEM_FIELD_NAMES)(
    'should derive the %s system field universal identifier deterministically',
    (systemFieldName) => {
      const systemField = fetchedFields.find(
        (field) => field.name === systemFieldName,
      );

      expect(systemField).toBeDefined();
      expect(systemField?.universalIdentifier).toBe(
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier,
          name: systemFieldName,
        }),
      );
    },
  );

  it.each(DEFAULT_RELATION_FORWARD_FIELD_NAMES)(
    'should derive the %s default relation field universal identifiers deterministically',
    async (forwardFieldName) => {
      const forwardField = fetchedFields.find(
        (field) => field.name === forwardFieldName,
      );

      expect(forwardField).toBeDefined();

      const standardRelationObject =
        forwardField?.relation?.targetObjectMetadata;

      expect(standardRelationObject).toBeDefined();

      if (!isDefined(standardRelationObject)) {
        return;
      }

      const { fields: standardObjectFieldEdges } = await findManyFieldsMetadata(
        {
          expectToFail: false,
          input: {
            filter: { objectMetadataId: { eq: standardRelationObject.id } },
            paging: { first: 1000 },
          },
          gqlFields: 'id name universalIdentifier',
        },
      );

      const storedReverseFieldName = `target${capitalize(OBJECT_NAME_SINGULAR)}`;
      const reverseField = standardObjectFieldEdges
        .map((edge: { node: FetchedField }) => edge.node)
        .find((field: FetchedField) => field.name === storedReverseFieldName);

      expect(reverseField).toBeDefined();
      // Both sides of a system relation use the name-free deterministic
      // identifier (host + relation target object, direction encoded by
      // swapping them) so an object rename stays a lossless update.
      expect(forwardField?.universalIdentifier).toBe(
        getSystemRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier: objectUniversalIdentifier,
          relationTargetObjectUniversalIdentifier:
            standardRelationObject.universalIdentifier,
        }),
      );
      expect(reverseField?.universalIdentifier).toBe(
        getSystemRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier:
            standardRelationObject.universalIdentifier,
          relationTargetObjectUniversalIdentifier: objectUniversalIdentifier,
        }),
      );
    },
  );
});
