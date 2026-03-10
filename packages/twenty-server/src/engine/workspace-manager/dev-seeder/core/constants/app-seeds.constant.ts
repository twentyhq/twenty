import { type Manifest } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
  ViewKey,
} from 'twenty-shared/types';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

export type AppSeedDefinition = {
  registration: {
    universalIdentifier: string;
    name: string;
    description: string;
    sourceType: ApplicationRegistrationSourceType;
    sourcePackage?: string;
    author?: string;
  };
  manifest: Manifest;
  packageJson: { name: string; version: string };
};

// Manifests below are validated by SDK integration tests in:
//   packages/twenty-sdk/src/cli/__tests__/apps/{app}/__integration__/app-dev/expected-manifest.ts
// If an app changes, those tests fail first, prompting an update here.

const HELLO_WORLD_MANIFEST: Manifest = {
  application: {
    universalIdentifier: '6563e091-9f5b-4026-a3ea-7e3b3d09e218',
    displayName: 'Hello world',
    description: '',
    defaultRoleUniversalIdentifier: '9238bc7b-d38f-4a1c-9d19-31ab7bc67a2f',
    yarnLockChecksum: null,
    packageJsonChecksum: null,
    apiClientChecksum: null,
    preInstallLogicFunctionUniversalIdentifier:
      '1272ffdb-8e2f-492c-ab37-66c2b97e9c23',
    postInstallLogicFunctionUniversalIdentifier:
      '7a3f4684-51db-494d-833b-a747a3b90507',
  },
  objects: [
    {
      universalIdentifier: 'dfd43356-39b3-4b55-b4a7-279bec689928',
      nameSingular: 'exampleItem',
      namePlural: 'exampleItems',
      labelSingular: 'Example item',
      labelPlural: 'Example items',
      description: 'A sample custom object',
      icon: 'IconBox',
      labelIdentifierFieldMetadataUniversalIdentifier:
        'd2d7f6cd-33f6-456f-bf00-17adeca926ba',
      fields: [
        {
          universalIdentifier: 'd2d7f6cd-33f6-456f-bf00-17adeca926ba',
          type: FieldMetadataType.TEXT,
          name: 'name',
          label: 'Name',
          description: 'Name of the example item',
          icon: 'IconAbc',
        },
        {
          name: 'id',
          label: 'Id',
          description: 'Id',
          icon: 'Icon123',
          isNullable: false,
          defaultValue: 'uuid',
          type: FieldMetadataType.UUID,
          universalIdentifier: '5ba62991-6034-555c-b984-5e84897eaa9f',
        },
        {
          name: 'createdAt',
          label: 'Creation date',
          description: 'Creation date',
          icon: 'IconCalendar',
          isNullable: false,
          defaultValue: 'now',
          type: FieldMetadataType.DATE_TIME,
          universalIdentifier: '8b616045-237c-574d-8689-73f06acff8d8',
        },
        {
          name: 'updatedAt',
          label: 'Last update',
          description: 'Last time the record was changed',
          icon: 'IconCalendarClock',
          isNullable: false,
          defaultValue: 'now',
          type: FieldMetadataType.DATE_TIME,
          universalIdentifier: 'ced5587d-d9de-51bf-9ad0-74af6198fca4',
        },
        {
          name: 'deletedAt',
          label: 'Deleted at',
          description: 'Deletion date',
          icon: 'IconCalendarClock',
          isNullable: true,
          defaultValue: null,
          type: FieldMetadataType.DATE_TIME,
          universalIdentifier: '674ee694-0b0f-557f-993c-2b1404db0811',
        },
        {
          name: 'createdBy',
          label: 'Created by',
          description: 'The creator of the record',
          icon: 'IconCreativeCommonsSa',
          isNullable: false,
          defaultValue: { name: "''", source: "'MANUAL'" },
          type: FieldMetadataType.ACTOR,
          universalIdentifier: '5ed1503f-2803-59d1-9b27-e4f1701b8c2a',
        },
        {
          name: 'updatedBy',
          label: 'Updated by',
          description: 'The workspace member who last updated the record',
          icon: 'IconUserCircle',
          isNullable: false,
          defaultValue: { name: "''", source: "'MANUAL'" },
          type: FieldMetadataType.ACTOR,
          universalIdentifier: '3d3a80b4-14a0-55a0-b534-1b23f043c1d5',
        },
        {
          name: 'position',
          label: 'Position',
          description: 'Position',
          icon: 'IconHierarchy2',
          isNullable: false,
          defaultValue: 0,
          type: FieldMetadataType.POSITION,
          universalIdentifier: 'a714b336-d765-5dff-b34b-fcc6ab037e3b',
        },
        {
          name: 'searchVector',
          label: 'Search vector',
          icon: 'IconSearch',
          description: 'Search vector',
          isNullable: true,
          defaultValue: null,
          type: FieldMetadataType.TS_VECTOR,
          universalIdentifier: '068064e1-c9da-5772-9293-9e57183cee67',
        },
        {
          name: 'timelineActivities',
          label: 'Timeline Activities',
          description: 'Example items tied to the ExampleItem',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          type: FieldMetadataType.RELATION,
          universalSettings: { relationType: RelationType.ONE_TO_MANY },
          universalIdentifier: 'e5feca94-536c-5779-8c33-05e39705bcd7',
          relationTargetFieldMetadataUniversalIdentifier:
            '3d140ea1-fc57-5c8c-96fd-7d1525ed6a69',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-6736-4337-b5c4-8b39fae325a5',
        },
        {
          name: 'favorites',
          label: 'Favorites',
          description: 'Example items tied to the ExampleItem',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          type: FieldMetadataType.RELATION,
          universalSettings: { relationType: RelationType.ONE_TO_MANY },
          universalIdentifier: '3781cc69-9d3f-58d0-927c-c1c552f37a1d',
          relationTargetFieldMetadataUniversalIdentifier:
            '3043fec0-091c-59ff-95ef-b9d95fbfa3e6',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-ab56-4e05-92a3-e2414a499860',
        },
        {
          name: 'attachments',
          label: 'Attachments',
          description: 'Example items tied to the ExampleItem',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          type: FieldMetadataType.RELATION,
          universalSettings: { relationType: RelationType.ONE_TO_MANY },
          universalIdentifier: '3ad98da8-42e1-50e3-b73b-8c06fa720e2a',
          relationTargetFieldMetadataUniversalIdentifier:
            'e1232464-8f83-5459-aa94-a40cda8d949a',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-bd3d-4c60-8dca-571c71d4447a',
        },
        {
          name: 'noteTargets',
          label: 'Note Targets',
          description: 'Example items tied to the ExampleItem',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          type: FieldMetadataType.RELATION,
          universalSettings: { relationType: RelationType.ONE_TO_MANY },
          universalIdentifier: '67cae4ab-7d3d-5a66-8d06-ca24568ebe76',
          relationTargetFieldMetadataUniversalIdentifier:
            '9eeb7b0d-37e4-5a93-97c9-3dbb77fdb318',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-fff0-4b44-be82-bda313884400',
        },
        {
          name: 'taskTargets',
          label: 'Task Targets',
          description: 'Example items tied to the ExampleItem',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          type: FieldMetadataType.RELATION,
          universalSettings: { relationType: RelationType.ONE_TO_MANY },
          universalIdentifier: 'a3b9f10c-f780-58cc-bbc9-402ed5f136f6',
          relationTargetFieldMetadataUniversalIdentifier:
            '5d46d303-452d-5c9c-ab64-0a9768b87956',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-5a9a-44e8-95df-771cd06d0fb1',
        },
      ],
    },
  ],
  fields: [
    {
      objectUniversalIdentifier: 'dfd43356-39b3-4b55-b4a7-279bec689928',
      universalIdentifier: '770d32c2-cf12-4ab2-b66d-73f92dc239b5',
      type: FieldMetadataType.NUMBER,
      name: 'priority',
      label: 'Priority',
      description: 'Priority level for the example item (1-10)',
    },
    {
      name: 'targetExampleItem',
      label: 'ExampleItem',
      description: 'ExampleItem Example item',
      icon: 'IconTimelineEvent',
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetExampleItemId',
      },
      universalIdentifier: '3d140ea1-fc57-5c8c-96fd-7d1525ed6a69',
      objectUniversalIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
      relationTargetFieldMetadataUniversalIdentifier:
        'e5feca94-536c-5779-8c33-05e39705bcd7',
      relationTargetObjectMetadataUniversalIdentifier:
        'dfd43356-39b3-4b55-b4a7-279bec689928',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
    },
    {
      name: 'targetExampleItem',
      label: 'ExampleItem',
      description: 'ExampleItem Example item',
      icon: 'IconHeart',
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetExampleItemId',
      },
      universalIdentifier: '3043fec0-091c-59ff-95ef-b9d95fbfa3e6',
      objectUniversalIdentifier: '20202020-ab56-4e05-92a3-e2414a499860',
      relationTargetFieldMetadataUniversalIdentifier:
        '3781cc69-9d3f-58d0-927c-c1c552f37a1d',
      relationTargetObjectMetadataUniversalIdentifier:
        'dfd43356-39b3-4b55-b4a7-279bec689928',
      type: FieldMetadataType.RELATION,
    },
    {
      name: 'targetExampleItem',
      label: 'ExampleItem',
      description: 'ExampleItem Example item',
      icon: 'IconFileImport',
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetExampleItemId',
      },
      universalIdentifier: 'e1232464-8f83-5459-aa94-a40cda8d949a',
      objectUniversalIdentifier: '20202020-bd3d-4c60-8dca-571c71d4447a',
      relationTargetFieldMetadataUniversalIdentifier:
        '3ad98da8-42e1-50e3-b73b-8c06fa720e2a',
      relationTargetObjectMetadataUniversalIdentifier:
        'dfd43356-39b3-4b55-b4a7-279bec689928',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: '20202020-f634-435d-ab8d-e1168b375c69',
    },
    {
      name: 'targetExampleItem',
      label: 'ExampleItem',
      description: 'ExampleItem Example item',
      icon: 'IconCheckbox',
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetExampleItemId',
      },
      universalIdentifier: '9eeb7b0d-37e4-5a93-97c9-3dbb77fdb318',
      objectUniversalIdentifier: '20202020-fff0-4b44-be82-bda313884400',
      relationTargetFieldMetadataUniversalIdentifier:
        '67cae4ab-7d3d-5a66-8d06-ca24568ebe76',
      relationTargetObjectMetadataUniversalIdentifier:
        'dfd43356-39b3-4b55-b4a7-279bec689928',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: '20202020-f635-435d-ab8d-e1168b375c70',
    },
    {
      name: 'targetExampleItem',
      label: 'ExampleItem',
      description: 'ExampleItem Example item',
      icon: 'IconCheckbox',
      isNullable: true,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetExampleItemId',
      },
      universalIdentifier: '5d46d303-452d-5c9c-ab64-0a9768b87956',
      objectUniversalIdentifier: '20202020-5a9a-44e8-95df-771cd06d0fb1',
      relationTargetFieldMetadataUniversalIdentifier:
        'a3b9f10c-f780-58cc-bbc9-402ed5f136f6',
      relationTargetObjectMetadataUniversalIdentifier:
        'dfd43356-39b3-4b55-b4a7-279bec689928',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: '20202020-f636-435d-ab8d-e1168b375c71',
    },
  ],
  roles: [
    {
      universalIdentifier: '9238bc7b-d38f-4a1c-9d19-31ab7bc67a2f',
      label: 'Hello world default function role',
      description: 'Hello world default function role',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: false,
    },
  ],
  skills: [
    {
      universalIdentifier: 'd0940029-9d3c-40be-903a-52d65393028f',
      name: 'example-skill',
      label: 'Example Skill',
      description: 'A sample skill for your application',
      icon: 'IconBrain',
      content:
        'Add your skill instructions here. Skills provide context and capabilities to AI agents.',
    },
  ],
  agents: [],
  logicFunctions: [
    {
      universalIdentifier: '2baa26eb-9aaf-4856-a4f4-30d6fd6480ee',
      name: 'hello-world-logic-function',
      description: 'A simple logic function',
      timeoutSeconds: 5,
      httpRouteTriggerSettings: {
        path: '/hello-world-logic-function',
        httpMethod: 'GET',
        isAuthRequired: false,
      },
      toolInputSchema: { type: 'object', properties: {} },
      handlerName: 'default.config.handler',
      sourceHandlerPath: 'src/logic-functions/hello-world.ts',
      builtHandlerPath: 'src/logic-functions/hello-world.mjs',
      builtHandlerChecksum: null,
    },
    {
      universalIdentifier: '7a3f4684-51db-494d-833b-a747a3b90507',
      name: 'post-install',
      description: 'Runs after installation to set up the application.',
      timeoutSeconds: 300,
      toolInputSchema: { type: 'object', properties: {} },
      handlerName: 'default.config.handler',
      sourceHandlerPath: 'src/logic-functions/post-install.ts',
      builtHandlerPath: 'src/logic-functions/post-install.mjs',
      builtHandlerChecksum: null,
    },
    {
      universalIdentifier: '1272ffdb-8e2f-492c-ab37-66c2b97e9c23',
      name: 'pre-install',
      description: 'Runs before installation to prepare the application.',
      timeoutSeconds: 300,
      toolInputSchema: { type: 'object', properties: {} },
      handlerName: 'default.config.handler',
      sourceHandlerPath: 'src/logic-functions/pre-install.ts',
      builtHandlerPath: 'src/logic-functions/pre-install.mjs',
      builtHandlerChecksum: null,
    },
  ],
  frontComponents: [],
  publicAssets: [],
  views: [
    {
      universalIdentifier: 'e004df40-29f3-47ba-b39d-d3a5c444367a',
      name: 'All example items',
      objectUniversalIdentifier: 'dfd43356-39b3-4b55-b4a7-279bec689928',
      icon: 'IconList',
      key: ViewKey.INDEX,
      position: 0,
      fields: [
        {
          universalIdentifier: '496c40c2-5766-419c-93bf-20fdad3f34bb',
          fieldMetadataUniversalIdentifier:
            'd2d7f6cd-33f6-456f-bf00-17adeca926ba',
          position: 0,
          isVisible: true,
          size: 200,
        },
      ],
    },
  ],
  navigationMenuItems: [
    {
      universalIdentifier: '10f90627-e9c2-44b7-9742-bed77e3d1b17',
      name: 'example-navigation-menu-item',
      icon: 'IconList',
      color: 'blue',
      position: 0,
      viewUniversalIdentifier: 'e004df40-29f3-47ba-b39d-d3a5c444367a',
    },
  ],
  pageLayouts: [],
};

