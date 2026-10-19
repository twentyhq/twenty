import { type useRender } from '@base-ui/react/use-render';

export type PhoneCountryPickerOptionsProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  disabled?: boolean;
  searchLabel?: string;
  listLabel?: string;
  emptyLabel?: string;
};
