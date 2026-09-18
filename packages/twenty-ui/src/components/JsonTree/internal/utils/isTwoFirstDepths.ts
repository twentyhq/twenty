import { type ShouldExpandNodeInitiallyProps } from '@ui/components/JsonTree/types/ShouldExpandNodeInitiallyProps';

export const isTwoFirstDepths = ({ depth }: ShouldExpandNodeInitiallyProps) =>
  depth <= 1;
