import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';
import { listConditionalAvailabilityNodes } from '@/utils/conditional-availability/listConditionalAvailabilityNodes';

export const listConditionalAvailabilityFieldMetadataUniversalIdentifiers = ({
  node,
}: {
  node: ConditionalAvailabilityNode;
}): string[] => [
  ...new Set(
    listConditionalAvailabilityNodes({ node }).flatMap((currentNode) =>
      currentNode.type === 'SELECTED_RECORDS'
        ? [currentNode.recordFilter.fieldMetadataUniversalIdentifier]
        : [],
    ),
  ),
];
