export type MarkerServer = {
  markerUrl: (name: string) => string;
  hasMarker: (markerUrl: string) => boolean;
  readMarker: (markerUrl: string) => string;
  clearMarker: (markerUrl: string) => void;
  close: () => Promise<void>;
};
