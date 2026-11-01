export type SyntheticLikeEvent = Event & {
  nativeEvent: unknown;
  preventBaseUIHandler?: () => void;
  baseUIHandlerPrevented?: boolean;
};
