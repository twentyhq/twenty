import { EllipsisDisplay } from '@ui/primitives/data-display/EllipsisDisplay/EllipsisDisplay';

type NumberDisplayProps = {
  value: string | number | null | undefined;
  decimals?: number;
};

export const NumberDisplay = ({ value }: NumberDisplayProps) => (
  <EllipsisDisplay>{value}</EllipsisDisplay>
);
