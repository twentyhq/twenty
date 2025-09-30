import { type FieldMetadataType } from "@/types/FieldMetadataType";

export type PartialFieldMetadataItem = {
    id: string;
    name: string;
    type: FieldMetadataType;
    label: string;
  }