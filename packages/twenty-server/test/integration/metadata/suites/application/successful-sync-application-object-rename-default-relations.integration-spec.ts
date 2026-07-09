import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import {
  getFieldUniversalIdentifier,
  type FieldManifest,
  type Manifest,
  type ObjectFieldManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();

// Mirrors the SDK's default standard-relation provisioning
// (packages/twenty-sdk/src/cli/utilities/build/manifest/utils/get-default-relation-object-fields.ts):
// forward fields keep constant names while reverse field names and their
// derived universal identifiers depend on the object nameSingular.
const DEFAULT_RELATION_CONFIGS = [
  {
    fieldName: 'timelineActivities',
    label: 'Timeline Activities',
    standardObjectKey: 'timelineActivity',
  },
  {
    fieldName: 'attachments',
    label: 'Attachments',
    standardObjectKey: 'attachment',
  },
  {
    fieldName: 'noteTargets',
    label: 'Note Targets',
    standardObjectKey: 'noteTarget',
  },
  {
    fieldName: 'taskTargets',
    label: 'Task Targets',
    standardObjectKey: 'taskTarget',
  },
] as const;

const computeReverseFieldUniversalIdentifier = ({
  standardObjectKey,
  nameSingular,
}: {
  standardObjectKey: (typeof DEFAULT_RELATION_CONFIGS)[number]['standardObjectKey'];
  nameSingular: string;
}) =>
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: TEST_APP_ID,
    objectUniversalIdentifier:
      STANDARD_OBJECTS[standardObjectKey].universalIdentifier,
    name: `target${capitalize(nameSingular)}`,
  });

const buildDefaultRelationManifestFields = (
  nameSingular: string,
): { objectFields: ObjectFieldManifest[]; fields: FieldManifest[] } => {
  const objectFields: ObjectFieldManifest[] = [];
  const fields: FieldManifest[] = [];

  for (const config of DEFAULT_RELATION_CONFIGS) {
    const standardObject = STANDARD_OBJECTS[config.standardObjectKey];
    const targetFieldName = `target${capitalize(nameSingular)}`;

    const forwardFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier: TEST_APP_ID,
      objectUniversalIdentifier: TEST_OBJECT_UNIVERSAL_IDENTIFIER,
      name: config.fieldName,
    });

    const reverseFieldUniversalIdentifier =
      computeReverseFieldUniversalIdentifier({
        standardObjectKey: config.standardObjectKey,
        nameSingular,
      });

    objectFields.push({
      universalIdentifier: forwardFieldUniversalIdentifier,
      type: FieldMetadataType.RELATION,
      name: config.fieldName,
      label: config.label,
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
      universalSettings: { relationType: RelationType.ONE_TO_MANY },
      relationTargetFieldMetadataUniversalIdentifier:
        reverseFieldUniversalIdentifier,
      relationTargetObjectMetadataUniversalIdentifier:
        standardObject.universalIdentifier,
    });

    fields.push({
      universalIdentifier: reverseFieldUniversalIdentifier,
      type: FieldMetadataType.MORPH_RELATION,
      name: targetFieldName,
      label: capitalize(nameSingular),
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
      morphId: standardObject.morphIds.targetMorphId.morphId,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: `target${capitalize(nameSingular)}Id`,
      },
      objectUniversalIdentifier: standardObject.universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        forwardFieldUniversalIdentifier,
      relationTargetObjectMetadataUniversalIdentifier:
        TEST_OBJECT_UNIVERSAL_IDENTIFIER,
    });
  }

  return { objectFields, fields };
};

const buildManifestForNameSingular = (nameSingular: string): Manifest => {
  const { objectFields, fields } =
    buildDefaultRelationManifestFields(nameSingular);

  const objectManifest = buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    universalIdentifier: TEST_OBJECT_UNIVERSAL_IDENTIFIER,
    nameSingular,
    namePlural: `${nameSingular}s`,
    labelSingular: capitalize(nameSingular),
    labelPlural: `${capitalize(nameSingular)}s`,
    description: 'Object used to test renames with default relations',
    icon: 'IconTag',
    additionalFields: objectFields,
  });

  return buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [objectManifest], fields },
  });
};

type FetchedField = {
  id: string;
  name: string;
  universalIdentifier: string;
};

const standardObjectIdByUniversalIdentifier = new Map<string, string>();

