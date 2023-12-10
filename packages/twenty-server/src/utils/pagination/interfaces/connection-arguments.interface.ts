export interface IConnectionArguments {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

export type ConnectionArgumentsUnion =
  | ForwardPaginationArguments
  | BackwardPaginationArguments
  | NoPaginationArguments;

export type ForwardPaginationArguments = { first: number; after?: string };
export type BackwardPaginationArguments = { last: number; before?: string };
export type NoPaginationArguments = Record<string, unknown>;
