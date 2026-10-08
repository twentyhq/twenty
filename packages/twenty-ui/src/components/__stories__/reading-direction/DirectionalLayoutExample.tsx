import { AvatarGroup, Callout, JsonTree } from '@ui/components';
import { Avatar, Pill } from '@ui/primitives/data-display';
import {
  Button,
  ButtonGroup,
  Radio,
  RadioGroup,
  SegmentedControl,
} from '@ui/primitives/input';
import { ListItem } from '@ui/primitives/navigation';
import { Text } from '@ui/primitives/typography';

import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';

export const DirectionalLayoutExample = ({
  direction,
}: {
  direction: 'ltr' | 'rtl';
}) => {
  return (
    <DirectionProvider direction={direction}>
      <div
        dir={direction}
        data-testid={`layout-${direction}`}
        style={{
          display: 'grid',
          gap: 20,
          width: 520,
          padding: 20,
          background: 'var(--t-background-primary)',
          color: 'var(--t-font-color-primary)',
        }}
      >
        <Text>{direction.toUpperCase()}</Text>
        <Callout
          status="info"
          title="Account details"
          description="Review the information before continuing."
        />
        <RadioGroup
          aria-label="Plan"
          defaultValue="team"
          style={{ flexDirection: 'row' }}
        >
          <Radio variant="card" value="team">
            Team plan
          </Radio>
          <Radio variant="card" value="personal">
            Personal plan
          </Radio>
        </RadioGroup>
        <ButtonGroup aria-label="Record actions">
          <Button>First action</Button>
          <Button>Last action</Button>
        </ButtonGroup>
        <Button disabled style={{ width: 240 }}>
          <Text
            render={<span />}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--t-spacing-1)',
            }}
          >
            Upcoming action
            <Pill label="Soon" />
          </Text>
        </Button>
        <SegmentedControl
          aria-label="Billing"
          defaultValue="annual"
          options={[
            { label: 'Annual', value: 'annual' },
            { label: 'Monthly', value: 'monthly' },
          ]}
        />
        {(['left', 'right'] as const).map((overlap) => (
          <div
            key={overlap}
            data-testid={`avatars-${overlap}`}
            style={{ width: 'fit-content' }}
          >
            <AvatarGroup
              overlap={overlap}
              avatars={['Ada', 'Bea', 'Cam'].map((name) => (
                <Avatar key={name} name={name} size="lg" />
              ))}
              overflowCount={2}
            />
          </div>
        ))}
        <ListItem
          hasSubmenu
          description="Details"
          descriptionPlacement="end"
          style={{ width: 240 }}
        >
          A very long account name that must truncate
        </ListItem>
        <JsonTree
          value={{ account: { name: 'Ada' } }}
          emptyStringLabel="Empty text"
          emptyArrayLabel="Empty array"
          emptyObjectLabel="Empty object"
          arrowButtonCollapsedLabel="Expand node"
          arrowButtonExpandedLabel="Collapse node"
          shouldExpandNodeInitially={() => true}
        />
      </div>
    </DirectionProvider>
  );
};
