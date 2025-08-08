import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';
import { JsonListItem } from '@ui/json-visualizer/components/internal/JsonListItem';
import { JsonNodeLabel } from '@ui/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNodeValue } from '@ui/json-visualizer/components/internal/JsonNodeValue';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';

const StyledListItem = styled(JsonListItem)`
  column-gap: ${({ theme }) => theme.spacing(2)};
`;

type JsonValueNodeProps = {
  valueAsString: string;
  highlighting: JsonNodeHighlighting | undefined;
} & (
  | {
      label: string;
      Icon: IconComponent;
    }
  | {
      label?: never;
      Icon?: unknown;
    }
);

export const JsonValueNode = (props: JsonValueNodeProps) => {
  return (
    <StyledListItem>
      {props.label && (
        <JsonNodeLabel
          label={props.label}
          Icon={props.Icon}
          highlighting={props.highlighting}
        />
      )}

      <JsonNodeValue
        valueAsString={props.valueAsString}
        highlighting={props.highlighting}
      />
    </StyledListItem>
  );
};
