import {
  createWorkspaceCustomApplicationSyncWorkspace,
  type WorkspaceCustomApplicationSyncWorkspace,
} from 'test/integration/metadata/suites/application/utils/create-workspace-custom-application-sync-workspace.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_FIELD_ID = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;
const WORKSPACE_MEMBER_ID_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.fields.id.universalIdentifier;

const personScopingFieldManifest: FieldManifest = {
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'integrationRlsScopingColumn',
  label: 'Integration RLS Scoping Column',
  description: 'Custom field a row-level predicate scopes on',
  icon: 'IconLock',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
};

// Only the workspace custom application may declare row-level permissions
const buildManifestWithPredicates = ({
  workspace,
  roleUniversalIdentifier,
  predicates,
}: {
  workspace: WorkspaceCustomApplicationSyncWorkspace;
  roleUniversalIdentifier: string;
  predicates: NonNullable<
    Manifest['roles'][number]['rowLevelPermissionPredicates']
  >;
}): Manifest => ({
  ...workspace.manifest,
  fields: [...workspace.manifest.fields, personScopingFieldManifest],
  roles: [
    ...workspace.manifest.roles,
    {
      universalIdentifier: roleUniversalIdentifier,
      label: 'RLS Test Role',
      description: 'Role exercising declarative row-level predicates',
      objectPermissions: [
        {
          universalIdentifier: uuidv4(),
          objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
          canReadObjectRecords: true,
        },
      ],
      rowLevelPermissionPredicates: predicates,
    },
  ],
});

const partnerUserStylePredicate = ({
  predicateUniversalIdentifier,
  operand,
}: {
  predicateUniversalIdentifier: string;
  operand: RowLevelPermissionPredicateOperand;
}) => ({
  universalIdentifier: predicateUniversalIdentifier,
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  fieldUniversalIdentifier: TEST_FIELD_ID,
  operand,
  workspaceMemberFieldUniversalIdentifier:
    WORKSPACE_MEMBER_ID_FIELD_UNIVERSAL_IDENTIFIER,
});

type PredicateRow = {
  id: string;
  operand: string;
  roleId: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  workspaceMemberFieldMetadataId: string | null;
  applicationId: string;
};

const findActivePredicateRows = async ({
  workspaceId,
  predicateUniversalIdentifier,
}: {
  workspaceId: string;
  predicateUniversalIdentifier: string;
}): Promise<PredicateRow[]> =>
  globalThis.testDataSource.query(
    `SELECT id, operand, "roleId", "objectMetadataId", "fieldMetadataId",
            "workspaceMemberFieldMetadataId", "applicationId"
     FROM core."rowLevelPermissionPredicate"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2 AND "deletedAt" IS NULL`,
    [predicateUniversalIdentifier, workspaceId],
  );

const findIdByUniversalIdentifier = async ({
  table,
  universalIdentifier,
  workspaceId,
}: {
  table: 'application' | 'role' | 'objectMetadata';
  universalIdentifier: string;
  workspaceId: string;
}): Promise<string> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."${table}"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, workspaceId],
  );

  return rows[0]?.id;
};

describe('Manifest sync - row level permission predicates declared on a role', () => {
  let workspace: WorkspaceCustomApplicationSyncWorkspace;

  const sync = async (manifest: Manifest) => {
    const { errors } = await syncApplication({
      manifest,
      inferDeletionFromMissingEntities: true,
      expectToFail: false,
      token: workspace.accessToken,
    });

    expect(errors).toBeUndefined();
  };

  beforeAll(async () => {
    workspace = await createWorkspaceCustomApplicationSyncWorkspace();
  }, 120000);

  afterAll(async () => {
    await workspace.deleteWorkspace();
  }, 120000);

  it('creates a row-level predicate owned by the app and pointing at the declared role/object/field', async () => {
    const roleUniversalIdentifier = uuidv4();
    const predicateUniversalIdentifier = uuidv4();

    await sync(
      buildManifestWithPredicates({
        workspace,
        roleUniversalIdentifier,
        predicates: [
          partnerUserStylePredicate({
            predicateUniversalIdentifier,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
          }),
        ],
      }),
    );

    const { workspaceId } = workspace;
    const [applicationId, roleId, personObjectId, predicateRows] =
      await Promise.all([
        findIdByUniversalIdentifier({
          table: 'application',
          universalIdentifier:
            workspace.manifest.application.universalIdentifier,
          workspaceId,
        }),
        findIdByUniversalIdentifier({
          table: 'role',
          universalIdentifier: roleUniversalIdentifier,
          workspaceId,
        }),
        findIdByUniversalIdentifier({
          table: 'objectMetadata',
          universalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
          workspaceId,
        }),
        findActivePredicateRows({ workspaceId, predicateUniversalIdentifier }),
      ]);

    expect(predicateRows).toHaveLength(1);

    const predicate = predicateRows[0];

    expect(predicate.operand).toBe(RowLevelPermissionPredicateOperand.CONTAINS);
    expect(predicate.roleId).toBe(roleId);
    expect(predicate.objectMetadataId).toBe(personObjectId);
    expect(predicate.fieldMetadataId).toBeTruthy();
    expect(predicate.workspaceMemberFieldMetadataId).toBeTruthy();
    expect(predicate.applicationId).toBe(applicationId);
  }, 60000);

  it('updates the predicate in place on re-sync and removes it when dropped from the manifest', async () => {
    const roleUniversalIdentifier = uuidv4();
    const predicateUniversalIdentifier = uuidv4();
    const { workspaceId } = workspace;
    const syncWithPredicates = (
      predicates: ReturnType<typeof partnerUserStylePredicate>[],
    ) =>
      sync(
        buildManifestWithPredicates({
          workspace,
          roleUniversalIdentifier,
          predicates,
        }),
      );

    await syncWithPredicates([
      partnerUserStylePredicate({
        predicateUniversalIdentifier,
        operand: RowLevelPermissionPredicateOperand.CONTAINS,
      }),
    ]);

    const createdRows = await findActivePredicateRows({
      workspaceId,
      predicateUniversalIdentifier,
    });

    expect(createdRows).toHaveLength(1);
    const predicateId = createdRows[0].id;

    await syncWithPredicates([
      partnerUserStylePredicate({
        predicateUniversalIdentifier,
        operand: RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN,
      }),
    ]);

    const updatedRows = await findActivePredicateRows({
      workspaceId,
      predicateUniversalIdentifier,
    });

    expect(updatedRows).toHaveLength(1);
    expect(updatedRows[0].id).toBe(predicateId);
    expect(updatedRows[0].operand).toBe(
      RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN,
    );

    await syncWithPredicates([]);

    expect(
      await findActivePredicateRows({
        workspaceId,
        predicateUniversalIdentifier,
      }),
    ).toHaveLength(0);
  }, 60000);
});
