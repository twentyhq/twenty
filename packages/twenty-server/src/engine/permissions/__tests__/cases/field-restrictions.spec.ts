import {
  agent,
  CUSTOM_APPLICATION,
  NO_LIMITING_PRINCIPAL,
  type RecordAccessWorld,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  OBJECT_ID,
  STATUS_FIELD_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { resolveWorldOrThrow } from 'src/engine/permissions/__tests__/framework/resolve-world.util';

const MEMBER_WITH_ALL_RECORDS: RecordAccessWorld = {
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  isSharingEnabled: false,
};

const findDeniedFields = async (world: RecordAccessWorld) => {
  const { services, principals } = await resolveWorldOrThrow({ world });
  const question = { principals, objectMetadataId: OBJECT_ID };

  return {
    unreadable:
      await services.recordPermissionsService.findUnreadableFieldMetadataIdsOrThrow(
        question,
      ),
    nonUpdatable:
      await services.recordPermissionsService.findNonUpdatableFieldMetadataIdsOrThrow(
        question,
      ),
  };
};

describe('field restrictions', () => {
  it('restricts nothing by default', async () => {
    expect(await findDeniedFields(MEMBER_WITH_ALL_RECORDS)).toEqual({
      unreadable: new Set(),
      nonUpdatable: new Set(),
    });
  });

  it('treats an unreadable field as not updatable', async () => {
    expect(
      await findDeniedFields({
        ...MEMBER_WITH_ALL_RECORDS,
        restrictedFieldsByRoleId: {
          [MAIN_ROLE_ID]: {
            [STATUS_FIELD_ID]: { canRead: false, canUpdate: null },
          },
        },
      }),
    ).toEqual({
      unreadable: new Set([STATUS_FIELD_ID]),
      nonUpdatable: new Set([STATUS_FIELD_ID]),
    });
  });

  it('keeps a read-only field readable', async () => {
    expect(
      await findDeniedFields({
        ...MEMBER_WITH_ALL_RECORDS,
        restrictedFieldsByRoleId: {
          [MAIN_ROLE_ID]: {
            [STATUS_FIELD_ID]: { canRead: null, canUpdate: false },
          },
        },
      }),
    ).toEqual({
      unreadable: new Set(),
      nonUpdatable: new Set([STATUS_FIELD_ID]),
    });
  });

  it('applies a restriction held by the limiting role alone', async () => {
    expect(
      await findDeniedFields({
        ...MEMBER_WITH_ALL_RECORDS,
        limitingPrincipal: agent({ role: 'allRecords' }),
        restrictedFieldsByRoleId: {
          [LIMITING_ROLE_ID]: {
            [STATUS_FIELD_ID]: { canRead: false, canUpdate: null },
          },
        },
      }),
    ).toMatchObject({ unreadable: new Set([STATUS_FIELD_ID]) });
  });
});
