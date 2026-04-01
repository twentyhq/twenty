import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_PRODUCT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class ProductWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  sku: string | null;
  price: number | null;
  cost: number | null;
  isActive: boolean;
  category: string | null;
  imageUrl: string | null;
  type: string | null;
  unit: string | null;
  weight: number | null;
  dimensions: string | null;
  isInventoryEnabled: boolean;
  stockQuantity: number | null;
  reorderPoint: number | null;
  leadTimeDays: number | null;
  isTaxable: boolean;
  taxCategory: string | null;
  searchVector: string;
}
