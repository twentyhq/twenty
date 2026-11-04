import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useEffect, type RefObject } from 'react';

type DatePickerSelectLifecycleEffectProps = {
  isOpenRef: RefObject<boolean>;
  onOpenChange?: (open: boolean) => void;
};

export const DatePickerSelectLifecycleEffect = ({
  isOpenRef,
  onOpenChange,
}: DatePickerSelectLifecycleEffectProps) => {
  const changeOpen = useStableCallback(onOpenChange);

  useEffect(() => {
    return () => {
      if (!isOpenRef.current) {
        return;
      }

      isOpenRef.current = false;
      changeOpen(false);
    };
  }, [isOpenRef, changeOpen]);

  return null;
};