const POSTCARD_APP_MANIFEST: Manifest = {
  application: {
    universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
    displayName: 'Rich App',
    description: 'A simple rich app',
    defaultRoleUniversalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
    yarnLockChecksum: null,
    packageJsonChecksum: null,
    apiClientChecksum: null,
    icon: 'IconWorld',
  },
  objects: [],
  fields: [],
  roles: [],
  skills: [],
  agents: [],
  logicFunctions: [],
  frontComponents: [],
  publicAssets: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
};

const MINIMAL_APP_MANIFEST: Manifest = {
  application: {
    universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000001',
    displayName: 'Root App',
    description: 'An app with all entities at root level',
    icon: 'IconFolder',
    defaultRoleUniversalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000002',
    yarnLockChecksum: null,
    packageJsonChecksum: null,
    apiClientChecksum: null,
  },
  objects: [],
  fields: [],
  roles: [],
  skills: [],
  agents: [],
  logicFunctions: [],
  frontComponents: [],
  publicAssets: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
};

export const APP_SEEDS: AppSeedDefinition[] = [
  {
    registration: {
      universalIdentifier: '6563e091-9f5b-4026-a3ea-7e3b3d09e218',
      name: 'Hello World',
      description: 'A sample marketplace app installed via NPM',
      sourceType: ApplicationRegistrationSourceType.NPM,
      sourcePackage: 'hello-world',
      author: 'Twenty',
    },
    manifest: HELLO_WORLD_MANIFEST,
    packageJson: { name: 'hello-world', version: '0.1.0' },
  },
  {
    registration: {
      universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
      name: 'Postcard App',
      description: 'An internal app installed as tarball',
      sourceType: ApplicationRegistrationSourceType.TARBALL,
      author: 'Twenty',
    },
    manifest: POSTCARD_APP_MANIFEST,
    packageJson: { name: 'postcard-app', version: '0.1.0' },
  },
  {
    registration: {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000001',
      name: 'Minimal App',
      description: 'A dev-mode app running locally',
      sourceType: ApplicationRegistrationSourceType.LOCAL,
    },
    manifest: MINIMAL_APP_MANIFEST,
    packageJson: { name: 'minimal-app', version: '0.1.0' },
  },
];
