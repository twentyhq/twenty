import {
  BackwardPaginationArguments,
  ConnectionArgumentsUnion,
  ForwardPaginationArguments,
} from 'src/utils/pagination/interfaces/connection-arguments.interface';

export function isForwardPagination(
  args: ConnectionArgumentsUnion,
): args is ForwardPaginationArguments {
  return 'first' in args && args.first != null;
}

export function isBackwardPagination(
  args: ConnectionArgumentsUnion,
): args is BackwardPaginationArguments {
  return 'last' in args && args.last != null;
}
