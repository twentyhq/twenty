import { DateTime } from 'luxon';

import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order-item.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';
import { mapEntityOrderStatusToGraphQL } from 'src/mkt-core/order/utils/order-status.mapper';

import {
  MktOrderItemOutput,
  MktOrderOutput,
  MktOrdersOutput,
  MktOrdersPageInfo,
} from './mkt-order.output';

export function toMktOrderItemOutput(
  orderItemEntity: MktOrderItemWorkspaceEntity,
): MktOrderItemOutput {
  return {
    id: orderItemEntity.id,
    name: orderItemEntity.name,
    quantity: orderItemEntity.quantity,
    unitPrice: orderItemEntity.unitPrice,
    totalPrice: orderItemEntity.totalPrice,
    mktOrderId: orderItemEntity.mktOrderId,
  };
}

export function toMktOrderOutput(
  orderEntity: MktOrderWorkspaceEntity,
): MktOrderOutput {
  return {
    ...orderEntity,
    id: orderEntity.id,
    name: orderEntity.name,
    position: orderEntity?.position ?? null,
    orderCode: orderEntity.orderCode,
    status: orderEntity.status
      ? mapEntityOrderStatusToGraphQL(orderEntity.status)
      : undefined,
    totalAmount: orderEntity.totalAmount,
    currency: orderEntity.currency,
    note: orderEntity.note,
    requireContract: orderEntity.requireContract,
    createdAt: DateTime.fromISO(orderEntity.createdAt).toJSDate(),
    updatedAt: DateTime.fromISO(orderEntity.updatedAt).toJSDate(),
    orderItems: orderEntity.orderItems?.map(toMktOrderItemOutput) ?? [],
  };
}

export function toMktOrdersOutput(
  orders: MktOrderWorkspaceEntity[],
  total: number,
  page: number,
  limit: number,
): MktOrdersOutput {
  const totalPages = Math.ceil(total / limit);

  const pageInfo: MktOrdersPageInfo = {
    currentPage: page,
    totalPages,
    totalItems: total,
    limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return {
    data: orders.map(toMktOrderOutput),
    pageInfo,
  };
}
