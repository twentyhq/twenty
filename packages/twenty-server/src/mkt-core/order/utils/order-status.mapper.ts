import { OrderStatusGraphQL } from 'src/mkt-core/order/graphql/order-status.enum';
import { OrderStatus } from 'src/mkt-core/order/constants/order-status.constants';

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
    [OrderStatusGraphQL.PENDING]: OrderStatus.PENDING,
    [OrderStatusGraphQL.CONFIRMED]: OrderStatus.CONFIRMED,
    [OrderStatusGraphQL.SHIPPING]: OrderStatus.SHIPPING,
    [OrderStatusGraphQL.DELIVERED]: OrderStatus.DELIVERED,
    [OrderStatusGraphQL.CANCELLED]: OrderStatus.CANCELLED,
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
    [OrderStatus.PENDING]: OrderStatusGraphQL.PENDING,
    [OrderStatus.CONFIRMED]: OrderStatusGraphQL.CONFIRMED,
    [OrderStatus.SHIPPING]: OrderStatusGraphQL.SHIPPING,
    [OrderStatus.DELIVERED]: OrderStatusGraphQL.DELIVERED,
    [OrderStatus.CANCELLED]: OrderStatusGraphQL.CANCELLED,
  };

  const mappedStatus = statusMap[entityStatus];

  if (!mappedStatus) {
    throw new Error(`Invalid entity order status: ${entityStatus}`);
  }

  return mappedStatus;
}
