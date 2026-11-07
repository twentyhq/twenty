import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { Text } from '@ui/primitives/typography/Text/Text';
import { themeCssVariables } from '@ui/theme';

import { ReactionButton } from '../ReactionButton';
import { type ReactionButtonProps } from '../types/ReactionButtonProps';

export const ReactionButtonExample = ({
  emoji = '👍',
  disabled,
  loading,
}: Partial<Pick<ReactionButtonProps, 'emoji' | 'disabled' | 'loading'>>) => {
  const [pressed, setPressed] = useState(false);
  const count = pressed ? 3 : 2;

  return (
    <Text
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: themeCssVariables.spacing[2],
      }}
    >
      <Text>Was this helpful?</Text>
      <Text
        render={<span />}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: themeCssVariables.spacing[1],
        }}
      >
        <Tooltip content={`${count} people found this helpful`}>
          <ReactionButton
            aria-label="Helpful"
            emoji={emoji}
            count={count}
            pressed={pressed}
            onPressedChange={setPressed}
            disabled={disabled}
            loading={loading}
          />
        </Tooltip>
        <Button size="sm" variant="ghost" onClick={() => setPressed(false)}>
          Reset
        </Button>
      </Text>
    </Text>
  );
};
