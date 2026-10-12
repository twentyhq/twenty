import { useState } from 'react';

import { SearchInput } from '../SearchInput';
import { type SearchInputProps } from '../types/SearchInputProps';

export const SearchInputExample = (props: SearchInputProps) => {
  const [value, setValue] = useState('');

  return <SearchInput value={value} onValueChange={setValue} {...props} />;
};
