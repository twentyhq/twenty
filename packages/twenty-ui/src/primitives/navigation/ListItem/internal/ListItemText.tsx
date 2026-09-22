import { isFunction } from '@sniptt/guards';

import { OverflowingTextWithTooltip } from '@ui/primitives/surfaces/OverflowingTextWithTooltip/OverflowingTextWithTooltip';

type ListItemTextProps = {
  text: string;
};

export const ListItemText = ({ text }: ListItemTextProps) => {
  const isWorkerWindow =
    typeof window !== 'undefined' && !isFunction(window.Window);

  if (isWorkerWindow) {
    return <span title={text}>{text}</span>;
  }

  return <OverflowingTextWithTooltip text={text} />;
};
