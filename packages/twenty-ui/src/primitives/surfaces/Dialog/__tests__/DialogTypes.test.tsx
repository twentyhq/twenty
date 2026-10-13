import { type Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { createRef } from 'react';
import { expectTypeOf, it } from 'vitest';

import {
  Dialog,
  type DialogBackdropProps,
  type DialogBackdropState,
  type DialogHandle,
  type DialogPopupProps,
  type DialogPopupState,
  type DialogPortalProps,
  type DialogPortalState,
  type DialogRootActions,
  type DialogRootChangeEventDetails,
  type DialogRootChangeEventReason,
  type DialogRootProps,
  type DialogViewportProps,
  type DialogViewportState,
} from '@ui/primitives/surfaces';

it('keeps native handlers, refs, and render state on each composed part', () => {
  const portalProps: DialogPortalProps = {
    container: createRef<HTMLElement | ShadowRoot>(),
    keepMounted: true,
    ref: createRef<HTMLDivElement>(),
    onClick: (event) => {
      expectTypeOf(event.currentTarget).toEqualTypeOf<
        EventTarget & HTMLDivElement
      >();
      event.preventBaseUIHandler();
    },
    render: (elementProps, state) => {
      expectTypeOf(state).toEqualTypeOf<DialogPortalState>();
      return <section {...elementProps} />;
    },
  };
  const backdropProps: DialogBackdropProps = {
    forceRender: true,
    ref: (element) => {
      expectTypeOf(element).toEqualTypeOf<HTMLDivElement | null>();
    },
    className: (state) => {
      expectTypeOf(state).toEqualTypeOf<DialogBackdropState>();
      return state.open ? 'open' : undefined;
    },
    style: (state) => ({ opacity: state.open ? 1 : 0 }),
  };
  const viewportProps: DialogViewportProps = {
    ref: createRef<HTMLDivElement>(),
    onScroll: (event) => {
      expectTypeOf(event.currentTarget).toEqualTypeOf<
        EventTarget & HTMLDivElement
      >();
    },
    render: (elementProps, state) => {
      expectTypeOf(state).toEqualTypeOf<DialogViewportState>();
      return <section {...elementProps} data-nested={state.nested} />;
    },
  };

  <Dialog.Root>
    <Dialog.Portal {...portalProps}>
      <Dialog.Backdrop {...backdropProps} />
      <Dialog.Viewport {...viewportProps} />
    </Dialog.Portal>
  </Dialog.Root>;
});

it('infers payloads from handles and retains root actions and change details', () => {
  const payload = { recordId: 'record-id' };
  const handle: DialogHandle<typeof payload> =
    Dialog.createHandle<typeof payload>();
  const constructedHandle: DialogHandle<typeof payload> = new Dialog.Handle<
    typeof payload
  >();
  const rootProps: DialogRootProps<typeof payload> = {
    handle,
    actionsRef: createRef<DialogRootActions>(),
    onOpenChange: (open, details) => {
      expectTypeOf(open).toEqualTypeOf<boolean>();
      expectTypeOf(details).toEqualTypeOf<DialogRootChangeEventDetails>();
      expectTypeOf(details.reason).toEqualTypeOf<DialogRootChangeEventReason>();
      details.cancel();
      details.preventUnmountOnClose();
    },
  };

  expectTypeOf(handle.openWithPayload)
    .parameter(0)
    .toEqualTypeOf<typeof payload>();
  expectTypeOf(constructedHandle.open)
    .parameter(0)
    .toEqualTypeOf<string | null>();
  expectTypeOf<DialogRootActions>().toEqualTypeOf<DialogPrimitive.Root.Actions>();

  <Dialog.Trigger handle={handle} payload={payload} />;
  <Dialog.Root {...rootProps}>
    {({ payload: activePayload }) => {
      expectTypeOf(activePayload).toEqualTypeOf<typeof payload | undefined>();
      return null;
    }}
  </Dialog.Root>;
});

it('keeps popup focus and render contracts separate from assembly props', () => {
  expectTypeOf<DialogPopupProps>().not.toHaveProperty('container');
  expectTypeOf<DialogPopupProps>().not.toHaveProperty('keepMounted');
  expectTypeOf<DialogPopupProps>().not.toHaveProperty('backdrop');
  expectTypeOf<DialogPopupProps>().not.toHaveProperty('viewportProps');

  <Dialog.Popup
    ref={createRef<HTMLDivElement>()}
    size="fullscreen"
    initialFocus={(interactionType) => {
      expectTypeOf(interactionType).toEqualTypeOf<
        'mouse' | 'touch' | 'pen' | 'keyboard' | ''
      >();
      return false;
    }}
    finalFocus={createRef<HTMLButtonElement>()}
    render={(elementProps, state) => {
      expectTypeOf(state).toEqualTypeOf<DialogPopupState>();
      return <section {...elementProps} />;
    }}
  />;
});
