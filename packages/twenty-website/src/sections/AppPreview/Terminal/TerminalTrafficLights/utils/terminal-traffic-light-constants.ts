export const TRAFFIC_LIGHT_DOT_SIZE = 12;
export const TRAFFIC_LIGHT_GAP = 8;
export const TRAFFIC_LIGHT_COUNT = 3;
export const DEFAULT_TRAFFIC_LIGHT_HORIZONTAL_INSET = 6;
export const TRAFFIC_LIGHTS_ESCAPE_EVENT = 'twenty-traffic-lights-escape';

export const createTrafficLightReturnState = (): boolean[] =>
  Array.from({ length: TRAFFIC_LIGHT_COUNT }, () => false);
