import { OverflowingTextWithTooltip } from 'src/display';

import { EllipsisDisplay } from './EllipsisDisplay';

type TextDisplayProps = {
  text: string;
  maxWidth?: number;
};

export const TextDisplay = ({ text, maxWidth }: TextDisplayProps) => (
  <EllipsisDisplay maxWidth={maxWidth}>
    <OverflowingTextWithTooltip text={text} />
  </EllipsisDisplay>
);
