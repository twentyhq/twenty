import type { EditorFile } from '../types/editor-data.types';

const schemaIdentifiersSource = `export const SCHEMA_IDS = {
  rocket: {
    object: '733956fd-c19c-4a13-a6c2-e92d6e28bcb9',
    fields: {
      name: '0c69e10f-77c5-4e47-ad62-53445ff3bf9c',
      serialNumber: '1f381732-1c7b-4939-a54d-b6a4ff7366d2',
      manufacturer: 'fdbfddab-6424-4726-8eaa-5f853c401939',
      status: 'f333e670-fbde-494d-a46b-a37bff24b37d',
      reusable: 'aed92b19-1f0c-4812-8d40-e18e2866b719',
      launchDate: 'fcc6d872-82ca-4d99-bd1d-659d1b3ad46c',
      heightMeters: '24670e09-3e4d-4b38-bbfa-4a4316f4ecfe',
      massKg: 'b6a019de-df55-4210-9445-d83df1f70f86',
      targetOrbit: 'dcd879a5-bc60-4225-85e1-0085ccab1b0d',
      launches: '5b877c2a-d10b-49e8-9c30-b9202401ec35',
    },
    views: {
      index: '4587a1a3-0c5f-4f60-9996-d77a7233ce26',
    },
    commandMenuItems: {
      flyAgain: '2a3c2b88-20ad-4ff6-9c4f-52f2e2f1d801',
      scheduleLaunch: 'cfcb4a13-9a9c-4b20-9c58-1a87e7a63c62',
      retireRocket: '36c54890-6a9d-4c79-95c1-3b9b3d33ea33',
    },
  },
  launch: {
    object: 'e7f1e750-5883-4e71-8b22-1c5258d8faa7',
    fields: {
      name: '92bc09d1-5712-4877-aa6d-7b5900267935',
      missionCode: 'cc2e7d7a-93e5-4369-9682-7bf8134a01e9',
      status: '68af6212-15fe-427d-bfa3-19a4a7ab48c2',
      missionType: 'd5f816a5-456e-41c3-b7b3-f3259703146b',
      plannedLaunchAt: '382820f2-8f47-4b3b-a34a-83d1d707a350',
      actualLaunchAt: '2a255cee-419b-4151-b8bd-3e11a2c6c2b2',
      summary: '22175eb0-44b0-493b-ad1e-f2c545e60c3d',
      rocket: '42c9106f-41e1-467a-bb00-c4442f4541f8',
      launchSite: '92221a22-9356-485d-ace0-f682f38ae6fe',
      payloads: '902c5fc3-1d22-4593-8e23-ea23cab36d20',
    },
    views: {
      index: '92f768d9-e6c1-4070-b0c8-799204872a00',
      upcoming: 'd62590d5-aa52-4d77-bca7-225453ed659f',
      past: 'f3ede3df-04eb-45a8-991e-a8b324bbbb16',
    },
    commandMenuItems: {
      rescheduleLaunch: '16a67c2f-0ed1-4d4b-b40e-0c5d0c0d40a1',
      addPayload: 'cb0f2af2-5c9d-4f9b-8a12-3cafecdde7a1',
      upcomingLaunches: 'c4c3a0dd-2d7c-4fc6-a2f7-eb6a89fc8d01',
    },
  },
  payload: {
    object: '16ffcc45-b097-4031-a768-ec62a23dd8d3',
    fields: {
      name: '5018c89c-80e1-452b-9e0f-0eda5351c972',
      payloadType: '0ee139c4-b701-49f8-9f58-5e79fc1a08bd',
      status: '2ea1b614-9aa3-41ce-b253-97919f9544ee',
      massKg: 'd2a52145-f3d1-4657-9734-b96e965408a3',
      customer: 'd84468aa-5b75-4ae4-836e-7fff0ce58c91',
      launch: 'eb65b7f1-0780-4a9b-9fcc-528675ef0967',
    },
    commandMenuItems: {
      bookSlot: '01c44f8c-15db-40e7-8b57-7d7d0f9f2fa0',
      setPayloadStatus: '8f7cd03b-3fd6-4c65-b0c4-2ec0a4a42a5e',
    },
  },
  company: {
    commandMenuItems: {
      setCustomerStatus: '2a4fa56d-5d8a-4e55-8c1e-27e8fc6f1d63',
    },
  },
  launchSite: {
    object: '2f18d525-0068-4d13-a26d-96eb31ed7646',
    fields: {
      name: 'ad99750c-c083-4cb6-8985-0b0e768dcced',
      siteCode: '97bebd5b-2bd2-4ff3-a7df-c753f68db1aa',
      siteStatus: '1031ca3c-c12a-463c-b522-4547d06c0cc0',
      launches: 'b94b7f00-a5ef-4179-982b-1ea68f94ecff',
    },
    commandMenuItems: {
      setSiteStatus: '77e56e08-fb0a-4d4a-b9b2-9a3e5b8af1b6',
      bookWindow: 'b11a9c20-0bcb-4f73-9ef9-6e80d39b8c7e',
      launchesFromSite: 'a5ce6cd9-1a45-4a7f-9a61-0a0a6ef1cf4a',
    },
  },
} as const;
`;

