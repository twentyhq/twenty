import { parseApplicationVariableFilesValue } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';

export const findApplicationVariableFileIds = ({
  flatApplicationVariable,
  secretEncryptionService,
  workspaceId,
}: {
  flatApplicationVariable: FlatApplicationVariable;
  secretEncryptionService: SecretEncryptionService;
  workspaceId: string;
}): string[] => {
  if (flatApplicationVariable.type !== FieldMetadataType.FILES) {
    return [];
  }

  return parseApplicationVariableFilesValue(
    secretEncryptionService.decryptVersionedOrThrow(
      flatApplicationVariable.value,
      { workspaceId },
    ),
  ).map(({ fileId }) => fileId);
};
