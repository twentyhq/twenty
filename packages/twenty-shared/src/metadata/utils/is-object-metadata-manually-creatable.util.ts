export const MANUAL_RECORD_CREATION_DISABLED_OBJECT_NAME_SINGULARS: readonly string[] =
  ['workflow', 'workflowVersion', 'workflowRun', 'dashboard'];

export const isObjectMetadataManuallyCreatable = ({
  isActive,
  isSystem,
  nameSingular,
}: {
  isActive: boolean;
  isSystem: boolean;
  nameSingular: string;
}): boolean =>
  isActive === true &&
  isSystem === false &&
  !MANUAL_RECORD_CREATION_DISABLED_OBJECT_NAME_SINGULARS.includes(nameSingular);
