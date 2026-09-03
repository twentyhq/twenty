import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type UniversalCreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
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
    const { universalIdentifier } = universalFlatFieldMetadata;
    const providedFieldId =
      fieldMetadataIdByUniversalIdentifier[universalIdentifier];

    if (isDefined(providedFieldId)) {
      fieldIdByUniversalIdentifier[universalIdentifier] = providedFieldId;
    } else if (!isDefined(fieldIdByUniversalIdentifier[universalIdentifier])) {
      fieldIdByUniversalIdentifier[universalIdentifier] = v4();
    }
  }

  if (Object.keys(fieldIdByUniversalIdentifier).length === 0) {
    return undefined;
  }

  return fieldIdByUniversalIdentifier;
};

const buildFieldIdByUniversalIdentifierForFieldActions = ({
  actions,
  providedFieldIdByUniversalIdentifier,
}: {
  actions: WorkspaceMigration['actions'];
  providedFieldIdByUniversalIdentifier?: Record<string, string>;
}): Record<string, string> | undefined => {
  const fieldIdByUniversalIdentifier = {
    ...providedFieldIdByUniversalIdentifier,
  };

  const setFieldIdIfMissing = ({
    universalIdentifier,
    fallbackId,
  }: {
    universalIdentifier: string;
    fallbackId?: string;
  }) => {
    if (isDefined(fieldIdByUniversalIdentifier[universalIdentifier])) {
      return;
    }

    fieldIdByUniversalIdentifier[universalIdentifier] = fallbackId ?? v4();
  };

  for (const action of actions) {
    if (action.type !== 'create' || action.metadataName !== 'fieldMetadata') {
      continue;
    }

    setFieldIdIfMissing({
      universalIdentifier: action.flatEntity.universalIdentifier,
      fallbackId: action.id,
    });

    if (isDefined(action.relatedUniversalFlatFieldMetadata)) {
      setFieldIdIfMissing({
        universalIdentifier:
          action.relatedUniversalFlatFieldMetadata.universalIdentifier,
        fallbackId: action.relatedFieldId,
      });
    }
  }

  if (Object.keys(fieldIdByUniversalIdentifier).length === 0) {
    return undefined;
  }

  return fieldIdByUniversalIdentifier;
};

const getJunctionTargetFieldUniversalIdentifier = (
  universalSettings: UniversalCreateFieldAction['flatEntity']['universalSettings'],
): string | null | undefined => {
  if (
    !isDefined(universalSettings) ||
    !('junctionTargetFieldUniversalIdentifier' in universalSettings)
  ) {
    return undefined;
  }

  return universalSettings.junctionTargetFieldUniversalIdentifier;
};

const buildReferencedFieldIdByUniversalIdentifierForFieldAction = ({
  action,
  fieldIdByUniversalIdentifier,
}: {
  action: UniversalCreateFieldAction;
  fieldIdByUniversalIdentifier?: Record<string, string>;
}): Record<string, string> | undefined => {
  if (!isDefined(fieldIdByUniversalIdentifier)) {
    return undefined;
  }

  const referencedFieldIdByUniversalIdentifier: Record<string, string> = {};

  const addReference = (universalIdentifier: string | null | undefined) => {
    if (
      !isDefined(universalIdentifier) ||
      !isDefined(fieldIdByUniversalIdentifier[universalIdentifier])
    ) {
      return;
    }

    referencedFieldIdByUniversalIdentifier[universalIdentifier] =
      fieldIdByUniversalIdentifier[universalIdentifier];
  };

  for (const universalFlatFieldMetadata of [
    action.flatEntity,
    action.relatedUniversalFlatFieldMetadata,
  ].filter(isDefined)) {
    addReference(
      universalFlatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
    );
    addReference(
      getJunctionTargetFieldUniversalIdentifier(
        universalFlatFieldMetadata.universalSettings,
      ),
    );
  }

  if (Object.keys(referencedFieldIdByUniversalIdentifier).length === 0) {
    return undefined;
  }

  return referencedFieldIdByUniversalIdentifier;
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

  const fieldIdByUniversalIdentifier =
    buildFieldIdByUniversalIdentifierForFieldActions({
      actions: workspaceMigration.actions,
      providedFieldIdByUniversalIdentifier:
        fieldMetadataIdByUniversalIdentifier,
    });

  const enrichedActions = workspaceMigration.actions.map((action) => {
    if (action.type !== 'create') {
      return action;
    }

    const providedId =
      idByUniversalIdentifierByMetadataName[action.metadataName]?.[
        action.flatEntity.universalIdentifier
      ];

    switch (action.metadataName) {
      case 'objectMetadata': {
        const objectFieldIdByUniversalIdentifier =
          buildFieldIdByUniversalIdentifierForObjectAction({
            action,
            fieldMetadataIdByUniversalIdentifier:
              fieldMetadataIdByUniversalIdentifier ?? {},
          });

        return {
          ...action,
          id: providedId ?? action.id ?? v4(),
          fieldIdByUniversalIdentifier: objectFieldIdByUniversalIdentifier,
        };
      }
      case 'fieldMetadata': {
        const typedAction = action as UniversalCreateFieldAction;
        const id =
          fieldIdByUniversalIdentifier?.[
            typedAction.flatEntity.universalIdentifier
          ];

        const relatedFieldId =
          isDefined(typedAction.relatedUniversalFlatFieldMetadata) &&
          isDefined(fieldIdByUniversalIdentifier)
            ? fieldIdByUniversalIdentifier[
                typedAction.relatedUniversalFlatFieldMetadata
                  .universalIdentifier
              ]
            : typedAction.relatedFieldId;

        const referencedFieldIdByUniversalIdentifier =
          buildReferencedFieldIdByUniversalIdentifierForFieldAction({
            action: typedAction,
            fieldIdByUniversalIdentifier,
          });

        return {
          ...typedAction,
          id,
          relatedFieldId,
          ...(isDefined(referencedFieldIdByUniversalIdentifier) && {
            fieldIdByUniversalIdentifier:
              referencedFieldIdByUniversalIdentifier,
          }),
        };
      }
      default: {
        return {
          ...action,
          id: providedId ?? action.id ?? v4(),
        };
      }
    }
  });

  return {
    ...workspaceMigration,
    actions: enrichedActions,
  };
};
