import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { PRODUCT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';

export const SEARCH_FIELDS_FOR_PRODUCT: FieldTypeAndNameMetadata[] = [
  { name: 'name', type: FieldMetadataType.TEXT },
  { name: 'ncm', type: FieldMetadataType.TEXT },
  { name: 'cfop', type: FieldMetadataType.TEXT },
  { name: 'cest', type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.product,
  namePlural: 'products',
  labelSingular: msg`Product`,
  labelPlural: msg`Products`,
  description: msg`A product that can be sold`,
  icon: 'IconClipboardList',
  labelIdentifierStandardId: PRODUCT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class ProductWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Product Name`,
    description: msg`Product name`,
    icon: 'IconClipboardList',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.salePrice,
    type: FieldMetadataType.NUMBER,
    label: msg`Price`,
    description: msg`Product sale price`,
    icon: 'IconTag',
  })
  @WorkspaceIsNullable()
  salePrice: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cost,
    type: FieldMetadataType.NUMBER,
    label: msg`Cost`,
    description: msg`Product cost`,
    icon: 'IconTag',
  })
  @WorkspaceIsNullable()
  cost: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.unitOfMeasure,
    type: FieldMetadataType.TEXT,
    label: msg`Unit`,
    description: msg`Product unit of measure (e.g., kg, unit, liter)`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  unitOfMeasure: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Product status (active products can be used in charges)`,
    icon: 'IconProgress',
    options: [
      { value: 'active', label: 'Active', position: 0, color: 'green' },
      { value: 'inactive', label: 'Inactive', position: 1, color: 'red' },
    ],
    defaultValue: "'active'",
  })
  @WorkspaceFieldIndex()
  status: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Product record position`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceRelation({
    standardId: PRODUCT_STANDARD_FIELD_IDS.charges,
    type: RelationType.ONE_TO_MANY,
    label: msg`Charges`,
    description: msg`Charges using this product`,
    icon: 'IconSettings',
    inverseSideTarget: () => ChargeWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  charges: Relation<ChargeWorkspaceEntity[]> | null;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.ncm,
    type: FieldMetadataType.TEXT,
    label: msg`NCM`,
    description: msg`Nomenclatura Comum Mercosul. Format: xxxx.xx.xx. Placeholder: 8471.30.12`,
    icon: 'IconBarcode',
  })
  @WorkspaceIsNullable()
  ncm: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cfop,
    type: FieldMetadataType.TEXT,
    label: msg`CFOP`,
    description: msg`Código Fiscal de Operações. Placeholder: 5102`,
    icon: 'IconFileCode',
  })
  @WorkspaceIsNullable()
  cfop: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cest,
    type: FieldMetadataType.TEXT,
    label: msg`CEST`,
    description: msg`Código Especificador da Substituição Tributária. Placeholder: 28.038.00`,
    icon: 'IconFileCode',
  })
  @WorkspaceIsNullable()
  cest: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.unidade,
    type: FieldMetadataType.TEXT,
    label: msg`Unidade Comercial`,
    description: msg`Unidade comercial. Placeholder: UN`,
    icon: 'IconBox',
  })
  @WorkspaceIsNullable()
  unidade: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.origem,
    type: FieldMetadataType.NUMBER,
    label: msg`Origem da Mercadoria`,
    description: msg`Origem da mercadoria (0-8). Placeholder: 0`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  origem: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cstIcmsCsosn,
    type: FieldMetadataType.TEXT,
    label: msg`CST ICMS/CSOSN`,
    description: msg`Código da Situação Tributária ou CSOSN. Placeholder: 102`,
    icon: 'IconReceiptTax',
  })
  @WorkspaceIsNullable()
  cstIcmsCsosn: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cstPis,
    type: FieldMetadataType.TEXT,
    label: msg`CST PIS`,
    description: msg`CST do PIS. Placeholder: 01`,
    icon: 'IconReceiptTax',
  })
  @WorkspaceIsNullable()
  cstPis: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.cstCofins,
    type: FieldMetadataType.TEXT,
    label: msg`CST COFINS`,
    description: msg`CST do COFINS. Placeholder: 01`,
    icon: 'IconReceiptTax',
  })
  @WorkspaceIsNullable()
  cstCofins: string;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.aliquotaIcms,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota ICMS (%)`,
    description: msg`Alíquota do ICMS. Placeholder: 18.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaIcms: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.aliquotaPis,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota PIS (%)`,
    description: msg`Alíquota do PIS. Placeholder: 1.65`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaPis: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.aliquotaCofins,
    type: FieldMetadataType.NUMBER,
    label: msg`Alíquota COFINS (%)`,
    description: msg`Alíquota do COFINS. Placeholder: 7.60`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  aliquotaCofins: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.valorIpi,
    type: FieldMetadataType.NUMBER,
    label: msg`Valor/Alíquota IPI`,
    description: msg`Valor ou alíquota de IPI (se aplicável). Placeholder: 0.00`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  valorIpi: number;

  @WorkspaceField({
    standardId: PRODUCT_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_PRODUCT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
