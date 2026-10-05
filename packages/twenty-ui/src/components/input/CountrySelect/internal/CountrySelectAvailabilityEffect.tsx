import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useEffect } from 'react';

type CountrySelectAvailabilityEffectProps = {
  disabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CountrySelectAvailabilityEffect = ({
  disabled,
  open,
  onOpenChange,
}: CountrySelectAvailabilityEffectProps) => {
  const changeOpen = useStableCallback(onOpenChange);

  useEffect(() => {
    if (!disabled || !open) {
      return;
    }

    changeOpen(false);
  }, [disabled, open, changeOpen]);

  return null;
};
