import { FieldMetadataType } from 'twenty-shared/types';

// 'RICH_TEXT' kept as a raw string for pre-upgrade workspaces that haven't
// yet run the 1.20 migrate-rich-text-to-text command.
export const isTextColumnType = (type: FieldMetadataType) => {
  return (
    type === FieldMetadataType.TEXT ||
    type === FieldMetadataType.ARRAY ||
    (type as string) === 'RICH_TEXT'
  );
};
