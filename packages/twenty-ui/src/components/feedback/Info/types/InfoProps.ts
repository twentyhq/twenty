import { type Button } from '@ui/primitives/input/Button/Button';
import React from 'react';
import { type InfoAccent } from './InfoAccent';

export type InfoProps = {
  accent?: InfoAccent;
  text: string;
  buttonTitle?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  render?: React.ComponentProps<typeof Button>['render'];
};
