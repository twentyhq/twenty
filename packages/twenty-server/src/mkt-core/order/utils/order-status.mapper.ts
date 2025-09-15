import { ORDER_STATUS as OrderStatus } from 'src/mkt-core/order/constants/order-status.constants';
import { OrderStatusGraphQL } from 'src/mkt-core/order/graphql/order-status.enum';

/**
 * Maps GraphQL OrderStatus enum to workspace entity OrderStatus enum
 */
export function mapGraphQLOrderStatusToEntity(
  graphqlStatus?: OrderStatusGraphQL,
): OrderStatus | undefined {
  if (!graphqlStatus) {
    return undefined;
  }
  const statusMap: Record<OrderStatusGraphQL, OrderStatus> = {
    [OrderStatusGraphQL.PAID]: OrderStatus.PAID,
    [OrderStatusGraphQL.CANCELLED]: OrderStatus.CANCELLED,
    [OrderStatusGraphQL.PROCESSING]: OrderStatus.PROCESSING,
    [OrderStatusGraphQL.COMPLETED]: OrderStatus.COMPLETED,
    [OrderStatusGraphQL.TRIAL]: OrderStatus.TRIAL,
    [OrderStatusGraphQL.LOCKED]: OrderStatus.LOCKED,
    [OrderStatusGraphQL.DRAFT]: OrderStatus.DRAFT,
    [OrderStatusGraphQL.CONFIRMED]: OrderStatus.CONFIRMED,
  };

  const mappedStatus = statusMap[graphqlStatus];

  if (!mappedStatus) {
    throw new Error(`Invalid order status: ${graphqlStatus}`);
  }

  return mappedStatus;
}

/**
 * Maps workspace entity OrderStatus enum to GraphQL OrderStatus enum
 */
export function mapEntityOrderStatusToGraphQL(
  entityStatus: OrderStatus,
): OrderStatusGraphQL {
  const statusMap: Record<OrderStatus, OrderStatusGraphQL> = {
    [OrderStatus.PAID]: OrderStatusGraphQL.PAID,
    [OrderStatus.CANCELLED]: OrderStatusGraphQL.CANCELLED,
    [OrderStatus.PROCESSING]: OrderStatusGraphQL.PROCESSING,
    [OrderStatus.COMPLETED]: OrderStatusGraphQL.COMPLETED,
    [OrderStatus.TRIAL]: OrderStatusGraphQL.TRIAL,
    [OrderStatus.LOCKED]: OrderStatusGraphQL.LOCKED,
    [OrderStatus.DRAFT]: OrderStatusGraphQL.DRAFT,
    [OrderStatus.CONFIRMED]: OrderStatusGraphQL.CONFIRMED,
  };

  const mappedStatus = statusMap[entityStatus];

  if (!mappedStatus) {
    throw new Error(`Invalid entity order status: ${entityStatus}`);
  }

  return mappedStatus;
}
