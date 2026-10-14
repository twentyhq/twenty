import { useState } from 'react';

import { useToast } from '@ui/components/feedback/Toast/hooks/useToast';
import { IconBell, IconSquareRoundedCheck } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { type ToasterUpdateExampleProps } from './ToasterUpdateExampleProps';

export const ToastUpdateControls = ({
  onAction,
  onCancel,
  onClose,
  onUpdatedAction,
  onUpdatedCancel,
  onUpdatedClose,
}: ToasterUpdateExampleProps) => {
  const { enqueueToast, updateToast, closeToast } = useToast();
  const [toastId, setToastId] = useState('');
  const [revision, setRevision] = useState(1);

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        backgroundColor: 'var(--t-background-primary)',
        color: 'var(--t-font-color-primary)',
      }}
    >
      <Button
        onClick={() =>
          setToastId(
            enqueueToast({
              children: <strong>Draft notification</strong>,
              description: <span>Editing the draft</span>,
              status: 'info',
              progress: 25,
              icon: <IconBell aria-label="Draft notification icon" />,
              iconLabel: 'Default feedback icon',
              action: <Button onClick={onAction}>Open draft</Button>,
              cancelLabel: <span>Cancel draft</span>,
              closeLabel: 'Dismiss draft',
              onCancel,
              onClose,
            }),
          )
        }
      >
        Add editable notification
      </Button>
      <Button
        onClick={() =>
          enqueueToast({ children: 'Following notification', progress: 100 })
        }
      >
        Add following notification
      </Button>
      <Button
        onClick={() => {
          updateToast({
            id: toastId,
            children: <strong>{`Draft update ${revision}`}</strong>,
          });
          setRevision(revision + 1);
        }}
      >
        Update content
      </Button>
      <Button
        onClick={() =>
          updateToast({
            id: toastId,
            children: <strong>Saved notification</strong>,
            description: <span>Synced with the workspace</span>,
            status: 'success',
            progress: 100,
            icon: (
              <IconSquareRoundedCheck aria-label="Saved notification icon" />
            ),
            action: (
              <Button onClick={onUpdatedAction}>Open saved record</Button>
            ),
            cancelLabel: <span>Revert save</span>,
            closeLabel: 'Dismiss saved record',
            onCancel: onUpdatedCancel,
            onClose: onUpdatedClose,
          })
        }
      >
        Update actions
      </Button>
      <Button onClick={() => updateToast({ id: toastId, cancelLabel: null })}>
        Clear cancel label
      </Button>
      <Button
        onClick={() =>
          updateToast({
            id: toastId,
            description: null,
            icon: null,
            action: null,
            cancelLabel: null,
            onCancel: undefined,
            onClose: undefined,
          })
        }
      >
        Clear optional content
      </Button>
      <Button
        onClick={() =>
          updateToast({
            id: toastId,
            status: undefined,
            icon: undefined,
            cancelLabel: undefined,
            closeLabel: undefined,
            onCancel: onUpdatedCancel,
          })
        }
      >
        Restore defaults
      </Button>
      <Button
        onClick={() =>
          updateToast({
            id: 'missing-notification',
            children: 'Unexpected notification',
          })
        }
      >
        Update unknown notification
      </Button>
      <Button
        onClick={() => {
          closeToast(toastId);
          updateToast({
            id: toastId,
            children: 'Dismissed notification updated',
          });
        }}
      >
        Dismiss and update notification
      </Button>
      <Button
        onClick={() =>
          updateToast({
            id: toastId,
            children: 'Dismissed notification updated',
          })
        }
      >
        Update dismissed notification
      </Button>
      <Text role="note" aria-label="Editable notification ID">
        {toastId}
      </Text>
    </div>
  );
};
