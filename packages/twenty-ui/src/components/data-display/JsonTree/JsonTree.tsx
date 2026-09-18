import { IconBrackets } from '@ui/icon/components/TablerIcons';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { JsonList } from './internal/JsonList';
import { JsonNestedNode } from './internal/JsonNestedNode';
import { JsonNode } from './internal/JsonNode';
import { JsonTreeContextProvider } from './internal/JsonTreeContextProvider';
import { isTwoFirstDepths } from './internal/utils/isTwoFirstDepths';
import { type JsonTreeProps } from './types/JsonTreeProps';

export const JsonTree = ({
  value,
  entries,
  shouldExpandNodeInitially = isTwoFirstDepths,
  ...context
}: JsonTreeProps) => (
  <JsonTreeContextProvider value={{ ...context, shouldExpandNodeInitially }}>
    <JsonList depth={0}>
      {isDefined(entries) ? (
        <JsonNestedNode
          elements={entries}
          Icon={IconBrackets}
          depth={0}
          keyPath=""
          emptyElementsText={context.emptyObjectLabel}
        />
      ) : (
        <JsonNode value={value ?? null} depth={0} keyPath="" />
      )}
    </JsonList>
  </JsonTreeContextProvider>
);
