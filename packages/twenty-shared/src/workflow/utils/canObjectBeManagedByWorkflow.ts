import { MANUAL_RECORD_CREATION_DISABLED_OBJECT_NAME_SINGULARS } from '@/metadata/utils/is-object-metadata-manually-creatable.util';

export const canObjectBeManagedByWorkflow = ({
  nameSingular,
  isSystem,
}: {
  nameSingular: string;
  isSystem: boolean;
}) => {
  return (
    !MANUAL_RECORD_CREATION_DISABLED_OBJECT_NAME_SINGULARS.includes(
      nameSingular,
    ) && !isSystem
  );
};
