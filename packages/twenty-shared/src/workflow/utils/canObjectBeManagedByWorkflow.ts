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

  return (
    !excludedNonSystemObjectMetadataItemNames.includes(nameSingular) &&
    !isSystem
  );
};
