import { useEffect } from 'react';

type DropdownNestedRootEffectProps = {
  open: boolean;
  registerOpenNestedRoot?: () => () => void;
};

export const DropdownNestedRootEffect = ({
  open,
  registerOpenNestedRoot,
}: DropdownNestedRootEffectProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    return registerOpenNestedRoot?.();
  }, [open, registerOpenNestedRoot]);

  return null;
};
