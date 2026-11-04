import { type CountPagerProps } from '../src/components/navigation/CountPager/types/CountPagerProps';

export const COUNT_PAGER_PROP_DESCRIPTIONS = {
  index:
    'Controlled zero-based item index. Navigation is disabled when the index is not an integer within the collection bounds.',
  count:
    'Number of items in the collection. Empty collections and invalid or noninteger counts disable navigation.',
  onIndexChange:
    'Requests the neighboring index after activating Previous or Next. Prop changes do not call this callback or select a replacement item.',
  positionText:
    'Caller-formatted position text, announced politely when it changes. The caller also supplies text for empty collections.',
  previousLabel: 'Accessible name of the Previous button.',
  nextLabel: 'Accessible name of the Next button.',
  disabled:
    'Disables both navigation buttons without changing the position text.',
  positionPlacement:
    'Places the position text between the buttons or at the start of the row. Start placement lets the text fill the available width.',
  render: 'Replaces the root element while preserving its props and contents.',
  ref: 'Ref to the root element.',
  className: 'CSS class applied to the root element.',
  style: 'Inline styles applied to the root element.',
  role: 'Root semantics. Defaults to a group; the caller supplies its accessible name.',
} satisfies Partial<Record<keyof CountPagerProps, string>>;
