import { FieldMetadataType } from 'twenty-shared/types';

// Raw strings kept for pre-upgrade workspaces that haven't yet run
// the 1.20 migrate-rich-text-to-text / rename-rich-text-v2 commands.
export const isTextColumnType = (type: FieldMetadataType) => {
  return (
    type === FieldMetadataType.TEXT ||
    type === FieldMetadataType.ARRAY ||
    (type as string) === 'RICH_TEXT_V2' ||
    (type as string) === 'RICH_TEXT'
  );
};
