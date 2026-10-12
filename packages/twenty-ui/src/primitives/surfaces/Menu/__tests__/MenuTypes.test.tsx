import { type Menu as MenuPrimitive } from '@base-ui/react/menu';
import { createRef } from 'react';
import { expectTypeOf, it } from 'vitest';

import {
  Menu,
  type MenuAlign,
  type MenuArrowProps,
  type MenuArrowState,
  type MenuBackdropProps,
  type MenuBackdropState,
  type MenuCheckboxItemChangeEventDetails,
  type MenuCheckboxItemChangeEventReason,
  type MenuCheckboxItemIndicatorProps,
  type MenuCheckboxItemIndicatorState,
  type MenuCheckboxItemProps,
  type MenuCheckboxItemState,
  type MenuGroupLabelProps,
  type MenuGroupLabelState,
  type MenuGroupProps,
  type MenuGroupState,
  type MenuHandle,
  type MenuItemProps,
  type MenuItemState,
  type MenuLinkItemProps,
  type MenuLinkItemState,
  type MenuPopupProps,
  type MenuPopupState,
  type MenuPortalProps,
  type MenuPortalState,
  type MenuPositionerProps,
  type MenuPositionerState,
  type MenuRadioGroupChangeEventDetails,
  type MenuRadioGroupChangeEventReason,
  type MenuRadioGroupProps,
  type MenuRadioGroupState,
  type MenuRadioItemIndicatorProps,
  type MenuRadioItemIndicatorState,
  type MenuRadioItemProps,
  type MenuRadioItemState,
  type MenuRootActions,
  type MenuRootChangeEventDetails,
  type MenuRootChangeEventReason,
  type MenuRootOrientation,
  type MenuRootProps,
  type MenuRootState,
  type MenuSeparatorProps,
  type MenuSeparatorState,
  type MenuSide,
  type MenuSubmenuRootChangeEventDetails,
  type MenuSubmenuRootChangeEventReason,
  type MenuSubmenuRootProps,
  type MenuSubmenuRootState,
  type MenuSubmenuTriggerProps,
  type MenuSubmenuTriggerState,
  type MenuTriggerProps,
  type MenuTriggerState,
  type MenuViewportProps,
  type MenuViewportState,
} from '@ui/primitives/surfaces';

it('exports the installed upstream state and callback types for every part', () => {
  type PublicStates = {
    arrow: MenuArrowState;
    backdrop: MenuBackdropState;
    checkbox: MenuCheckboxItemState;
    checkboxIndicator: MenuCheckboxItemIndicatorState;
    group: MenuGroupState;
    groupLabel: MenuGroupLabelState;
    item: MenuItemState;
    link: MenuLinkItemState;
    popup: MenuPopupState;
    portal: MenuPortalState;
    positioner: MenuPositionerState;
    radioGroup: MenuRadioGroupState;
    radioItem: MenuRadioItemState;
    radioIndicator: MenuRadioItemIndicatorState;
    root: MenuRootState;
    separator: MenuSeparatorState;
    submenuRoot: MenuSubmenuRootState;
    submenuTrigger: MenuSubmenuTriggerState;
    trigger: MenuTriggerState;
    viewport: MenuViewportState;
  };
  type UpstreamStates = {
    arrow: MenuPrimitive.Arrow.State;
    backdrop: MenuPrimitive.Backdrop.State;
    checkbox: MenuPrimitive.CheckboxItem.State;
    checkboxIndicator: MenuPrimitive.CheckboxItemIndicator.State;
    group: MenuPrimitive.Group.State;
    groupLabel: MenuPrimitive.GroupLabel.State;
    item: MenuPrimitive.Item.State;
    link: MenuPrimitive.LinkItem.State;
    popup: MenuPrimitive.Popup.State;
    portal: MenuPrimitive.Portal.State;
    positioner: MenuPrimitive.Positioner.State;
    radioGroup: MenuPrimitive.RadioGroup.State;
    radioItem: MenuPrimitive.RadioItem.State;
    radioIndicator: MenuPrimitive.RadioItemIndicator.State;
    root: MenuPrimitive.Root.State;
    separator: MenuPrimitive.Separator.State;
    submenuRoot: MenuPrimitive.SubmenuRoot.State;
    submenuTrigger: MenuPrimitive.SubmenuTrigger.State;
    trigger: MenuPrimitive.Trigger.State;
    viewport: MenuPrimitive.Viewport.State;
  };

  expectTypeOf<PublicStates>().toEqualTypeOf<UpstreamStates>();
  expectTypeOf<MenuRootChangeEventDetails>().toEqualTypeOf<MenuPrimitive.Root.ChangeEventDetails>();
  expectTypeOf<MenuRootChangeEventReason>().toEqualTypeOf<MenuPrimitive.Root.ChangeEventReason>();
  expectTypeOf<MenuRootActions>().toEqualTypeOf<MenuPrimitive.Root.Actions>();
  expectTypeOf<MenuRootOrientation>().toEqualTypeOf<MenuPrimitive.Root.Orientation>();
  expectTypeOf<MenuCheckboxItemChangeEventDetails>().toEqualTypeOf<MenuPrimitive.CheckboxItem.ChangeEventDetails>();
  expectTypeOf<MenuCheckboxItemChangeEventReason>().toEqualTypeOf<MenuPrimitive.CheckboxItem.ChangeEventReason>();
  expectTypeOf<MenuRadioGroupChangeEventDetails>().toEqualTypeOf<MenuPrimitive.RadioGroup.ChangeEventDetails>();
  expectTypeOf<MenuRadioGroupChangeEventReason>().toEqualTypeOf<MenuPrimitive.RadioGroup.ChangeEventReason>();
  expectTypeOf<MenuSubmenuRootChangeEventDetails>().toEqualTypeOf<MenuPrimitive.SubmenuRoot.ChangeEventDetails>();
  expectTypeOf<MenuSubmenuRootChangeEventReason>().toEqualTypeOf<MenuPrimitive.SubmenuRoot.ChangeEventReason>();
  expectTypeOf<MenuSide>().toEqualTypeOf<
    MenuPrimitive.Positioner.Props['side'] & string
  >();
  expectTypeOf<MenuAlign>().toEqualTypeOf<
    MenuPrimitive.Positioner.Props['align'] & string
  >();
});

