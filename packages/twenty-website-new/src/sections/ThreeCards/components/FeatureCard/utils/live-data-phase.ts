type AliceReturnPhase = 'return-to-start';
type BobLiveDataPhase =
  | 'bob-ready'
  | 'move-to-filter'
  | 'remove-filter'
  | 'return-bob';

export type LiveDataPhase =
  | 'idle'
  | 'move-to-tag'
  | 'rename-tag'
  | AliceReturnPhase
  | BobLiveDataPhase
  | 'settle';
