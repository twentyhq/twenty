import { type Select as SelectPrimitive } from '@base-ui/react/select';
import { createRef, type ComponentPropsWithRef } from 'react';
import { expectTypeOf, it } from 'vitest';

import {
  Select,
  type SelectArrowProps,
  type SelectArrowState,
  type SelectBackdropProps,
  type SelectBackdropState,
  type SelectGroupLabelProps,
  type SelectGroupLabelState,
  type SelectGroupProps,
  type SelectGroupState,
  type SelectIconProps,
  type SelectIconState,
  type SelectItemIndicatorProps,
  type SelectItemIndicatorState,
  type SelectItemProps,
  type SelectItemState,
  type SelectItemTextProps,
  type SelectItemTextState,
  type SelectLabelProps,
  type SelectLabelState,
  type SelectListProps,
  type SelectListState,
  type SelectPopupProps,
  type SelectPopupState,
  type SelectPortalProps,
  type SelectPortalState,
  type SelectPositionerProps,
  type SelectPositionerState,
  type SelectRootActions,
  type SelectRootChangeEventDetails,
  type SelectRootChangeEventReason,
  type SelectRootProps,
  type SelectRootState,
  type SelectScrollDownArrowProps,
  type SelectScrollDownArrowState,
  type SelectScrollUpArrowProps,
  type SelectScrollUpArrowState,
  type SelectSeparatorProps,
  type SelectSeparatorState,
  type SelectTriggerProps,
  type SelectTriggerState,
  type SelectValueProps,
  type SelectValueState,
} from '@ui/primitives/input';

it('exports the complete installed part props and state contracts', () => {
  expectTypeOf<SelectRootProps<string>>().toEqualTypeOf<
    SelectPrimitive.Root.Props<string>
  >();
  expectTypeOf<SelectRootProps<string, true>>().toEqualTypeOf<
    SelectPrimitive.Root.Props<string, true>
  >();
  expectTypeOf<SelectRootProps<string, boolean | undefined>>().toEqualTypeOf<
    SelectPrimitive.Root.Props<string, boolean | undefined>
  >();
  expectTypeOf<SelectLabelProps>().toEqualTypeOf<SelectPrimitive.Label.Props>();
  expectTypeOf<
    Omit<SelectTriggerProps, 'size'>
  >().toEqualTypeOf<SelectPrimitive.Trigger.Props>();
  expectTypeOf<SelectValueProps>().toEqualTypeOf<SelectPrimitive.Value.Props>();
  expectTypeOf<SelectIconProps>().toEqualTypeOf<SelectPrimitive.Icon.Props>();
  expectTypeOf<SelectPortalProps>().toEqualTypeOf<SelectPrimitive.Portal.Props>();
  expectTypeOf<SelectBackdropProps>().toEqualTypeOf<SelectPrimitive.Backdrop.Props>();
  expectTypeOf<SelectPositionerProps>().toEqualTypeOf<SelectPrimitive.Positioner.Props>();
  expectTypeOf<SelectPopupProps>().toEqualTypeOf<SelectPrimitive.Popup.Props>();
  expectTypeOf<SelectListProps>().toEqualTypeOf<SelectPrimitive.List.Props>();
  expectTypeOf<SelectItemProps>().toEqualTypeOf<
    ComponentPropsWithRef<typeof SelectPrimitive.Item>
  >();
  expectTypeOf<SelectItemTextProps>().toEqualTypeOf<SelectPrimitive.ItemText.Props>();
  expectTypeOf<SelectItemIndicatorProps>().toEqualTypeOf<SelectPrimitive.ItemIndicator.Props>();
  expectTypeOf<SelectArrowProps>().toEqualTypeOf<SelectPrimitive.Arrow.Props>();
  expectTypeOf<SelectScrollUpArrowProps>().toEqualTypeOf<SelectPrimitive.ScrollUpArrow.Props>();
  expectTypeOf<SelectScrollDownArrowProps>().toEqualTypeOf<SelectPrimitive.ScrollDownArrow.Props>();
  expectTypeOf<SelectGroupProps>().toEqualTypeOf<SelectPrimitive.Group.Props>();
  expectTypeOf<SelectGroupLabelProps>().toEqualTypeOf<SelectPrimitive.GroupLabel.Props>();
  expectTypeOf<SelectSeparatorProps>().toEqualTypeOf<SelectPrimitive.Separator.Props>();

  expectTypeOf<SelectRootState>().toEqualTypeOf<SelectPrimitive.Root.State>();
  expectTypeOf<SelectLabelState>().toEqualTypeOf<SelectPrimitive.Label.State>();
  expectTypeOf<SelectTriggerState>().toEqualTypeOf<SelectPrimitive.Trigger.State>();
  expectTypeOf<SelectValueState>().toEqualTypeOf<SelectPrimitive.Value.State>();
  expectTypeOf<SelectIconState>().toEqualTypeOf<SelectPrimitive.Icon.State>();
  expectTypeOf<SelectPortalState>().toEqualTypeOf<SelectPrimitive.Portal.State>();
  expectTypeOf<SelectBackdropState>().toEqualTypeOf<SelectPrimitive.Backdrop.State>();
  expectTypeOf<SelectPositionerState>().toEqualTypeOf<SelectPrimitive.Positioner.State>();
  expectTypeOf<SelectPopupState>().toEqualTypeOf<SelectPrimitive.Popup.State>();
  expectTypeOf<SelectListState>().toEqualTypeOf<SelectPrimitive.List.State>();
  expectTypeOf<SelectItemState>().toEqualTypeOf<SelectPrimitive.Item.State>();
  expectTypeOf<SelectItemTextState>().toEqualTypeOf<SelectPrimitive.ItemText.State>();
  expectTypeOf<SelectItemIndicatorState>().toEqualTypeOf<SelectPrimitive.ItemIndicator.State>();
  expectTypeOf<SelectArrowState>().toEqualTypeOf<SelectPrimitive.Arrow.State>();
  expectTypeOf<SelectScrollUpArrowState>().toEqualTypeOf<SelectPrimitive.ScrollUpArrow.State>();
  expectTypeOf<SelectScrollDownArrowState>().toEqualTypeOf<SelectPrimitive.ScrollDownArrow.State>();
  expectTypeOf<SelectGroupState>().toEqualTypeOf<SelectPrimitive.Group.State>();
  expectTypeOf<SelectGroupLabelState>().toEqualTypeOf<SelectPrimitive.GroupLabel.State>();
  expectTypeOf<SelectSeparatorState>().toEqualTypeOf<SelectPrimitive.Separator.State>();
});

