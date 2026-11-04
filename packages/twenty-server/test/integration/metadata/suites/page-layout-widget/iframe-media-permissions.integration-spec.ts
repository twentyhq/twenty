import gql from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  type IframeMediaPermission,
  PageLayoutTabLayoutMode,
  WidgetType,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const OWNER_APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const WIDGET_UNIVERSAL_IDENTIFIER = uuidv4();
const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER = uuidv4();
const COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER = uuidv4();
const OWNER_APPLICATION_NAME = 'Widget Phone';
const ORIGIN = 'https://phone.example.com';
const MICROPHONE_PERMISSION = {
  origin: ORIGIN,
  microphone: true,
  camera: false,
};
const CAMERA_PERMISSION = {
  origin: ORIGIN,
  microphone: false,
  camera: true,
};

const createApplication = async ({
  applicationUniversalIdentifier,
  name,
  permissions,
  widgets,
  frontComponents = [],
  commandMenuItems = [],
}: {
  applicationUniversalIdentifier: string;
  name: string;
  permissions: IframeMediaPermission[];
  widgets: Manifest['pageLayoutWidgets'];
  frontComponents?: Manifest['frontComponents'];
  commandMenuItems?: Manifest['commandMenuItems'];
}): Promise<string> => {
  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: 'Application for iframe widget media permission checks',
    sourcePath: `iframe-widget-${applicationUniversalIdentifier}`,
  });

  jest.useRealTimers();

  const manifest = buildBaseManifest({
    appId: applicationUniversalIdentifier,
    roleId: uuidv4(),
  });

  for (const frontComponent of frontComponents) {
    await uploadApplicationFile({
      applicationUniversalIdentifier,
      fileFolder: 'BuiltFrontComponent',
      filePath: frontComponent.builtComponentPath,
      fileBuffer: Buffer.from('built phone component'),
      filename: 'Phone.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });
  }

  jest.useFakeTimers();

  await syncApplication({
    manifest: {
      ...manifest,
      application: {
        ...manifest.application,
        displayName: name,
        requestedIframeMediaPermissions: permissions,
      },
      roles: manifest.roles.map((role) => ({
        ...role,
        label: `Iframe Widget Role ${applicationUniversalIdentifier}`,
      })),
      pageLayoutWidgets: widgets,
      frontComponents,
      commandMenuItems,
    },
    expectToFail: false,
  });

  const { data } = await findOneApplication({
    input: { universalIdentifier: applicationUniversalIdentifier },
    gqlFields: 'id',
    expectToFail: false,
  });

  return data.findOneApplication.id;
};

describe('Iframe application media permissions', () => {
  let widgetId: string;
  let commandMenuItemId: string;
  let ownerApplicationToken: string;
  let otherApplicationToken: string;

  beforeAll(async () => {
    const ownerApplicationId = await createApplication({
      applicationUniversalIdentifier: OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
      name: OWNER_APPLICATION_NAME,
      permissions: [MICROPHONE_PERMISSION],
      frontComponents: [
        {
          universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          name: 'Phone',
          componentName: 'Phone',
          sourceComponentPath: 'src/front-components/Phone.tsx',
          builtComponentPath: 'src/front-components/Phone.mjs',
          builtComponentChecksum: 'phone-component-checksum',
        },
      ],
      commandMenuItems: [
        {
          universalIdentifier: COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
          label: 'Open Phone',
          frontComponentUniversalIdentifier:
            FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        },
      ],
      widgets: [
        {
          universalIdentifier: WIDGET_UNIVERSAL_IDENTIFIER,
          pageLayoutTabUniversalIdentifier:
            STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs
              .home.universalIdentifier,
          title: 'Phone',
          type: WidgetType.IFRAME,
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 1000,
          },
          configuration: { configurationType: 'IFRAME', url: ORIGIN },
        },
      ],
    });
    const otherApplicationId = await createApplication({
      applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Other Video App',
      permissions: [CAMERA_PERMISSION],
      widgets: [],
    });

    const [widget] = await globalThis.testDataSource.query<{ id: string }[]>(
      `SELECT id FROM core."pageLayoutWidget"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [WIDGET_UNIVERSAL_IDENTIFIER, SEED_APPLE_WORKSPACE_ID],
    );

    assertIsDefinedOrThrow(widget);
    widgetId = widget.id;

    const [commandMenuItem] = await globalThis.testDataSource.query<
      { id: string }[]
    >(
      `SELECT id FROM core."commandMenuItem"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER, SEED_APPLE_WORKSPACE_ID],
    );

    assertIsDefinedOrThrow(commandMenuItem);
    commandMenuItemId = commandMenuItem.id;

    const ownerTokenPair = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: ownerApplicationId,
    });
    const otherTokenPair = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: otherApplicationId,
    });

    ownerApplicationToken = ownerTokenPair.applicationAccessToken.token;
    otherApplicationToken = otherTokenPair.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    for (const applicationUniversalIdentifier of [
      OWNER_APPLICATION_UNIVERSAL_IDENTIFIER,
      OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
    ]) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  });

  const readWidgetPermissions = (token: string) =>
    makeMetadataApiRequest(
      {
        query: gql`
          query GetIframeWidgetApplicationPermissions($id: String!) {
            getPageLayoutWidget(id: $id) {
              applicationName
              applicationGrantedIframeMediaPermissions {
                origin
                microphone
                camera
              }
            }
          }
        `,
        variables: { id: widgetId },
      },
      token,
    );

  const readFrontComponentPermissions = (token: string) =>
    makeMetadataApiRequest(
      {
        query: gql`
          query GetCommandFrontComponentApplicationPermissions($id: UUID!) {
            commandMenuItem(id: $id) {
              frontComponent {
                applicationGrantedIframeMediaPermissions {
                  origin
                  microphone
                  camera
                }
              }
            }
          }
        `,
        variables: { id: commandMenuItemId },
      },
      token,
    );

  it('lets ordinary workspace members read the owning app grants', async () => {
    const response = await readWidgetPermissions(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getPageLayoutWidget).toEqual({
      applicationName: OWNER_APPLICATION_NAME,
      applicationGrantedIframeMediaPermissions: [MICROPHONE_PERMISSION],
    });

    const commandResponse = await readFrontComponentPermissions(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(commandResponse.body.errors).toBeUndefined();
    expect(commandResponse.body.data.commandMenuItem.frontComponent).toEqual({
      applicationGrantedIframeMediaPermissions: [MICROPHONE_PERMISSION],
    });
  });

  it('lets the owning application read its grants without borrowing another app capabilities', async () => {
    const response = await readWidgetPermissions(ownerApplicationToken);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getPageLayoutWidget).toEqual({
      applicationName: OWNER_APPLICATION_NAME,
      applicationGrantedIframeMediaPermissions: [MICROPHONE_PERMISSION],
    });

    const commandResponse = await readFrontComponentPermissions(
      ownerApplicationToken,
    );

    expect(commandResponse.body.errors).toBeUndefined();
    expect(commandResponse.body.data.commandMenuItem.frontComponent).toEqual({
      applicationGrantedIframeMediaPermissions: [MICROPHONE_PERMISSION],
    });
  });

  it('omits owner details and grants for an unrelated application principal', async () => {
    const response = await readWidgetPermissions(otherApplicationToken);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getPageLayoutWidget).toEqual({
      applicationName: null,
      applicationGrantedIframeMediaPermissions: [],
    });

    const commandResponse = await readFrontComponentPermissions(
      otherApplicationToken,
    );

    expect(commandResponse.body.errors).toBeUndefined();
    expect(commandResponse.body.data.commandMenuItem.frontComponent).toEqual({
      applicationGrantedIframeMediaPermissions: [],
    });
  });
});
