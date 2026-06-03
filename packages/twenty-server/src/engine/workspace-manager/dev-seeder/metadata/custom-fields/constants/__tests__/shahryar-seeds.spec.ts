import {
  type FieldMetadataDefaultOption,
  type FieldMetadataOptionForAnyType,
} from 'twenty-shared/types';
import { SHAHRYAR_SUPERVISOR_VISIT_PHOTOS_FIELD_METADATA_UNIVERSAL_IDENTIFIER } from 'twenty-shared/shahryar';

import { SHAHRYAR_RELATION_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/shahryar-relation-field-seeds.constant';
import { SHAHRYAR_CUSTOM_OBJECT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/shahryar-custom-object-seeds.constant';
import { SHAHRYAR_CUSTOM_FIELD_SEED_CONFIGS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/shahryar-custom-field-seeds.constant';
import {
  SHAHRYAR_ADMIN_ROLE_SEED,
  SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS,
  SHAHRYAR_SUPERVISOR_ROLE_SEED,
  SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/shahryar-role-seeds.constant';
import {
  SHAHRYAR_ABSENCE_DATA_SEED_COLUMNS,
  SHAHRYAR_ABSENCE_DATA_SEEDS,
  SHAHRYAR_MARKET_DATA_SEED_COLUMNS,
  SHAHRYAR_MARKET_DATA_SEEDS,
  SHAHRYAR_PAYMENT_DATA_SEED_COLUMNS,
  SHAHRYAR_PAYMENT_DATA_SEEDS,
  SHAHRYAR_SUPERVISOR_PENALTY_DATA_SEED_COLUMNS,
  SHAHRYAR_SUPERVISOR_PENALTY_DATA_SEEDS,
  SHAHRYAR_SUPERVISOR_VISIT_DATA_SEED_COLUMNS,
  SHAHRYAR_SUPERVISOR_VISIT_DATA_SEEDS,
  SHAHRYAR_WORKING_TIME_DATA_SEED_COLUMNS,
  SHAHRYAR_WORKING_TIME_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/shahryar-data-seeds.constant';
import {
  WORKSPACE_MEMBER_DATA_SEED_COLUMNS_WITH_USERNAME,
  WORKSPACE_MEMBER_DATA_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const findDuplicates = (values: string[]) =>
  values.filter((value, index) => values.indexOf(value) !== index);

const expectUnique = (values: string[]) => {
  expect(findDuplicates(values)).toEqual([]);
};

const expectRecordsToMatchColumns = <TRecord extends object>({
  columns,
  records,
}: {
  columns: (keyof TRecord)[];
  records: TRecord[];
}) => {
  const columnNames = columns.map(String).sort();

  for (const record of records) {
    expect(Object.keys(record).sort()).toEqual(columnNames);
  }
};

const graphQLEnumNameRegex = /^[_A-Za-z][_0-9A-Za-z]*$/;

const isFieldMetadataOptionArray = (
  options: FieldMetadataOptionForAnyType | undefined,
): options is FieldMetadataDefaultOption[] => Array.isArray(options);

const getFieldNamesForObject = (objectName: string) =>
  SHAHRYAR_CUSTOM_FIELD_SEED_CONFIGS.find(
    (fieldConfig) => fieldConfig.objectName === objectName,
  )?.seeds.map((seed) => seed.name) ?? [];

describe('Shahryar dev seeder metadata', () => {
  it('keeps object and field names unique', () => {
    expectUnique(SHAHRYAR_CUSTOM_OBJECT_SEEDS.map((seed) => seed.nameSingular));
    expectUnique(SHAHRYAR_CUSTOM_OBJECT_SEEDS.map((seed) => seed.namePlural));

    for (const fieldConfig of SHAHRYAR_CUSTOM_FIELD_SEED_CONFIGS) {
      const fieldNames = fieldConfig.seeds.map((seed) => seed.name);
      const relationFieldNames = SHAHRYAR_RELATION_FIELD_SEEDS.filter(
        (relation) => relation.sourceObjectName === fieldConfig.objectName,
      ).map((relation) => relation.name);

      expectUnique([...fieldNames, ...relationFieldNames]);
    }
  });

  it('uses a stable universal identifier for mobile visit photo uploads', () => {
    const supervisorVisitFields = SHAHRYAR_CUSTOM_FIELD_SEED_CONFIGS.find(
      (fieldConfig) => fieldConfig.objectName === 'shahryarSupervisorVisit',
    )?.seeds;

    expect(
      supervisorVisitFields?.find((field) => field.name === 'photos')
        ?.universalIdentifier,
    ).toBe(
      SHAHRYAR_SUPERVISOR_VISIT_PHOTOS_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
    );
  });

  it('uses GraphQL-safe values for selectable field options', () => {
    for (const fieldConfig of SHAHRYAR_CUSTOM_FIELD_SEED_CONFIGS) {
      for (const fieldSeed of fieldConfig.seeds) {
        if (!isFieldMetadataOptionArray(fieldSeed.options)) {
          continue;
        }

        for (const option of fieldSeed.options) {
          expect(option.value).toMatch(graphQLEnumNameRegex);
        }
      }
    }
  });

  it('targets existing Shahryar or standard workspace objects in relations', () => {
    const objectNames = new Set([
      ...SHAHRYAR_CUSTOM_OBJECT_SEEDS.map((seed) => seed.nameSingular),
      'workspaceMember',
    ]);

    for (const relation of SHAHRYAR_RELATION_FIELD_SEEDS) {
      expect(objectNames.has(relation.sourceObjectName)).toBe(true);
      expect(objectNames.has(relation.targetObjectName)).toBe(true);
    }
  });

  it('keeps seed data aligned with inserted columns', () => {
    expectRecordsToMatchColumns({
      columns: WORKSPACE_MEMBER_DATA_SEED_COLUMNS_WITH_USERNAME,
      records: WORKSPACE_MEMBER_DATA_SEEDS,
    });
    expectRecordsToMatchColumns({
      columns: SHAHRYAR_MARKET_DATA_SEED_COLUMNS,
      records: SHAHRYAR_MARKET_DATA_SEEDS,
    });
    expectRecordsToMatchColumns({
      columns: SHAHRYAR_SUPERVISOR_VISIT_DATA_SEED_COLUMNS,
      records: SHAHRYAR_SUPERVISOR_VISIT_DATA_SEEDS,
    });
    expectRecordsToMatchColumns({
      columns: SHAHRYAR_WORKING_TIME_DATA_SEED_COLUMNS,
      records: SHAHRYAR_WORKING_TIME_DATA_SEEDS,
    });
    expectRecordsToMatchColumns({
      columns: SHAHRYAR_PAYMENT_DATA_SEED_COLUMNS,
      records: SHAHRYAR_PAYMENT_DATA_SEEDS,
    });
    expectRecordsToMatchColumns({
      columns: SHAHRYAR_SUPERVISOR_PENALTY_DATA_SEED_COLUMNS,
      records: SHAHRYAR_SUPERVISOR_PENALTY_DATA_SEEDS,
    });
    expectRecordsToMatchColumns({
      columns: SHAHRYAR_ABSENCE_DATA_SEED_COLUMNS,
      records: SHAHRYAR_ABSENCE_DATA_SEEDS,
    });
  });

  it('defines Shahryar roles with supervisor-only object and row-level permissions', () => {
    expect(SHAHRYAR_ADMIN_ROLE_SEED.label).toBe('ئەدمین');
    expect(SHAHRYAR_ADMIN_ROLE_SEED.canUpdateAllSettings).toBe(true);
    expect(SHAHRYAR_ADMIN_ROLE_SEED.canReadAllObjectRecords).toBe(true);

    expect(SHAHRYAR_SUPERVISOR_ROLE_SEED.label).toBe('موشریف');
    expect(SHAHRYAR_SUPERVISOR_ROLE_SEED.canUpdateAllSettings).toBe(false);
    expect(SHAHRYAR_SUPERVISOR_ROLE_SEED.canReadAllObjectRecords).toBe(false);
    expect(SHAHRYAR_SUPERVISOR_ROLE_SEED.canBeAssignedToApiKeys).toBe(false);

    const shahryarObjectNames = SHAHRYAR_CUSTOM_OBJECT_SEEDS.map(
      (seed) => seed.nameSingular,
    ).sort();

    expect(
      SHAHRYAR_SUPERVISOR_OBJECT_PERMISSION_SEEDS.map(
        (seed) => seed.objectName,
      ).sort(),
    ).toEqual(shahryarObjectNames);
    expect(
      SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS.map(
        (seed) => seed.objectName,
      ).sort(),
    ).toEqual(shahryarObjectNames);

    const relationFieldKeys = new Set(
      SHAHRYAR_RELATION_FIELD_SEEDS.map(
        (seed) => `${seed.sourceObjectName}.${seed.name}`,
      ),
    );

    for (const rowLevelPermissionSeed of SHAHRYAR_SUPERVISOR_ROW_LEVEL_PERMISSION_SEEDS) {
      expect(
        relationFieldKeys.has(
          `${rowLevelPermissionSeed.objectName}.${rowLevelPermissionSeed.ownerFieldName}`,
        ),
      ).toBe(true);
    }
  });

  it('covers the PRD market and visit field requirements', () => {
    expect(getFieldNamesForObject('workspaceMember')).toEqual(
      expect.arrayContaining(['username']),
    );
    expect(getFieldNamesForObject('shahryarMarket')).toEqual(
      expect.arrayContaining([
        'ownerName',
        'phoneNumber',
        'gpsLocation',
        'marketAddress',
        'district',
        'paymentStatus',
        'balanceAmount',
        'shopPhotos',
        'notes',
      ]),
    );
    expect(getFieldNamesForObject('shahryarSupervisorVisit')).toEqual(
      expect.arrayContaining([
        'checkInAt',
        'checkOutAt',
        'gpsLocation',
        'soldCartons',
        'requestedCartons',
        'photos',
        'issue',
        'decisionMaker',
        'requestDetails',
        'report',
        'notes',
      ]),
    );
  });

  it('defines mobile device fields for Shahryar push notifications', () => {
    expect(getFieldNamesForObject('shahryarMobileDevice')).toEqual(
      expect.arrayContaining([
        'deviceId',
        'expoPushToken',
        'platform',
        'enabledNotificationKinds',
        'lastRegisteredAt',
      ]),
    );
  });

  it('defines delivery audit fields for Shahryar push notifications', () => {
    expect(getFieldNamesForObject('shahryarNotificationDelivery')).toEqual(
      expect.arrayContaining([
        'notificationDeliveryId',
        'notificationId',
        'kind',
        'severity',
        'supervisorName',
        'deviceId',
        'expoPushToken',
        'status',
        'attemptCount',
        'lastAttemptAt',
        'failureReason',
      ]),
    );
  });
});
