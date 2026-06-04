import { enrichCreateWorkspaceMigrationActionsWithIds } from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';
import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

const buildCreateFieldAction = ({
  fieldUniversalIdentifier,
  relatedFieldUniversalIdentifier,
}: {
  fieldUniversalIdentifier: string;
  relatedFieldUniversalIdentifier?: string;
}): UniversalCreateFieldAction =>
  ({
    type: 'create',
    metadataName: 'fieldMetadata',
    flatEntity: { universalIdentifier: fieldUniversalIdentifier },
    relatedUniversalFlatFieldMetadata: relatedFieldUniversalIdentifier
      ? { universalIdentifier: relatedFieldUniversalIdentifier }
      : undefined,
  }) as unknown as UniversalCreateFieldAction;

const buildWorkspaceMigration = (
  actions: UniversalCreateFieldAction[],
): WorkspaceMigration =>
  ({
    applicationUniversalIdentifier: 'app',
    actions,
  }) as unknown as WorkspaceMigration;

describe('enrichCreateWorkspaceMigrationActionsWithIds', () => {
  it('should assign an id to a create field action that has none', () => {
    const action = buildCreateFieldAction({ fieldUniversalIdentifier: 'a' });

    const { workspaceMigration } = enrichCreateWorkspaceMigrationActionsWithIds(
      {
        workspaceMigration: buildWorkspaceMigration([action]),
        idByUniversalIdentifierByMetadataName: {},
      },
    );

    const [enrichedAction] =
      workspaceMigration.actions as UniversalCreateFieldAction[];

    expect(enrichedAction.id).toEqual(expect.any(String));
  });

  it('should keep the field id and its related field id consistent with the returned map', () => {
    const action = buildCreateFieldAction({
      fieldUniversalIdentifier: 'source',
      relatedFieldUniversalIdentifier: 'target',
    });

    const {
      workspaceMigration,
      fieldIdToBeCreatedInMigrationByUniversalIdentifierMap,
    } = enrichCreateWorkspaceMigrationActionsWithIds({
      workspaceMigration: buildWorkspaceMigration([action]),
      idByUniversalIdentifierByMetadataName: {},
    });

    const [enrichedAction] =
      workspaceMigration.actions as UniversalCreateFieldAction[];

    expect(enrichedAction.id).toBe(
      fieldIdToBeCreatedInMigrationByUniversalIdentifierMap.get('source'),
    );
    expect(enrichedAction.relatedFieldId).toBe(
      fieldIdToBeCreatedInMigrationByUniversalIdentifierMap.get('target'),
    );
    expect(enrichedAction.id).not.toBe(enrichedAction.relatedFieldId);
  });

  it('should resolve a junction target field id to the same id the target action is created with', () => {
    const targetAction = buildCreateFieldAction({
      fieldUniversalIdentifier: 'target',
    });
    const junctionAction = buildCreateFieldAction({
      fieldUniversalIdentifier: 'junction',
      relatedFieldUniversalIdentifier: 'target',
    });

    const {
      workspaceMigration,
      fieldIdToBeCreatedInMigrationByUniversalIdentifierMap,
    } = enrichCreateWorkspaceMigrationActionsWithIds({
      workspaceMigration: buildWorkspaceMigration([
        targetAction,
        junctionAction,
      ]),
      idByUniversalIdentifierByMetadataName: {},
    });

    const [enrichedTargetAction] =
      workspaceMigration.actions as UniversalCreateFieldAction[];

    expect(
      fieldIdToBeCreatedInMigrationByUniversalIdentifierMap.get('target'),
    ).toBe(enrichedTargetAction.id);
  });

  it('should set relatedFieldId to the id already minted for the target by an earlier action', () => {
    const targetAction = buildCreateFieldAction({
      fieldUniversalIdentifier: 'target',
    });
    const junctionAction = buildCreateFieldAction({
      fieldUniversalIdentifier: 'junction',
      relatedFieldUniversalIdentifier: 'target',
    });

    const { workspaceMigration } = enrichCreateWorkspaceMigrationActionsWithIds(
      {
        workspaceMigration: buildWorkspaceMigration([
          targetAction,
          junctionAction,
        ]),
        idByUniversalIdentifierByMetadataName: {},
      },
    );

    const [enrichedTargetAction, enrichedJunctionAction] =
      workspaceMigration.actions as UniversalCreateFieldAction[];

    expect(enrichedJunctionAction.relatedFieldId).toBe(enrichedTargetAction.id);
  });

  it('should use the provided external id over a generated one', () => {
    const action = buildCreateFieldAction({ fieldUniversalIdentifier: 'a' });

    const { workspaceMigration } = enrichCreateWorkspaceMigrationActionsWithIds(
      {
        workspaceMigration: buildWorkspaceMigration([action]),
        idByUniversalIdentifierByMetadataName: {
          fieldMetadata: { a: 'external-id' },
        },
      },
    );

    const [enrichedAction] =
      workspaceMigration.actions as UniversalCreateFieldAction[];

    expect(enrichedAction.id).toBe('external-id');
  });
});
