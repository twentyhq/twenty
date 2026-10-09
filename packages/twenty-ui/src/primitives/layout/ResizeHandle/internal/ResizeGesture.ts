export type ResizeGesture = {
  pointerId: number;
  target: HTMLDivElement;
  axis: 'x' | 'y';
  startPosition: number;
  startValue: number;
  currentValue: number;
  multiplier: number;
  threshold: number;
  hasStarted: boolean;
  removeEscapeKeyListener: () => void;
};
