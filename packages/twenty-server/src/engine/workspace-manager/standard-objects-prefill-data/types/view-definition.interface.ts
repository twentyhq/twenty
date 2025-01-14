export interface ViewDefinition {
  id?: string;
  name: string;
  objectMetadataId: string;
  type: string;
  key: string | null;
  position: number;
  icon?: string;
  kanbanFieldMetadataId?: string;
  fields?: {
    fieldMetadataId: string;
    position: number;
    isVisible: boolean;
    size: number;
  }[];
  filters?: {
    fieldMetadataId: string;
    displayValue: string;
    operand: string;
    value: string;
  }[];
  groups?: {
    fieldMetadataId: string;
    isVisible: boolean;
    fieldValue: string;
    position: number;
  }[];
}
