import {
  ConnectionArgumentsUnion,
  IConnectionArguments,
} from 'src/utils/pagination/interfaces/connection-arguments.interface';

export function validateArgs(
  args: IConnectionArguments,
): args is ConnectionArgumentsUnion {
  // Only one of `first` and `last` / `after` and `before` can be set
  if (args.first != null && args.last != null) {
    throw new Error('Only one of "first" and "last" can be set');
  }

  if (args.after != null && args.before != null) {
    throw new Error('Only one of "after" and "before" can be set');
  }

  // If `after` is set, `first` has to be set
  if (args.after != null && args.first == null) {
    throw new Error('"after" needs to be used with "first"');
  }

  // If `before` is set, `last` has to be set
  if (args.before != null && args.last == null) {
    throw new Error('"before" needs to be used with "last"');
  }

  // `first` and `last` have to be positive
  if (args.first != null && args.first <= 0) {
    throw new Error('"first" has to be positive');
  }

  if (args.last != null && args.last <= 0) {
    throw new Error('"last" has to be positive');
  }

  return true;
}
