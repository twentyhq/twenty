import { useEffect } from 'react';

import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';

import { type ToasterLifecycleExampleProps } from './ToasterLifecycleExampleProps';

type ToasterProviderPassiveReplayEffectProps = Pick<
  ToasterLifecycleExampleProps,
  'onClose'
>;

export const ToasterProviderPassiveReplayEffect = ({
  onClose,
}: ToasterProviderPassiveReplayEffectProps) => {
  const { enqueueToast, closeToast } = useToast();

  useEffect(() => {
    const id = enqueueToast({
      children: 'Passive effect notification',
      duration: 0,
      onClose: () => onClose?.(id),
    });

    return () => closeToast(id);
  }, [enqueueToast, closeToast, onClose]);

  return null;
};
