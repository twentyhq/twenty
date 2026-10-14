import { type ToasterExampleProps } from './ToasterExampleProps';

export type ToasterUpdateExampleProps = ToasterExampleProps & {
  onAction?: () => void;
  onCancel?: () => void;
  onUpdatedAction?: () => void;
  onUpdatedCancel?: () => void;
  onUpdatedClose?: () => void;
};
