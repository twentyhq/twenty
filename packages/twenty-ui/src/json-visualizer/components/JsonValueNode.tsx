import styled from '@emotion/styled';
import { IconComponent } from '@ui/display';
import { JsonListItem } from '@ui/json-visualizer/components/internal/JsonListItem';
import { JsonNodeLabel } from '@ui/json-visualizer/components/internal/JsonNodeLabel';
import { JsonNodeValue } from '@ui/json-visualizer/components/internal/JsonNodeValue';

const StyledListItem = styled(JsonListItem)`
  column-gap: ${({ theme }) => theme.spacing(2)};
`;

type JsonValueNodeProps = {
  valueAsString: string;
  isHighlighted: boolean;
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
          isHighlighted={props.isHighlighted}
        />
      )}

      <JsonNodeValue
        valueAsString={props.valueAsString}
        isHighlighted={props.isHighlighted}
      />
    </StyledListItem>
  );
};