it('preserves inferred object values and upstream change event details', () => {
  const team = { identifier: 'sales', name: 'Sales team' };

  <Select.Root
    defaultValue={team}
    itemToStringLabel={(value) => {
      expectTypeOf(value).toEqualTypeOf<typeof team>();
      return value.name;
    }}
    onValueChange={(value, details) => {
      expectTypeOf(value).toEqualTypeOf<typeof team | null>();
      expectTypeOf(details).toEqualTypeOf<SelectRootChangeEventDetails>();
      expectTypeOf(details.reason).toEqualTypeOf<SelectRootChangeEventReason>();
      details.cancel();
      details.allowPropagation();

      if (details.reason === 'item-press') {
        expectTypeOf(details.event).toEqualTypeOf<
          MouseEvent | KeyboardEvent | PointerEvent
        >();
      }
    }}
  />;

  expectTypeOf<SelectRootActions>().toEqualTypeOf<SelectPrimitive.Root.Actions>();
  expectTypeOf<SelectRootChangeEventDetails>().toEqualTypeOf<SelectPrimitive.Root.ChangeEventDetails>();
  expectTypeOf<SelectRootChangeEventReason>().toEqualTypeOf<SelectPrimitive.Root.ChangeEventReason>();
});

it('infers array callbacks for multiple selection without adding null', () => {
  const teams = [{ identifier: 'sales', name: 'Sales team' }];

  <Select.Root
    multiple
    value={teams}
    onValueChange={(value, details) => {
      expectTypeOf(value).toEqualTypeOf<typeof teams>();
      expectTypeOf(details).toEqualTypeOf<SelectRootChangeEventDetails>();
    }}
  />;

  <Select.Root<string, true>
    multiple
    defaultValue={[]}
    onValueChange={(value) => {
      expectTypeOf(value).toEqualTypeOf<string[]>();
    }}
  />;
});