const rocketObjectSource = `import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

enum RocketStatus {
  Planned = 'PLANNED',
  Active = 'ACTIVE',
  Retired = 'RETIRED',
  Lost = 'LOST',
}

export default defineObject({
  universalIdentifier: SCHEMA_IDS.rocket.object,
  nameSingular: 'rocket',
  namePlural: 'rockets',
  labelSingular: 'Rocket',
  labelPlural: 'Rockets',
  description: 'Tracks rockets, their launch profile, and operating status.',
  icon: 'IconRocket',
  isSearchable: true,
  labelIdentifierFieldMetadataUniversalIdentifier:
    SCHEMA_IDS.rocket.fields.name,
  fields: [
    {
      universalIdentifier: SCHEMA_IDS.rocket.fields.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconRocket',
      isNullable: false,
    },
    {
      universalIdentifier: SCHEMA_IDS.rocket.fields.serialNumber,
      type: FieldType.TEXT,
      name: 'serialNumber',
      label: 'Serial Number',
      icon: 'IconHash',
      isNullable: false,
      isUnique: true,
    },
    {
      universalIdentifier: SCHEMA_IDS.rocket.fields.status,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconFlag',
      isNullable: false,
      options: [
        { label: 'Planned', value: RocketStatus.Planned, color: 'sky' },
        { label: 'Active', value: RocketStatus.Active, color: 'green' },
        { label: 'Retired', value: RocketStatus.Retired, color: 'gray' },
        { label: 'Lost', value: RocketStatus.Lost, color: 'red' },
      ],
    },
    {
      universalIdentifier: SCHEMA_IDS.rocket.fields.launches,
      type: FieldType.RELATION,
      name: 'launches',
      label: 'Launches',
      icon: 'IconRocket',
      isNullable: true,
      relationTargetFieldMetadataUniversalIdentifier:
        SCHEMA_IDS.launch.fields.rocket,
      relationTargetObjectMetadataUniversalIdentifier:
        SCHEMA_IDS.launch.object,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
  ],
});
`;

