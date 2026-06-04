import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type UniversalCreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import { type UniversalCreatePageLayoutAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

export type IdByUniversalIdentifierByMetadataName = {
  [P in AllMetadataName]?: Record<string, string>;
};

const buildFieldIdByUniversalIdentifierForObjectAction = ({
  action,
  fieldMetadataIdByUniversalIdentifier,
}: {
  action: UniversalCreateObjectAction;
  fieldMetadataIdByUniversalIdentifier: Record<string, string>;
}): Record<string, string> | undefined => {
  const fieldIdByUniversalIdentifier = {
    ...action.fieldIdByUniversalIdentifier,
  };

  for (const universalFlatFieldMetadata of action.universalFlatFieldMetadatas) {
    const providedFieldId =
      fieldMetadataIdByUniversalIdentifier[
        universalFlatFieldMetadata.universalIdentifier
      ];

    if (isDefined(providedFieldId)) {
      fieldIdByUniversalIdentifier[
        universalFlatFieldMetadata.universalIdentifier
      ] = providedFieldId;
    }
  }

  if (Object.keys(fieldIdByUniversalIdentifier).length === 0) {
    return undefined;
  }

  return fieldIdByUniversalIdentifier;
};

const buildTabIdByUniversalIdentifier = ({
  action,
  pageLayoutTabIdByUniversalIdentifier,
}: {
  action: UniversalCreatePageLayoutAction;
  pageLayoutTabIdByUniversalIdentifier: Record<string, string>;
}): Record<string, string> | undefined => {
  const tabIdByUniversalIdentifier = {
    ...action.tabIdByUniversalIdentifier,
    ...pageLayoutTabIdByUniversalIdentifier,
  };

  if (Object.keys(tabIdByUniversalIdentifier).length === 0) {
    return undefined;
  }

  return tabIdByUniversalIdentifier;
};

export const enrichCreateWorkspaceMigrationActionsWithIds = ({
  workspaceMigration,
  idByUniversalIdentifierByMetadataName,
}: {
  workspaceMigration: WorkspaceMigration;
  idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName;
}): {
  workspaceMigration: WorkspaceMigration;
  fieldIdToBeCreatedInMigrationByUniversalIdentifierMap: Map<string, string>;
} => {
  const fieldMetadataIdByUniversalIdentifier =
    idByUniversalIdentifierByMetadataName.fieldMetadata;
  const pageLayoutTabIdByUniversalIdentifier =
    idByUniversalIdentifierByMetadataName.pageLayoutTab;

  const fieldIdToBeCreatedInMigrationByUniversalIdentifierMap = new Map<
    string,
    string
  >();

  const enrichedActions = workspaceMigration.actions.map((action) => {
    if (action.type !== 'create') {
      return action;
    }

    const idByUniversalIdentifier =
      idByUniversalIdentifierByMetadataName[action.metadataName];

    if (
      action.metadataName !== 'fieldMetadata' &&
      !isDefined(idByUniversalIdentifier) &&
      !isDefined(fieldMetadataIdByUniversalIdentifier) &&
      !isDefined(pageLayoutTabIdByUniversalIdentifier)
    ) {
      return action;
    }

    switch (action.metadataName) {
      case 'objectMetadata': {
        const id = isDefined(idByUniversalIdentifier)
          ? idByUniversalIdentifier[action.flatEntity.universalIdentifier]
          : undefined;
        const fieldIdByUniversalIdentifier = isDefined(
          fieldMetadataIdByUniversalIdentifier,
        )
          ? buildFieldIdByUniversalIdentifierForObjectAction({
              action,
              fieldMetadataIdByUniversalIdentifier,
            })
          : undefined;

        return {
          ...action,
          id,
          fieldIdByUniversalIdentifier,
        };
      }
      case 'fieldMetadata': {
        const id =
          fieldMetadataIdByUniversalIdentifier?.[
            action.flatEntity.universalIdentifier
          ] ??
          action.id ??
          v4();

        const relatedFieldId = isDefined(
          action.relatedUniversalFlatFieldMetadata,
        )
          ? (fieldMetadataIdByUniversalIdentifier?.[
              action.relatedUniversalFlatFieldMetadata.universalIdentifier
            ] ??
            action.relatedFieldId ??
            v4())
          : action.relatedFieldId;

        if (
          !fieldIdToBeCreatedInMigrationByUniversalIdentifierMap.has(
            action.flatEntity.universalIdentifier,
          )
        ) {
          fieldIdToBeCreatedInMigrationByUniversalIdentifierMap.set(
            action.flatEntity.universalIdentifier,
            id,
          );
        }

        if (
          isDefined(action.relatedUniversalFlatFieldMetadata) &&
          isDefined(relatedFieldId) &&
          !fieldIdToBeCreatedInMigrationByUniversalIdentifierMap.has(
            action.relatedUniversalFlatFieldMetadata.universalIdentifier,
          )
        ) {
          fieldIdToBeCreatedInMigrationByUniversalIdentifierMap.set(
            action.relatedUniversalFlatFieldMetadata.universalIdentifier,
            relatedFieldId,
          );
        }

        return {
          ...action,
          id,
          relatedFieldId,
        };
      }
      case 'pageLayout': {
        const id = isDefined(idByUniversalIdentifier)
          ? idByUniversalIdentifier[action.flatEntity.universalIdentifier]
          : undefined;
        const tabIdByUniversalIdentifier = isDefined(
          pageLayoutTabIdByUniversalIdentifier,
        )
          ? buildTabIdByUniversalIdentifier({
              action,
              pageLayoutTabIdByUniversalIdentifier,
            })
          : undefined;

        return {
          ...action,
          id,
          tabIdByUniversalIdentifier,
        };
      }
      case 'view':
      case 'viewField':
      case 'viewGroup':
      case 'viewFieldGroup':
      case 'rowLevelPermissionPredicate':
      case 'rowLevelPermissionPredicateGroup':
      case 'viewFilterGroup':
      case 'index':
      case 'logicFunction':
      case 'viewFilter':
      case 'role':
      case 'roleTarget':
      case 'agent':
      case 'skill':
      case 'pageLayoutWidget':
      case 'pageLayoutTab':
      case 'commandMenuItem':
      case 'navigationMenuItem':
      case 'frontComponent':
      case 'viewSort':
      case 'rolePermissionFlag':
      case 'permissionFlag':
      case 'objectPermission':
      case 'fieldPermission':
      case 'webhook':
      case 'applicationVariable':
      case 'connectionProvider': {
        if (!isDefined(idByUniversalIdentifier)) {
          return action;
        }

        return {
          ...action,
          id: idByUniversalIdentifier[action.flatEntity.universalIdentifier],
        };
      }
      default: {
        assertUnreachable(action);
      }
    }
  });

  const enrichedWorkspaceMigration = {
    ...workspaceMigration,
    actions: enrichedActions,
  };

  return {
    workspaceMigration: enrichedWorkspaceMigration,
    fieldIdToBeCreatedInMigrationByUniversalIdentifierMap,
  };
};
