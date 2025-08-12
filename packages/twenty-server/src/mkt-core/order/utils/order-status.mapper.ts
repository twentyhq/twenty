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
    [OrderStatusGraphQL.PAID]: OrderStatus.PAID,
    [OrderStatusGraphQL.FAILED]: OrderStatus.FAILED,
    [OrderStatusGraphQL.CANCELLED]: OrderStatus.CANCELLED,
    [OrderStatusGraphQL.FULFILLED]: OrderStatus.FULFILLED,
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
    [OrderStatus.PAID]: OrderStatusGraphQL.PAID,
    [OrderStatus.FAILED]: OrderStatusGraphQL.FAILED,
    [OrderStatus.CANCELLED]: OrderStatusGraphQL.CANCELLED,
    [OrderStatus.FULFILLED]: OrderStatusGraphQL.FULFILLED,
  };

  const mappedStatus = statusMap[entityStatus];

  if (!mappedStatus) {
    throw new Error(`Invalid entity order status: ${entityStatus}`);
  }

  return mappedStatus;
}
