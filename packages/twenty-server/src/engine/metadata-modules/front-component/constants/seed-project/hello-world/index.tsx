import { defineFrontComponent } from 'twenty-sdk/define';
import {
  copyToClipboard,
  enqueueSnackbar,
  useFrontComponentExecutionContext,
  useUserId,
} from 'twenty-sdk/front-component';
import {
  IconArrowUpRight,
  IconChevronDown,
  IconChevronRight,
  IconCode,
  IconCopy,
  IconRefresh,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { Heading, Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';
import { type ReactNode, useState } from 'react';

const FRONT_COMPONENTS_DOCS_URL =
  'https://docs.twenty.com/developers/extend/apps/layout/front-components';

const shortenId = (id: string) =>
  id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;

type ContextRowProps = {
  label: string;
  children: ReactNode;
};

const ContextRow = ({ label, children }: ContextRowProps) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: theme.spacing[4],
        rowGap: theme.spacing[1],
        minHeight: theme.spacing[6],
      }}
    >
      <Text size="sm" color="tertiary" style={{ flex: '0 0 96px' }}>
        {label}
      </Text>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[1],
          flex: '1 1 160px',
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const ContextValue = ({ value }: { value: string | null | undefined }) => (
  <Text
    size="sm"
    color={value ? 'primary' : 'light'}
    truncate
    title={value ?? undefined}
  >
    {value ?? 'None'}
  </Text>
);

const ContextIdValue = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => {
  const theme = useTheme();

  if (!value) {
    return <ContextValue value={value} />;
  }

  const handleCopy = async () => {
    await copyToClipboard(value);
    await enqueueSnackbar({
      message: `${label} ID copied`,
      variant: 'success',
    });
  };

  return (
    <>
      <Text
        size="sm"
        truncate
        title={value}
        style={{
          fontFamily: theme.code.font.family,
          fontSize: theme.font.size.xs,
        }}
      >
        {shortenId(value)}
      </Text>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Copy ${label.toLowerCase()} ID`}
        startIcon={<IconCopy />}
        onClick={handleCopy}
      />
    </>
  );
};

const HelloWorld = () => {
  const theme = useTheme();
  const [renderCount, setRenderCount] = useState(0);
  const [isRawContextOpen, setIsRawContextOpen] = useState(false);

  const userId = useUserId();
  const fullContext = useFrontComponentExecutionContext((context) => context);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[4],
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[3],
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
            width: theme.spacing[9],
            height: theme.spacing[9],
            borderRadius: theme.border.radius.md,
            background: theme.accent.accent3,
            border: `1px solid ${theme.accent.accent5}`,
            color: theme.accent.accent11,
          }}
        >
          <IconCode size={theme.icon.size.lg} stroke={theme.icon.stroke.md} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: theme.spacing[0.5],
            minWidth: 0,
          }}
        >
          <Heading level={2} size="lg">
            This is a custom front-end component
          </Heading>
          <a
            href={FRONT_COMPONENTS_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: theme.spacing[0.5],
              color: theme.accent.accent10,
              fontSize: theme.font.size.sm,
              textDecoration: 'none',
            }}
          >
            Develop your own
            <IconArrowUpRight size={theme.icon.size.sm} />
          </a>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[1],
          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          borderRadius: theme.border.radius.md,
          background: theme.background.secondary,
          border: `1px solid ${theme.border.color.light}`,
        }}
      >
        <ContextRow label="User">
          <ContextIdValue label="User" value={userId} />
        </ContextRow>
        <ContextRow label="Record">
          <ContextIdValue label="Record" value={fullContext?.recordId} />
        </ContextRow>
        <ContextRow label="Object">
          <ContextValue
            value={fullContext?.selectedObjectMetadata?.nameSingular}
          />
        </ContextRow>
        <ContextRow label="Page">
          <ContextValue value={fullContext?.location?.pathname} />
        </ContextRow>
        <ContextRow label="Appearance">
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[1] }}
          >
            <Tag color="gray">{fullContext?.colorScheme ?? 'light'}</Tag>
            <Tag color="gray">{fullContext?.locale ?? 'en'}</Tag>
          </div>
        </ContextRow>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: theme.spacing[2],
          minWidth: 0,
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          startIcon={
            isRawContextOpen ? <IconChevronDown /> : <IconChevronRight />
          }
          aria-expanded={isRawContextOpen}
          onClick={() => setIsRawContextOpen((isOpen) => !isOpen)}
        >
          {isRawContextOpen ? 'Hide raw context' : 'Show raw context'}
        </Button>
        {isRawContextOpen && (
          <pre
            style={{
              alignSelf: 'stretch',
              margin: 0,
              padding: theme.spacing[3],
              maxHeight: 240,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              fontFamily: theme.code.font.family,
              fontSize: theme.font.size.xs,
              lineHeight: 1.5,
              color: theme.font.color.secondary,
              background: theme.background.secondary,
              border: `1px solid ${theme.border.color.light}`,
              borderRadius: theme.border.radius.md,
            }}
          >
            {JSON.stringify(fullContext, null, 2) ?? 'undefined'}
          </pre>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: theme.spacing[2],
        }}
      >
        <Button
          variant="solid"
          color="accent"
          size="sm"
          startIcon={<IconRefresh />}
          onClick={() => setRenderCount((count) => count + 1)}
        >
          Re-render
        </Button>
        <Tag color="blue">
          {renderCount} {renderCount === 1 ? 'render' : 'renders'}
        </Tag>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'seed-front-component-hello-world',
  name: 'Hello World',
  description:
    'A sample visual front component that displays execution context',
  component: HelloWorld,
});
