import { DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from '@/metadata/constants/default-relations-object-standard-ids.constant';

const systemRelationObjectNamesManageableByWorkflow = new Set<string>(
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
);

export const canObjectBeManagedByWorkflow = ({
  nameSingular,
  isSystem,
}: {
  nameSingular: string;
  isSystem: boolean;
}) => {
  const excludedNonSystemObjectMetadataItemNames = [
    'workflow',
    'workflowVersion',
    'workflowRun',
    'dashboard',
  ];

  const isBlockedNonSystemObject =
    excludedNonSystemObjectMetadataItemNames.includes(nameSingular);

  if (isBlockedNonSystemObject) {
    return false;
  }

  if (!isSystem) {
    return true;
  }

  return systemRelationObjectNamesManageableByWorkflow.has(nameSingular);
};
