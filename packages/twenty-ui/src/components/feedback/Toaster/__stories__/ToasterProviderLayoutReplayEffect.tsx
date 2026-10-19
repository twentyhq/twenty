import { useLayoutEffect } from 'react';

import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';

import { type ToasterLifecycleExampleProps } from './ToasterLifecycleExampleProps';

type ToasterProviderLayoutReplayEffectProps = Pick<
  ToasterLifecycleExampleProps,
  'onClose'
>;

export const ToasterProviderLayoutReplayEffect = ({
  onClose,
}: ToasterProviderLayoutReplayEffectProps) => {
  const { enqueueToast, closeToast } = useToast();

  useLayoutEffect(() => {
    const id = enqueueToast({
      children: 'Layout effect notification',
      duration: 0,
      onClose: () => onClose?.(id),
    });

    return () => closeToast(id);
  }, [enqueueToast, closeToast, onClose]);

  return null;
};