it('keeps public props for the full anatomy and native ref and render contracts', () => {
  const portalProps: MenuPortalProps = {
    container: createRef<HTMLElement | ShadowRoot>(),
    ref: createRef<HTMLDivElement>(),
    keepMounted: true,
    onClick: (event) => {
      expectTypeOf(event.currentTarget).toEqualTypeOf<
        EventTarget & HTMLDivElement
      >();
      event.preventBaseUIHandler();
    },
    render: (elementProps, state) => {
      expectTypeOf(state).toEqualTypeOf<MenuPortalState>();
      return <section {...elementProps} />;
    },
  };
  const positionerProps: MenuPositionerProps = {
    ref: createRef<HTMLDivElement>(),
    positionMethod: 'fixed',
    anchor: () => ({ getBoundingClientRect: () => new DOMRect(0, 0, 80, 20) }),
    side: 'inline-end',
    align: 'end',
    sideOffset: ({ side, align, anchor, positioner }) => {
      expectTypeOf(side).toEqualTypeOf<MenuSide>();
      expectTypeOf(align).toEqualTypeOf<MenuAlign>();
      return anchor.width + positioner.height;
    },
    alignOffset: ({ anchor }) => anchor.height,
    collisionBoundary: { x: 0, y: 0, width: 200, height: 100 },
    collisionPadding: { top: 1, right: 2, bottom: 3, left: 4 },
    collisionAvoidance: {
      side: 'shift',
      align: 'shift',
      fallbackAxisSide: 'end',
    },
    sticky: true,
    arrowPadding: 7,
    disableAnchorTracking: true,
    className: (state) => {
      expectTypeOf(state).toEqualTypeOf<MenuPositionerState>();
      return state.open ? 'open' : undefined;
    },
    style: (state) => ({ opacity: state.open ? 1 : 0 }),
  };
  const popupProps: MenuPopupProps = {
    ref: createRef<HTMLDivElement>(),
    finalFocus: (interactionType) => {
      expectTypeOf(interactionType).toEqualTypeOf<
        'mouse' | 'touch' | 'pen' | 'keyboard' | ''
      >();
      return false;
    },
    render: (elementProps, state) => {
      expectTypeOf(state).toEqualTypeOf<MenuPopupState>();
      return <section {...elementProps} />;
    },
  };
  const itemProps: MenuItemProps = {
    ref: createRef<HTMLElement>(),
    nativeButton: true,
    description: 'Details',
    shortcut: ['Ctrl', 'Enter'],
    onClick: (event) => event.preventBaseUIHandler(),
    render: (elementProps, state) => {
      expectTypeOf(state).toEqualTypeOf<MenuItemState>();
      return <button {...elementProps} />;
    },
  };
  const linkProps: MenuLinkItemProps = {
    href: '/records',
    target: '_blank',
    ref: createRef<HTMLAnchorElement>(),
    render: (elementProps, state) => {
      expectTypeOf(state).toEqualTypeOf<MenuLinkItemState>();
      return <a {...elementProps} aria-label="Records" />;
    },
  };
  const arrowProps: MenuArrowProps = { ref: createRef<HTMLDivElement>() };
  const backdropProps: MenuBackdropProps = { ref: createRef<HTMLDivElement>() };
  const viewportProps: MenuViewportProps = { ref: createRef<HTMLDivElement>() };
  const checkboxProps: MenuCheckboxItemProps = {
    defaultChecked: true,
    onCheckedChange: (checked, details) => {
      expectTypeOf(checked).toEqualTypeOf<boolean>();
      expectTypeOf(details).toEqualTypeOf<MenuCheckboxItemChangeEventDetails>();
      details.cancel();
    },
  };
  const checkboxIndicatorProps: MenuCheckboxItemIndicatorProps = {
    keepMounted: true,
  };
  const radioGroupProps: MenuRadioGroupProps = {
    defaultValue: { recordId: 'record-id' },
  };
  const radioItemProps: MenuRadioItemProps = {
    value: { recordId: 'record-id' },
  };
  const radioIndicatorProps: MenuRadioItemIndicatorProps = {
    keepMounted: true,
  };
  const groupProps: MenuGroupProps = { ref: createRef<HTMLDivElement>() };
  const groupLabelProps: MenuGroupLabelProps = {
    ref: createRef<HTMLDivElement>(),
  };
  const separatorProps: MenuSeparatorProps = { orientation: 'vertical' };
  const submenuRootProps: MenuSubmenuRootProps = { closeParentOnEsc: true };
  const submenuTriggerProps: MenuSubmenuTriggerProps = { openOnHover: false };

  <Menu.Root>
    <Menu.Portal {...portalProps}>
      <Menu.Backdrop {...backdropProps} />
      <Menu.Positioner {...positionerProps}>
        <Menu.Popup {...popupProps}>
          <Menu.Arrow {...arrowProps} />
          <Menu.Viewport {...viewportProps}>
            <Menu.Group {...groupProps}>
              <Menu.GroupLabel {...groupLabelProps} />
              <Menu.Item {...itemProps} />
              <Menu.LinkItem {...linkProps} />
              <Menu.CheckboxItem {...checkboxProps}>
                <Menu.CheckboxItemIndicator {...checkboxIndicatorProps} />
              </Menu.CheckboxItem>
              <Menu.RadioGroup {...radioGroupProps}>
                <Menu.RadioItem {...radioItemProps}>
                  <Menu.RadioItemIndicator {...radioIndicatorProps} />
                </Menu.RadioItem>
              </Menu.RadioGroup>
              <Menu.Separator {...separatorProps} />
              <Menu.SubmenuRoot {...submenuRootProps}>
                <Menu.SubmenuTrigger {...submenuTriggerProps} />
              </Menu.SubmenuRoot>
            </Menu.Group>
          </Menu.Viewport>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>;

  expectTypeOf<MenuPopupProps>().not.toHaveProperty('container');
  expectTypeOf<MenuPopupProps>().not.toHaveProperty('keepMounted');
  expectTypeOf<MenuPopupProps>().not.toHaveProperty('sideOffset');
  expectTypeOf<MenuPopupProps>().not.toHaveProperty('collisionBoundary');
});