const launchObjectSource = `import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

enum LaunchStatus {
  Draft = 'DRAFT',
  Scheduled = 'SCHEDULED',
  Scrubbed = 'SCRUBBED',
  Launched = 'LAUNCHED',
  Success = 'SUCCESS',
  Failure = 'FAILURE',
}

enum MissionType {
  Commercial = 'COMMERCIAL',
  Crewed = 'CREWED',
  Cargo = 'CARGO',
  Test = 'TEST',
}

export default defineObject({
  universalIdentifier: SCHEMA_IDS.launch.object,
  nameSingular: 'launch',
  namePlural: 'launches',
  labelSingular: 'Launch',
  labelPlural: 'Launches',
  description: 'Tracks planned and completed launch missions.',
  icon: 'IconRocket',
  fields: [
    {
      universalIdentifier: SCHEMA_IDS.launch.fields.missionCode,
      type: FieldType.TEXT,
      name: 'missionCode',
      label: 'Mission Code',
      isUnique: true,
    },
    {
      universalIdentifier: SCHEMA_IDS.launch.fields.status,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      options: [
        { label: 'Scheduled', value: LaunchStatus.Scheduled, color: 'sky' },
        { label: 'Success', value: LaunchStatus.Success, color: 'green' },
        { label: 'Failure', value: LaunchStatus.Failure, color: 'red' },
      ],
    },
    {
      universalIdentifier: SCHEMA_IDS.launch.fields.plannedLaunchAt,
      type: FieldType.DATE_TIME,
      name: 'plannedLaunchAt',
      label: 'Planned Launch',
    },
    {
      universalIdentifier: SCHEMA_IDS.launch.fields.rocket,
      type: FieldType.RELATION,
      name: 'rocket',
      label: 'Rocket',
      relationTargetFieldMetadataUniversalIdentifier:
        SCHEMA_IDS.rocket.fields.launches,
      relationTargetObjectMetadataUniversalIdentifier: SCHEMA_IDS.rocket.object,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'rocketId',
      },
    },
    {
      universalIdentifier: SCHEMA_IDS.launch.fields.launchSite,
      type: FieldType.RELATION,
      name: 'launchSite',
      label: 'Launch site',
      relationTargetFieldMetadataUniversalIdentifier:
        SCHEMA_IDS.launchSite.fields.launches,
      relationTargetObjectMetadataUniversalIdentifier:
        SCHEMA_IDS.launchSite.object,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'launchSiteId',
      },
    },
    {
      universalIdentifier: SCHEMA_IDS.launch.fields.payloads,
      type: FieldType.RELATION,
      name: 'payloads',
      label: 'Payloads',
      relationTargetObjectMetadataUniversalIdentifier:
        SCHEMA_IDS.payload.object,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
  ],
});
`;

const payloadObjectSource = `import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

enum PayloadType {
  Satellite = 'SATELLITE',
  CrewCapsule = 'CREW_CAPSULE',
  Cargo = 'CARGO',
  Probe = 'PROBE',
}

enum PayloadStatus {
  Manifested = 'MANIFESTED',
  Integrated = 'INTEGRATED',
  Launched = 'LAUNCHED',
  Lost = 'LOST',
}

export default defineObject({
  universalIdentifier: SCHEMA_IDS.payload.object,
  nameSingular: 'payload',
  namePlural: 'payloads',
  labelSingular: 'Payload',
  labelPlural: 'Payloads',
  description: 'Tracks payload manifests and customer bookings.',
  icon: 'IconBox',
  fields: [
    {
      universalIdentifier: SCHEMA_IDS.payload.fields.payloadType,
      type: FieldType.SELECT,
      name: 'payloadType',
      label: 'Payload Type',
      options: [
        { label: 'Satellite', value: PayloadType.Satellite, color: 'blue' },
        { label: 'Crew Capsule', value: PayloadType.CrewCapsule, color: 'purple' },
        { label: 'Cargo', value: PayloadType.Cargo, color: 'orange' },
        { label: 'Probe', value: PayloadType.Probe, color: 'turquoise' },
      ],
    },
    {
      universalIdentifier: SCHEMA_IDS.payload.fields.status,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      options: [
        { label: 'Manifested', value: PayloadStatus.Manifested, color: 'sky' },
        { label: 'Integrated', value: PayloadStatus.Integrated, color: 'blue' },
        { label: 'Launched', value: PayloadStatus.Launched, color: 'green' },
        { label: 'Lost', value: PayloadStatus.Lost, color: 'red' },
      ],
    },
    {
      universalIdentifier: SCHEMA_IDS.payload.fields.massKg,
      type: FieldType.NUMBER,
      name: 'massKg',
      label: 'Mass (kg)',
    },
    {
      // customer is a relation to the standard Companies object (no new
      // Customer object — we reuse what ships with Twenty).
      universalIdentifier: SCHEMA_IDS.payload.fields.customer,
      type: FieldType.RELATION,
      name: 'customer',
      label: 'Customer',
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT.company.universalIdentifier,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'companyId',
      },
    },
    {
      universalIdentifier: SCHEMA_IDS.payload.fields.launch,
      type: FieldType.RELATION,
      name: 'launch',
      label: 'Launch',
      relationTargetObjectMetadataUniversalIdentifier: SCHEMA_IDS.launch.object,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'launchId',
      },
    },
  ],
});
`;

