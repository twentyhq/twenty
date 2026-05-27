export interface HourglassSettings {
  lighting: {
    intensity: number;
    fillIntensity: number;
    ambientIntensity: number;
    angleDegrees: number;
    height: number;
  };
  material: {
    roughness: number;
    metalness: number;
  };
  halftone: {
    enabled: boolean;
    numRows: number;
    contrast: number;
    power: number;
    shading: number;
    baseInk: number;
    maxBar: number;
    rowMerge: number;
    cellRatio: number;
    cutoff: number;
    highlightOpen: number;
    shadowGrouping: number;
    shadowCrush: number;
    dashColor: string;
  };
  background: {
    color: string;
  };
  animation: {
    autoRotateEnabled: boolean;
    followHoverEnabled: boolean;
    followDragEnabled: boolean;
    rotateEnabled: boolean;
    autoSpeed: number;
    autoWobble: number;
    hoverRange: number;
    hoverEase: number;
    hoverReturn: boolean;
    dragSens: number;
    dragFriction: number;
    dragMomentum: boolean;
    rotateAxis: 'x' | 'y' | 'z' | 'xy' | '-x' | '-y' | '-z' | '-xy';
    rotatePreset: 'axis' | 'lissajous' | 'orbit' | 'tumble';
    rotateSpeed: number;
    rotatePingPong: boolean;
    waveEnabled: boolean;
    waveSpeed: number;
    waveAmount: number;
  };
}
