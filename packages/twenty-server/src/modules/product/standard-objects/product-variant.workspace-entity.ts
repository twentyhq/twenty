import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_PRODUCT_VARIANT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class ProductVariantWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  sku: string | null;
  price: number | null;
  cost: number | null;
  stockQuantity: number | null;
  imageUrl: string | null;
  attributes: string | null;
  isActive: boolean;
  product: EntityRelation<ProductWorkspaceEntity> | null;
  productId: string | null;
  searchVector: string;
}
