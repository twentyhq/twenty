import { Button } from '@react-email/button';
import * as React from 'react';

export const CallToAction = ({ value, href }) => {
  return <Button href={href}>{value}</Button>;
};