const launchSiteObjectSource = `import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

enum LaunchSiteStatus {
  Active = 'ACTIVE',
  Standby = 'STANDBY',
  Maintenance = 'MAINTENANCE',
  Retired = 'RETIRED',
}

export default defineObject({
  universalIdentifier: SCHEMA_IDS.launchSite.object,
  nameSingular: 'launchSite',
  namePlural: 'launchSites',
  labelSingular: 'Launch site',
  labelPlural: 'Launch sites',
  description: 'Tracks launch pads, regions, and site readiness.',
  icon: 'IconMapPin',
  fields: [
    {
      universalIdentifier: SCHEMA_IDS.launchSite.fields.siteCode,
      type: FieldType.TEXT,
      name: 'siteCode',
      label: 'Site Code',
      isUnique: true,
    },
    {
      universalIdentifier: SCHEMA_IDS.launchSite.fields.siteStatus,
      type: FieldType.SELECT,
      name: 'siteStatus',
      label: 'Site Status',
      options: [
        { label: 'Active', value: LaunchSiteStatus.Active, color: 'green' },
        { label: 'Standby', value: LaunchSiteStatus.Standby, color: 'sky' },
        { label: 'Retired', value: LaunchSiteStatus.Retired, color: 'gray' },
      ],
    },
    {
      universalIdentifier: SCHEMA_IDS.launchSite.fields.launches,
      type: FieldType.RELATION,
      name: 'launches',
      label: 'Launches',
      relationTargetFieldMetadataUniversalIdentifier:
        SCHEMA_IDS.launch.fields.launchSite,
      relationTargetObjectMetadataUniversalIdentifier: SCHEMA_IDS.launch.object,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
  ],
});
`;

const launchesViewSource = `import { defineView, ViewKey } from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineView({
  universalIdentifier: SCHEMA_IDS.launch.views.index,
  name: 'Launches',
  objectUniversalIdentifier: SCHEMA_IDS.launch.object,
  icon: 'IconRocket',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.launch.fields.name,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.launch.fields.missionCode,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.launch.fields.status,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.launch.fields.rocket,
      position: 3,
      isVisible: true,
      size: 180,
    },
  ],
});
`;

const upcomingLaunchesViewSource = `import {
  defineView,
  ViewFilterOperand,
  ViewType,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineView({
  universalIdentifier: SCHEMA_IDS.launch.views.upcoming,
  name: 'Upcoming launches',
  objectUniversalIdentifier: SCHEMA_IDS.launch.object,
  icon: 'IconCalendarEvent',
  type: ViewType.TABLE,
  position: 1,
  filters: [
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.launch.fields.plannedLaunchAt,
      operand: ViewFilterOperand.IS_IN_FUTURE,
      value: {},
    },
  ],
});
`;

const launchesNavItemSource = `import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: SCHEMA_IDS.launch.navigationMenuItems.index,
  name: 'Launches',
  icon: 'IconRocket',
  color: 'orange',
  position: 10,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SCHEMA_IDS.launch.views.index,
});
`;

const upcomingLaunchesNavItemSource = `import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: SCHEMA_IDS.launch.navigationMenuItems.upcoming,
  name: 'Upcoming launches',
  icon: 'IconCalendarEvent',
  color: 'sky',
  position: 11,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SCHEMA_IDS.launch.views.upcoming,
});
`;

