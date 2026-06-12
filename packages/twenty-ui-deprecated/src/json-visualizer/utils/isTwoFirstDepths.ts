import { type ShouldExpandNodeInitiallyProps } from '@ui/json-visualizer/contexts/JsonTreeContext';

export const isTwoFirstDepths = ({ depth }: ShouldExpandNodeInitiallyProps) =>
  depth <= 1;
