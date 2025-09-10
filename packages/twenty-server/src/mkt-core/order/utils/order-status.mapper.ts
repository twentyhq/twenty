import { OrderStatus } from 'src/mkt-core/order/constants/order-status.constants';
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
    [OrderStatusGraphQL.ON_HOLD]: OrderStatus.ON_HOLD,
    [OrderStatusGraphQL.PAID]: OrderStatus.PAID,
    [OrderStatusGraphQL.FAILED]: OrderStatus.FAILED,
    [OrderStatusGraphQL.CANCELLED]: OrderStatus.CANCELLED,
    [OrderStatusGraphQL.FULFILLED]: OrderStatus.FULFILLED,
    [OrderStatusGraphQL.EXPIRED]: OrderStatus.EXPIRED,
    [OrderStatusGraphQL.PROCESSING]: OrderStatus.PROCESSING,
    [OrderStatusGraphQL.COMPLETED]: OrderStatus.COMPLETED,
    [OrderStatusGraphQL.REFUNDED]: OrderStatus.REFUNDED,
    [OrderStatusGraphQL.DISPUTED]: OrderStatus.DISPUTED,
    [OrderStatusGraphQL.OTHER]: OrderStatus.OTHER,
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
    [OrderStatus.ON_HOLD]: OrderStatusGraphQL.ON_HOLD,
    [OrderStatus.PAID]: OrderStatusGraphQL.PAID,
    [OrderStatus.FAILED]: OrderStatusGraphQL.FAILED,
    [OrderStatus.CANCELLED]: OrderStatusGraphQL.CANCELLED,
    [OrderStatus.FULFILLED]: OrderStatusGraphQL.FULFILLED,
    [OrderStatus.EXPIRED]: OrderStatusGraphQL.EXPIRED,
    [OrderStatus.PROCESSING]: OrderStatusGraphQL.PROCESSING,
    [OrderStatus.COMPLETED]: OrderStatusGraphQL.COMPLETED,
    [OrderStatus.REFUNDED]: OrderStatusGraphQL.REFUNDED,
    [OrderStatus.DISPUTED]: OrderStatusGraphQL.DISPUTED,
    [OrderStatus.OTHER]: OrderStatusGraphQL.OTHER,
  };

  const mappedStatus = statusMap[entityStatus];

  if (!mappedStatus) {
    throw new Error(`Invalid entity order status: ${entityStatus}`);
  }

  return mappedStatus;
}
