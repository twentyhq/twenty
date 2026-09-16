import { EllipsisDisplay } from '@ui/primitives/data-display/EllipsisDisplay/EllipsisDisplay';

type JsonDisplayProps = {
  text: string;
  maxWidth?: number;
};

export const JsonDisplay = ({ text, maxWidth }: JsonDisplayProps) => (
  <EllipsisDisplay maxWidth={maxWidth}>{text}</EllipsisDisplay>
);