it('retains payload inference for detached triggers, handles and render children', () => {
  const payload = { recordId: 'record-id' };
  const handle: MenuHandle<typeof payload> =
    Menu.createHandle<typeof payload>();
  const constructedHandle: MenuHandle<typeof payload> = new Menu.Handle<
    typeof payload
  >();
  const triggerProps: MenuTriggerProps<typeof payload> = {
    handle,
    payload,
  };
  const rootProps: MenuRootProps<typeof payload> = {
    handle,
    actionsRef: createRef<MenuRootActions>(),
    onOpenChange: (open, details) => {
      expectTypeOf(open).toEqualTypeOf<boolean>();
      expectTypeOf(details).toEqualTypeOf<MenuRootChangeEventDetails>();
      details.cancel();
      details.preventUnmountOnClose();
      details.allowPropagation();
    },
  };

  expectTypeOf(handle.open).parameter(0).toEqualTypeOf<string>();
  expectTypeOf(constructedHandle.isOpen).toEqualTypeOf<boolean>();
  <Menu.Trigger {...triggerProps} ref={createRef<HTMLButtonElement>()} />;
  <Menu.Root {...rootProps}>
    {({ payload: activePayload }) => {
      expectTypeOf(activePayload).toEqualTypeOf<typeof payload | undefined>();
      return null;
    }}
  </Menu.Root>;
});