const pastLaunchesNavItemSource = `import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: SCHEMA_IDS.launch.navigationMenuItems.past,
  name: 'Past launches',
  icon: 'IconHistory',
  color: 'gray',
  position: 12,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SCHEMA_IDS.launch.views.past,
});
`;

const rocketsNavItemSource = `import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: SCHEMA_IDS.rocket.navigationMenuItems.index,
  name: 'Rockets',
  icon: 'IconRocket',
  color: 'orange',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SCHEMA_IDS.rocket.views.index,
});
`;

const payloadsNavItemSource = `import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: SCHEMA_IDS.payload.navigationMenuItems.index,
  name: 'Payloads',
  icon: 'IconSatellite',
  color: 'purple',
  position: 20,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SCHEMA_IDS.payload.views.index,
});
`;

const launchSitesNavItemSource = `import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: SCHEMA_IDS.launchSite.navigationMenuItems.index,
  name: 'Launch sites',
  icon: 'IconMapPin',
  color: 'red',
  position: 40,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SCHEMA_IDS.launchSite.views.index,
});
`;

const rocketsViewSource = `import { defineView, ViewKey } from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineView({
  universalIdentifier: SCHEMA_IDS.rocket.views.index,
  name: 'All rockets',
  objectUniversalIdentifier: SCHEMA_IDS.rocket.object,
  icon: 'IconRocket',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.rocket.fields.name,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.rocket.fields.serialNumber,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.rocket.fields.status,
      position: 2,
      isVisible: true,
      size: 140,
    },
  ],
});
`;

const payloadsViewSource = `import { defineView, ViewKey } from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineView({
  universalIdentifier: SCHEMA_IDS.payload.views.index,
  name: 'Payloads',
  objectUniversalIdentifier: SCHEMA_IDS.payload.object,
  icon: 'IconSatellite',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.payload.fields.name,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.payload.fields.payloadType,
      position: 1,
      isVisible: true,
      size: 170,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.payload.fields.status,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.payload.fields.customer,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.payload.fields.launch,
      position: 4,
      isVisible: true,
      size: 180,
    },
  ],
});
`;

const launchSitesViewSource = `import { defineView, ViewKey } from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineView({
  universalIdentifier: SCHEMA_IDS.launchSite.views.index,
  name: 'Launch sites',
  objectUniversalIdentifier: SCHEMA_IDS.launchSite.object,
  icon: 'IconMapPin',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.launchSite.fields.name,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.launchSite.fields.siteCode,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.launchSite.fields.siteStatus,
      position: 2,
      isVisible: true,
      size: 150,
    },
  ],
});
`;

const pastLaunchesViewSource = `import {
  defineView,
  ViewFilterOperand,
  ViewType,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineView({
  universalIdentifier: SCHEMA_IDS.launch.views.past,
  name: 'Past launches',
  objectUniversalIdentifier: SCHEMA_IDS.launch.object,
  icon: 'IconHistory',
  type: ViewType.TABLE,
  position: 2,
  filters: [
    {
      fieldMetadataUniversalIdentifier: SCHEMA_IDS.launch.fields.plannedLaunchAt,
      operand: ViewFilterOperand.IS_IN_PAST,
      value: {},
    },
  ],
});
`;

const flyAgainCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.rocket.commandMenuItems.flyAgain,
  label: 'Fly again',
  icon: 'IconRepeat',
  isPinned: true,
  position: 0,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.rocket.object,
  action: {
    // Re-fly a reusable rocket: create a new launch record pre-linked to
    // this rocket so the operator only has to pick mission details.
    type: CommandMenuItemActionType.CREATE_RELATED_RECORD,
    relationFieldMetadataUniversalIdentifier:
      SCHEMA_IDS.rocket.fields.launches,
    targetObjectMetadataUniversalIdentifier: SCHEMA_IDS.launch.object,
  },
});
`;

const scheduleLaunchFromRocketCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.rocket.commandMenuItems.scheduleLaunch,
  label: 'Schedule launch',
  icon: 'IconCalendarPlus',
  isPinned: true,
  position: 1,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.rocket.object,
  action: {
    type: CommandMenuItemActionType.CREATE_RELATED_RECORD,
    relationFieldMetadataUniversalIdentifier:
      SCHEMA_IDS.rocket.fields.launches,
    targetObjectMetadataUniversalIdentifier: SCHEMA_IDS.launch.object,
  },
});
`;

const retireRocketCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.rocket.commandMenuItems.retireRocket,
  label: 'Retire',
  icon: 'IconPlayerPause',
  isPinned: true,
  position: 2,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.rocket.object,
  action: {
    // One-click status flip to "Retired" — no picker needed.
    type: CommandMenuItemActionType.SET_FIELD_VALUE,
    fieldMetadataUniversalIdentifier: SCHEMA_IDS.rocket.fields.status,
    value: 'RETIRED',
  },
});
`;

const rescheduleLaunchCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.launch.commandMenuItems.rescheduleLaunch,
  label: 'Reschedule',
  icon: 'IconCalendarClock',
  isPinned: true,
  position: 1,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.launch.object,
  action: {
    type: CommandMenuItemActionType.EDIT_FIELD,
    fieldMetadataUniversalIdentifier: SCHEMA_IDS.launch.fields.plannedLaunchAt,
  },
});
`;

const addPayloadCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.launch.commandMenuItems.addPayload,
  label: 'Add payload',
  icon: 'IconBox',
  isPinned: true,
  position: 1,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.launch.object,
  action: {
    type: CommandMenuItemActionType.CREATE_RELATED_RECORD,
    relationFieldMetadataUniversalIdentifier:
      SCHEMA_IDS.launch.fields.payloads,
    targetObjectMetadataUniversalIdentifier: SCHEMA_IDS.payload.object,
  },
});
`;

const upcomingLaunchesCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.launch.commandMenuItems.upcomingLaunches,
  label: 'Upcoming',
  icon: 'IconCalendarEvent',
  isPinned: true,
  position: 2,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.launch.object,
  action: {
    type: CommandMenuItemActionType.NAVIGATE_TO_VIEW,
    viewUniversalIdentifier: SCHEMA_IDS.launch.views.upcoming,
  },
});
`;

const bookSlotCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
  STANDARD_OBJECT,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.payload.commandMenuItems.bookSlot,
  label: 'Book slot',
  icon: 'IconCalendarPlus',
  isPinned: true,
  position: 0,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.payload.object,
  action: {
    // Book a payload slot for a customer: create a payload pre-linked to
    // a Company so sales can capture a booking in one step.
    type: CommandMenuItemActionType.CREATE_RELATED_RECORD,
    relationFieldMetadataUniversalIdentifier:
      SCHEMA_IDS.payload.fields.customer,
    targetObjectMetadataUniversalIdentifier:
      STANDARD_OBJECT.company.universalIdentifier,
  },
});
`;

const setPayloadStatusCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.payload.commandMenuItems.setPayloadStatus,
  label: 'Set status',
  icon: 'IconFlag',
  isPinned: true,
  position: 1,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.payload.object,
  action: {
    type: CommandMenuItemActionType.EDIT_FIELD,
    fieldMetadataUniversalIdentifier: SCHEMA_IDS.payload.fields.status,
  },
});
`;

const setCustomerStatusCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
  STANDARD_OBJECT,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.company.commandMenuItems.setCustomerStatus,
  label: 'Set status',
  icon: 'IconFlag',
  isPinned: true,
  position: 0,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier:
    STANDARD_OBJECT.company.universalIdentifier,
  action: {
    type: CommandMenuItemActionType.EDIT_FIELD,
    fieldMetadataUniversalIdentifier:
      STANDARD_OBJECT.company.fields.accountStatus,
  },
});
`;

const setSiteStatusCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.launchSite.commandMenuItems.setSiteStatus,
  label: 'Set status',
  icon: 'IconFlag',
  isPinned: true,
  position: 0,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.launchSite.object,
  action: {
    type: CommandMenuItemActionType.EDIT_FIELD,
    fieldMetadataUniversalIdentifier:
      SCHEMA_IDS.launchSite.fields.siteStatus,
  },
});
`;

const bookWindowCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.launchSite.commandMenuItems.bookWindow,
  label: 'Book window',
  icon: 'IconCalendarPlus',
  isPinned: true,
  position: 1,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.launchSite.object,
  action: {
    // Reserve a launch window on this pad: creates a linked Launch with
    // only the plannedLaunchAt to fill in.
    type: CommandMenuItemActionType.CREATE_RELATED_RECORD,
    relationFieldMetadataUniversalIdentifier:
      SCHEMA_IDS.launchSite.fields.launches,
    targetObjectMetadataUniversalIdentifier: SCHEMA_IDS.launch.object,
  },
});
`;

const launchesFromSiteCommandMenuItemSource = `import {
  CommandMenuItemAvailabilityType,
  CommandMenuItemActionType,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import { SCHEMA_IDS } from 'src/constants/schema-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SCHEMA_IDS.launchSite.commandMenuItems.launchesFromSite,
  label: 'Launches',
  icon: 'IconRocket',
  isPinned: true,
  position: 2,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  objectMetadataUniversalIdentifier: SCHEMA_IDS.launchSite.object,
  action: {
    type: CommandMenuItemActionType.NAVIGATE_TO_RELATED_VIEW,
    relationFieldMetadataUniversalIdentifier:
      SCHEMA_IDS.launchSite.fields.launches,
  },
});
`;

const applicationConfigSource = `import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
`;

export const EDITOR_FILES: ReadonlyArray<EditorFile> = [
  {
    id: 'schema-identifiers',
    name: 'schema-identifiers.ts',
    path: 'src/constants/schema-identifiers.ts',
    source: schemaIdentifiersSource,
  },
  {
    id: 'rocket-object',
    name: 'rocket.object.ts',
    path: 'src/objects/rocket.object.ts',
    source: rocketObjectSource,
  },
  {
    id: 'launch-object',
    name: 'launch.object.ts',
    path: 'src/objects/launch.object.ts',
    source: launchObjectSource,
  },
  {
    id: 'payload-object',
    name: 'payload.object.ts',
    path: 'src/objects/payload.object.ts',
    source: payloadObjectSource,
  },
  {
    id: 'launch-site-object',
    name: 'launch-site.object.ts',
    path: 'src/objects/launch-site.object.ts',
    source: launchSiteObjectSource,
  },
  {
    id: 'view-launches',
    name: 'launches.view.ts',
    path: 'src/views/launches.view.ts',
    source: launchesViewSource,
  },
  {
    id: 'view-upcoming',
    name: 'upcoming-launches.view.ts',
    path: 'src/views/upcoming-launches.view.ts',
    source: upcomingLaunchesViewSource,
  },
  {
    id: 'nav-launches',
    name: 'launches.navigation-menu-item.ts',
    path: 'src/navigation-menu-items/launches.navigation-menu-item.ts',
    source: launchesNavItemSource,
  },
  {
    id: 'nav-upcoming',
    name: 'upcoming-launches.navigation-menu-item.ts',
    path: 'src/navigation-menu-items/upcoming-launches.navigation-menu-item.ts',
    source: upcomingLaunchesNavItemSource,
  },
  {
    id: 'nav-past-launches',
    name: 'past-launches.navigation-menu-item.ts',
    path: 'src/navigation-menu-items/past-launches.navigation-menu-item.ts',
    source: pastLaunchesNavItemSource,
  },
  {
    id: 'nav-rockets',
    name: 'rockets.navigation-menu-item.ts',
    path: 'src/navigation-menu-items/rockets.navigation-menu-item.ts',
    source: rocketsNavItemSource,
  },
  {
    id: 'nav-payloads',
    name: 'payloads.navigation-menu-item.ts',
    path: 'src/navigation-menu-items/payloads.navigation-menu-item.ts',
    source: payloadsNavItemSource,
  },
  {
    id: 'nav-launch-sites',
    name: 'launch-sites.navigation-menu-item.ts',
    path: 'src/navigation-menu-items/launch-sites.navigation-menu-item.ts',
    source: launchSitesNavItemSource,
  },
  {
    id: 'view-rockets',
    name: 'rockets.view.ts',
    path: 'src/views/rockets.view.ts',
    source: rocketsViewSource,
  },
  {
    id: 'view-payloads',
    name: 'payloads.view.ts',
    path: 'src/views/payloads.view.ts',
    source: payloadsViewSource,
  },
  {
    id: 'view-launch-sites',
    name: 'launch-sites.view.ts',
    path: 'src/views/launch-sites.view.ts',
    source: launchSitesViewSource,
  },
  {
    id: 'view-past-launches',
    name: 'past-launches.view.ts',
    path: 'src/views/past-launches.view.ts',
    source: pastLaunchesViewSource,
  },
  {
    id: 'cmd-fly-again',
    name: 'fly-again.command-menu-item.ts',
    path: 'src/command-menu-items/fly-again.command-menu-item.ts',
    source: flyAgainCommandMenuItemSource,
  },
  {
    id: 'cmd-schedule-launch',
    name: 'schedule-launch.command-menu-item.ts',
    path: 'src/command-menu-items/schedule-launch.command-menu-item.ts',
    source: scheduleLaunchFromRocketCommandMenuItemSource,
  },
  {
    id: 'cmd-retire-rocket',
    name: 'retire-rocket.command-menu-item.ts',
    path: 'src/command-menu-items/retire-rocket.command-menu-item.ts',
    source: retireRocketCommandMenuItemSource,
  },
  {
    id: 'cmd-reschedule-launch',
    name: 'reschedule-launch.command-menu-item.ts',
    path: 'src/command-menu-items/reschedule-launch.command-menu-item.ts',
    source: rescheduleLaunchCommandMenuItemSource,
  },
  {
    id: 'cmd-add-payload',
    name: 'add-payload.command-menu-item.ts',
    path: 'src/command-menu-items/add-payload.command-menu-item.ts',
    source: addPayloadCommandMenuItemSource,
  },
  {
    id: 'cmd-upcoming-launches',
    name: 'upcoming-launches.command-menu-item.ts',
    path: 'src/command-menu-items/upcoming-launches.command-menu-item.ts',
    source: upcomingLaunchesCommandMenuItemSource,
  },
  {
    id: 'cmd-book-slot',
    name: 'book-slot.command-menu-item.ts',
    path: 'src/command-menu-items/book-slot.command-menu-item.ts',
    source: bookSlotCommandMenuItemSource,
  },
  {
    id: 'cmd-set-payload-status',
    name: 'set-payload-status.command-menu-item.ts',
    path: 'src/command-menu-items/set-payload-status.command-menu-item.ts',
    source: setPayloadStatusCommandMenuItemSource,
  },
  {
    id: 'cmd-set-customer-status',
    name: 'set-customer-status.command-menu-item.ts',
    path: 'src/command-menu-items/set-customer-status.command-menu-item.ts',
    source: setCustomerStatusCommandMenuItemSource,
  },
  {
    id: 'cmd-set-site-status',
    name: 'set-site-status.command-menu-item.ts',
    path: 'src/command-menu-items/set-site-status.command-menu-item.ts',
    source: setSiteStatusCommandMenuItemSource,
  },
  {
    id: 'cmd-book-window',
    name: 'book-window.command-menu-item.ts',
    path: 'src/command-menu-items/book-window.command-menu-item.ts',
    source: bookWindowCommandMenuItemSource,
  },
  {
    id: 'cmd-launches-from-site',
    name: 'launches-from-site.command-menu-item.ts',
    path: 'src/command-menu-items/launches-from-site.command-menu-item.ts',
    source: launchesFromSiteCommandMenuItemSource,
  },
  {
    id: 'application-config',
    name: 'application-config.ts',
    path: 'src/application-config.ts',
    source: applicationConfigSource,
  },
];
