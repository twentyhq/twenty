import { FlatFieldMetadata } from "src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type";
import { FieldMetadataType } from "twenty-shared/types";

export type FlatRelationTargetFieldMetadata = FlatFieldMetadata<FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION>['flatRelationTargetFieldMetadata']
