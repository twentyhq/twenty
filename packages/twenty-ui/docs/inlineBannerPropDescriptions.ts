import { type ComponentProps } from 'react';

import { type InlineBanner } from '../src/components/feedback/InlineBanner/InlineBanner';

export const INLINE_BANNER_PROP_DESCRIPTIONS = {
  color: 'Banner palette color. An omitted color uses Banner’s default.',
  message:
    'Message text. Standard banners truncate with a focusable tooltip; compact banners wrap.',
  variant:
    'Standard full-width banner or compact wrapping message with a 512px maximum content width.',
  embedded:
    'Removes the bottom margin from standard banners. Compact banners have no bottom margin.',
  button: [
    'Optional button or destination link. All fields are optional:',
    '',
    '- `title` (`string`): visible action label.',
    '- `onClick` (`(event: BaseUIEvent<React.MouseEvent<HTMLButtonElement>>) => void`): activation handler, including keyboard activation.',
    '- `href` (`string`): destination URL; selects native link semantics.',
    '- `render` (`ReactElement | ((props: HTMLProps, state: { disabled: boolean }) => ReactElement)`): custom root element or renderer. Preserve an anchor when `href` is set, or a native button otherwise. `HTMLProps` includes native element attributes and its ref.',
    '- `target` (`string`): link browsing context, such as `_blank`.',
    '- `rel` (`string`): link relationship, such as `noopener noreferrer`.',
    '- `download` (native anchor attribute): use `true` to download the destination or a `string` to suggest a filename.',
    '- `disabled` (`boolean`): prevents activation.',
    '- `hidden` (`boolean`): omits the action from the banner.',
    '- `aria-label` (`string`): accessible action name, needed when no visible title is supplied.',
    '- `Icon` (`IconComponent`): decorative icon component displayed before the title.',
    '',
    'Action and link fields use the corresponding [Button props](/ui/primitives/input/button). `BaseUIEvent` extends the React event with `preventBaseUIHandler()` and `baseUIHandlerPrevented`.',
  ].join('\n'),
  LeftIcon: 'Leading icon component. Defaults to the information icon.',
  className: 'Class applied to the banner.',
} satisfies Partial<Record<keyof ComponentProps<typeof InlineBanner>, string>>;
