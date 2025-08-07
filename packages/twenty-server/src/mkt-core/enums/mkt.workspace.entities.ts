import {MktAttributeWorkspaceEntity} from "src/mkt-core/attribute/mkt-attribute.workspace-entity";
import {MktCustomerWorkspaceEntity} from "src/mkt-core/mkt-example/libs/customers/entities/customer.workspace-entity";
import {MktProductWorkspaceEntity} from "src/mkt-core/product/standard-objects/mkt-product.workspace-entity";
import {MktValueWorkspaceEntity} from "src/mkt-core/value/mkt-value.workspace-entity";
import {MktVariantWorkspaceEntity} from "src/mkt-core/variant/mkt-variant.workspace-entity";
import {MktVariantAttributeWorkspaceEntity} from "src/mkt-core/variant_attribute/mkt-variant-attribute.workspace-entity";

export const MKT_WORKSPACE_ENTITIES = [
    MktCustomerWorkspaceEntity,
    MktProductWorkspaceEntity,
    MktAttributeWorkspaceEntity,
    MktVariantWorkspaceEntity,
    MktValueWorkspaceEntity,
    MktVariantAttributeWorkspaceEntity,
    // add other workspace entities here if needed
]
