export type ToasterLifecycleExampleProps = {
  duration?: number;
  hasIndependentProvider?: boolean;
  hasSlowMirrorExit?: boolean;
  hasUnrelatedNotificationActions?: boolean;
  onClose?: (notification: string) => void;
};
