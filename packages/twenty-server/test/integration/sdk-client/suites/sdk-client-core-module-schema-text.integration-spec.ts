import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { buildCommentClosingDescription } from 'test/integration/sdk-client/utils/build-comment-closing-description.util';
import { buildRelationToObjectManifest } from 'test/integration/sdk-client/utils/build-relation-to-object-manifest.util';
import { buildUniqueMetadataName } from 'test/integration/sdk-client/utils/build-unique-metadata-name.util';
import {
  createSdkClientCanaryFile,
  type SdkClientCanaryFile,
} from 'test/integration/sdk-client/utils/create-sdk-client-canary-file.util';
import { installSdkClientProbeApplication } from 'test/integration/sdk-client/utils/install-sdk-client-probe-application.util';
import { loadSdkClientCoreModule } from 'test/integration/sdk-client/utils/load-sdk-client-core-module.util';
import { syncSdkClientProbeApplication } from 'test/integration/sdk-client/utils/sync-sdk-client-probe-application.util';
import { type ObjectManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const buildProbeObjectManifest = ({
  applicationUniversalIdentifier,
  description,
  additionalFields = [],
}: {
  applicationUniversalIdentifier: string;
  description?: string;
  additionalFields?: ObjectManifest['fields'];
}) => {
  const nameSingular = buildUniqueMetadataName('sdkProbe');

  return buildDefaultObjectManifest({
    applicationUniversalIdentifier,
    nameSingular,
    namePlural: `${nameSingular}s`,
    labelSingular: nameSingular,
    labelPlural: `${nameSingular}s`,
    description,
    additionalFields,
  });
};

const createWorkspaceObject = async (description?: string) => {
  const nameSingular = buildUniqueMetadataName('sdkProbeTarget');

  const { data } = await createOneObjectMetadata({
    input: {
      nameSingular,
      namePlural: `${nameSingular}s`,
      labelSingular: nameSingular,
      labelPlural: `${nameSingular}s`,
      description,
      icon: 'IconTicket',
    },
    gqlFields: 'id universalIdentifier',
    expectToFail: false,
  });

  return data.createOneObject;
};

const expectCoreModuleWithoutMarker = async ({
  coreModuleResponse,
  applyErrors,
  marker,
}: {
  coreModuleResponse: { status: number; text: string };
  applyErrors: unknown;
  marker: string;
}) => {
  expect(applyErrors).toBeUndefined();
  expect(coreModuleResponse.status).toBe(200);
  expect(
    coreModuleResponse.text.split('\n').filter((line) => line.includes(marker)),
  ).toEqual([]);

  const coreModule = await loadSdkClientCoreModule(coreModuleResponse.text);

  expect(typeof coreModule.CoreApiClient).toBe('function');
};

describe('SDK client core module keeps schema text out of the generated code', () => {
  let canary: SdkClientCanaryFile;
  let applicationUniversalIdentifier: string;
  let workspaceObjectId: string | undefined;

  beforeEach(async () => {
    canary = await createSdkClientCanaryFile();
    applicationUniversalIdentifier = uuidv4();
    workspaceObjectId = undefined;
  });

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });

    if (isDefined(workspaceObjectId)) {
      await deleteOneObjectMetadata({
        input: { idToDelete: workspaceObjectId },
        expectToFail: false,
      });
    }

    await canary.removeCanaryFile();
  });

  it('keeps an object description synced by an application out of the module', async () => {
    const result = await syncSdkClientProbeApplication({
      applicationUniversalIdentifier,
      objects: [
        buildProbeObjectManifest({
          applicationUniversalIdentifier,
          description: buildCommentClosingDescription({
            canaryPath: canary.canaryPath,
            position: 'type',
          }),
        }),
      ],
    });

    await expectCoreModuleWithoutMarker({ ...result, marker: canary.marker });
  });

  it('keeps an object description installed from an application tarball out of the module', async () => {
    const result = await installSdkClientProbeApplication({
      applicationUniversalIdentifier,
      objects: [
        buildProbeObjectManifest({
          applicationUniversalIdentifier,
          description: buildCommentClosingDescription({
            canaryPath: canary.canaryPath,
            position: 'type',
          }),
        }),
      ],
    });

    await expectCoreModuleWithoutMarker({ ...result, marker: canary.marker });
  });

  it('keeps a field description synced by an application out of the module', async () => {
    const result = await syncSdkClientProbeApplication({
      applicationUniversalIdentifier,
      objects: [
        buildProbeObjectManifest({
          applicationUniversalIdentifier,
          additionalFields: [
            {
              universalIdentifier: uuidv4(),
              type: FieldMetadataType.TEXT,
              name: 'notes',
              label: 'Notes',
              description: buildCommentClosingDescription({
                canaryPath: canary.canaryPath,
                position: 'member',
              }),
            },
          ],
        }),
      ],
    });

    await expectCoreModuleWithoutMarker({ ...result, marker: canary.marker });
  });

  // Option labels become enum value descriptions, which the generator does not
  // render today: this guards against that changing. Labels reject commas.
  it('keeps a select option label synced by an application out of the module', async () => {
    const result = await syncSdkClientProbeApplication({
      applicationUniversalIdentifier,
      objects: [
        buildProbeObjectManifest({
          applicationUniversalIdentifier,
          additionalFields: [
            {
              universalIdentifier: uuidv4(),
              type: FieldMetadataType.SELECT,
              name: 'stage',
              label: 'Stage',
              options: [
                {
                  id: uuidv4(),
                  label: `*/import(${JSON.stringify(canary.canaryPath)})/*`,
                  value: 'OPEN',
                  position: 0,
                  color: 'green',
                },
              ],
            },
          ],
        }),
      ],
    });

    await expectCoreModuleWithoutMarker({ ...result, marker: canary.marker });
  });

  it('keeps an object description created through createOneObject out of the module', async () => {
    const workspaceObject = await createWorkspaceObject(
      buildCommentClosingDescription({
        canaryPath: canary.canaryPath,
        position: 'type',
      }),
    );

    workspaceObjectId = workspaceObject.id;

    const result = await syncSdkClientProbeApplication({
      applicationUniversalIdentifier,
      ...buildRelationToObjectManifest({
        applicationUniversalIdentifier,
        targetObjectUniversalIdentifier: workspaceObject.universalIdentifier,
      }),
    });

    await expectCoreModuleWithoutMarker({ ...result, marker: canary.marker });
  });

  it('keeps an object description changed through updateOneObject out of the module', async () => {
    const workspaceObject = await createWorkspaceObject('Shipping rockets');

    workspaceObjectId = workspaceObject.id;

    await updateOneObjectMetadata({
      input: {
        idToUpdate: workspaceObject.id,
        updatePayload: {
          description: buildCommentClosingDescription({
            canaryPath: canary.canaryPath,
            position: 'type',
          }),
        },
      },
      expectToFail: false,
    });

    const result = await syncSdkClientProbeApplication({
      applicationUniversalIdentifier,
      ...buildRelationToObjectManifest({
        applicationUniversalIdentifier,
        targetObjectUniversalIdentifier: workspaceObject.universalIdentifier,
      }),
    });

    await expectCoreModuleWithoutMarker({ ...result, marker: canary.marker });
  });

  it('keeps a field description created through createOneField out of the module', async () => {
    const workspaceObject = await createWorkspaceObject();

    workspaceObjectId = workspaceObject.id;

    await createOneFieldMetadata({
      input: {
        objectMetadataId: workspaceObject.id,
        type: FieldMetadataType.TEXT,
        name: 'notes',
        label: 'Notes',
        description: buildCommentClosingDescription({
          canaryPath: canary.canaryPath,
          position: 'member',
        }),
      },
      expectToFail: false,
    });

    const result = await syncSdkClientProbeApplication({
      applicationUniversalIdentifier,
      ...buildRelationToObjectManifest({
        applicationUniversalIdentifier,
        targetObjectUniversalIdentifier: workspaceObject.universalIdentifier,
      }),
    });

    await expectCoreModuleWithoutMarker({ ...result, marker: canary.marker });
  });

  it('generates a loadable module when a description mentions a comment terminator in prose', async () => {
    const result = await syncSdkClientProbeApplication({
      applicationUniversalIdentifier,
      objects: [
        buildProbeObjectManifest({
          applicationUniversalIdentifier,
          description: 'Files picked up by the importer, e.g. src/**/*.csv',
        }),
      ],
    });

    await expectCoreModuleWithoutMarker({ ...result, marker: canary.marker });
  });
});
