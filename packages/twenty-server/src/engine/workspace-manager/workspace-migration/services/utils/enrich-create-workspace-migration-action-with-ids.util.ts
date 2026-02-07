import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type UniversalCreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration';

export type IdByUniversalIdentifierByMetadataName = {
  [P in AllMetadataName]?: Record<string, string>;
};

const buildFieldIdByUniversalIdentifier = ({
  action,
  fieldMetadataIdByUniversalIdentifier,
}: {
  action: UniversalCreateObjectAction | UniversalCreateFieldAction;
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

export const enrichCreateWorkspaceMigrationActionsWithIds = ({
  workspaceMigration,
  idByUniversalIdentifierByMetadataName,
}: {
  workspaceMigration: WorkspaceMigration;
  idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName;
}): WorkspaceMigration => {
  const fieldMetadataIdByUniversalIdentifier =
    idByUniversalIdentifierByMetadataName.fieldMetadata;

  const enrichedActions = workspaceMigration.actions.map((action) => {
    if (action.type !== 'create') {
      return action;
    }

    const idByUniversalIdentifier =
      idByUniversalIdentifierByMetadataName[action.metadataName];

    if (
      !isDefined(idByUniversalIdentifier) &&
      !isDefined(fieldMetadataIdByUniversalIdentifier)
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
          ? buildFieldIdByUniversalIdentifier({
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
        if (!isDefined(fieldMetadataIdByUniversalIdentifier)) {
          return action;
        }

        return {
          ...action,
          fieldIdByUniversalIdentifier: buildFieldIdByUniversalIdentifier({
            action,
            fieldMetadataIdByUniversalIdentifier,
          }),
        };
      }
      case 'view':
      case 'viewField':
      case 'viewGroup':
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
      case 'pageLayout':
      case 'pageLayoutWidget':
      case 'pageLayoutTab':
      case 'commandMenuItem':
      case 'navigationMenuItem':
      case 'frontComponent':
      case 'webhook': {
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

  return {
    ...workspaceMigration,
    actions: enrichedActions,
  };
};