const findStandardObjectFields = async (
  objectUniversalIdentifier: string,
): Promise<FetchedField[]> => {
  if (standardObjectIdByUniversalIdentifier.size === 0) {
    const { objects } = await findManyObjectMetadata({
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: 'id universalIdentifier',
      expectToFail: false,
    });

    for (const object of objects) {
      standardObjectIdByUniversalIdentifier.set(
        object.universalIdentifier,
        object.id,
      );
    }
  }

  const objectMetadataId = standardObjectIdByUniversalIdentifier.get(
    objectUniversalIdentifier,
  );

  expect(objectMetadataId).toBeDefined();

  const { fields } = await findManyFieldsMetadata({
    input: {
      filter: { objectMetadataId: { eq: objectMetadataId } },
      paging: { first: 1000 },
    },
    gqlFields: 'id name universalIdentifier',
    expectToFail: false,
  });

  return fields.map((edge: { node: FetchedField }) => edge.node);
};

describe('Sync application object rename with default relations', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Object Rename App',
      description: 'App for testing object rename with default relations',
      sourcePath: 'test-object-rename-default-relations',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should rename the reverse default relation fields in place when the object nameSingular changes', async () => {
    await syncApplication({
      manifest: buildManifestForNameSingular('initiative'),
      expectToFail: false,
    });

    const reverseFieldIdsBeforeRename: Record<string, string> = {};

    for (const config of DEFAULT_RELATION_CONFIGS) {
      const standardObjectFields = await findStandardObjectFields(
        STANDARD_OBJECTS[config.standardObjectKey].universalIdentifier,
      );

      const reverseField = standardObjectFields.find(
        (field) => field.name === 'targetInitiative',
      );

      expect(reverseField).toBeDefined();
      expect(reverseField?.universalIdentifier).toBe(
        computeReverseFieldUniversalIdentifier({
          standardObjectKey: config.standardObjectKey,
          nameSingular: 'initiative',
        }),
      );

      reverseFieldIdsBeforeRename[config.standardObjectKey] = reverseField!.id;
    }

    await syncApplication({
      manifest: buildManifestForNameSingular('project'),
      expectToFail: false,
    });

    for (const config of DEFAULT_RELATION_CONFIGS) {
      const standardObjectFields = await findStandardObjectFields(
        STANDARD_OBJECTS[config.standardObjectKey].universalIdentifier,
      );

      const renamedReverseField = standardObjectFields.find(
        (field) => field.name === 'targetProject',
      );

      expect(renamedReverseField).toBeDefined();
      // The same metadata id proves the reverse field was renamed in place
      // and took over the new derived identifier, not dropped and recreated.
      expect(renamedReverseField?.id).toBe(
        reverseFieldIdsBeforeRename[config.standardObjectKey],
      );
      expect(renamedReverseField?.universalIdentifier).toBe(
        computeReverseFieldUniversalIdentifier({
          standardObjectKey: config.standardObjectKey,
          nameSingular: 'project',
        }),
      );

      expect(
        standardObjectFields.find((field) => field.name === 'targetInitiative'),
      ).toBeUndefined();
    }
  }, 120000);

  it('should compute a rename plan on dry run without touching the reverse default relation fields', async () => {
    await syncApplication({
      manifest: buildManifestForNameSingular('initiative'),
      expectToFail: false,
    });

    const { data } = await syncApplication({
      manifest: buildManifestForNameSingular('project'),
      dryRun: true,
      expectToFail: false,
    });

    const actions = data?.syncApplication.actions as {
      type: string;
      metadataName: string;
    }[];

    expect(actions).toBeDefined();
    expect(
      actions.filter(
        (action) =>
          action.metadataName === 'fieldMetadata' &&
          (action.type === 'create' || action.type === 'delete'),
      ),
    ).toEqual([]);

    // The dry run must leave the installed reverse fields readable under the
    // old name so the subsequent real sync still converges.
    for (const config of DEFAULT_RELATION_CONFIGS) {
      const standardObjectFields = await findStandardObjectFields(
        STANDARD_OBJECTS[config.standardObjectKey].universalIdentifier,
      );

      expect(
        standardObjectFields.find((field) => field.name === 'targetInitiative'),
      ).toBeDefined();
    }

    await syncApplication({
      manifest: buildManifestForNameSingular('project'),
      expectToFail: false,
    });

    for (const config of DEFAULT_RELATION_CONFIGS) {
      const standardObjectFields = await findStandardObjectFields(
        STANDARD_OBJECTS[config.standardObjectKey].universalIdentifier,
      );

      expect(
        standardObjectFields.find((field) => field.name === 'targetProject'),
      ).toBeDefined();
    }
  }, 120000);
});