it('keeps native handlers, render state, refs and form ownership available', () => {
  const actionsRef = createRef<SelectRootActions>();
  const inputRef = createRef<HTMLInputElement>();
  const portalProps: SelectPortalProps = {
    container: createRef<HTMLElement | ShadowRoot>(),
    ref: createRef<HTMLDivElement>(),
    render: (elementProps, state) => {
      expectTypeOf(state).toEqualTypeOf<SelectPortalState>();
      return <section {...elementProps} />;
    },
  };
  const itemProps: SelectItemProps = {
    render: <button />,
    nativeButton: true,
    ref: (element) => {
      expectTypeOf(element).toEqualTypeOf<HTMLElement | null>();
    },
  };

  <Select.Root
    actionsRef={actionsRef}
    inputRef={inputRef}
    defaultValue="sales"
    id="team-select"
    name="team"
    form="team-form"
    autoComplete="organization"
    required
    readOnly
  >
    <Select.Label render={<label aria-label="Team" htmlFor="team-select" />} />
    <Select.Trigger
      ref={createRef<HTMLButtonElement>()}
      type="button"
      onClick={(event) => {
        expectTypeOf(event.currentTarget).toEqualTypeOf<
          EventTarget & HTMLButtonElement
        >();
        event.preventBaseUIHandler();
      }}
      render={(elementProps, state) => {
        expectTypeOf(state).toEqualTypeOf<SelectTriggerState>();
        return <button {...elementProps} />;
      }}
    />
    <Select.Portal {...portalProps}>
      <Select.Positioner>
        <Select.Popup
          ref={createRef<HTMLDivElement>()}
          finalFocus={(interactionType) => {
            expectTypeOf(interactionType).toEqualTypeOf<
              'mouse' | 'touch' | 'pen' | 'keyboard' | ''
            >();
            return false;
          }}
          render={(elementProps, state) => {
            expectTypeOf(state).toEqualTypeOf<SelectPopupState>();
            return <section {...elementProps} />;
          }}
        >
          <Select.Item {...itemProps} />
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>;
});

it('keeps all positioning configuration on Positioner and portaling on Portal', () => {
  const positionerProps: SelectPositionerProps = {
    anchor: () => ({
      getBoundingClientRect: () => new DOMRect(30, 40, 50, 60),
    }),
    positionMethod: 'fixed',
    side: 'inline-end',
    align: 'end',
    sideOffset: ({ side, align, anchor, positioner }) => {
      expectTypeOf(anchor).toEqualTypeOf<{ width: number; height: number }>();
      expectTypeOf(positioner).toEqualTypeOf<{
        width: number;
        height: number;
      }>();
      expectTypeOf(side).toEqualTypeOf<
        'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'
      >();
      expectTypeOf(align).toEqualTypeOf<'start' | 'center' | 'end'>();
      return anchor.width + positioner.width;
    },
    alignOffset: ({ anchor }) => anchor.height,
    alignItemWithTrigger: false,
    collisionBoundary: { x: 0, y: 0, width: 500, height: 500 },
    collisionPadding: { top: 12, bottom: 8, left: 6, right: 6 },
    collisionAvoidance: {
      side: 'shift',
      align: 'shift',
      fallbackAxisSide: 'none',
    },
    sticky: true,
    arrowPadding: 9,
    disableAnchorTracking: true,
    ref: createRef<HTMLDivElement>(),
    render: (elementProps, state) => {
      expectTypeOf(state).toEqualTypeOf<SelectPositionerState>();
      return (
        <section {...elementProps} data-anchor-hidden={state.anchorHidden} />
      );
    },
  };

  <Select.Positioner {...positionerProps} />;

  expectTypeOf<SelectPopupProps>().not.toHaveProperty('container');
  expectTypeOf<SelectPopupProps>().not.toHaveProperty('side');
  expectTypeOf<SelectPopupProps>().not.toHaveProperty('align');
  expectTypeOf<SelectPopupProps>().not.toHaveProperty('positionerProps');
  expectTypeOf<SelectPositionerProps>().not.toHaveProperty('container');
});
