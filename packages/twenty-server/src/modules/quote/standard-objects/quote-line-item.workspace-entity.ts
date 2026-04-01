import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type QuoteWorkspaceEntity } from 'src/modules/quote/standard-objects/quote.workspace-entity';
import { type ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_QUOTE_LINE_ITEM: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class QuoteLineItemWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  quote: EntityRelation<QuoteWorkspaceEntity> | null;
  quoteId: string | null;
  product: EntityRelation<ProductWorkspaceEntity> | null;
  productId: string | null;
  quantity: number;
  unitPrice: number | null;
  discount: number | null;
  total: number | null;
  searchVector: string;
}
