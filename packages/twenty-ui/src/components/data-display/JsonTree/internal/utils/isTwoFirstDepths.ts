import { type ShouldExpandNodeInitiallyProps } from '@ui/components/data-display/JsonTree/types/ShouldExpandNodeInitiallyProps';

export const isTwoFirstDepths = ({ depth }: ShouldExpandNodeInitiallyProps) =>
  depth <= 1;
