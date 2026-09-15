import { styled } from '@linaria/react';
import {
  IconClock,
  IconCode,
  IconFilter,
  IconMail,
  IconPlug,
  IconPlus,
  IconRepeat,
  IconSearch,
  IconSitemap,
} from '@tabler/icons-react';

import { EASING, REDUCED_MOTION } from '@/tokens';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';

import { WORKFLOW_THEME } from './workflow-theme';
import { PREVIEW_SKELETON } from '../../primitives/PreviewSkeleton';
import { type WorkflowNodeDef } from '../../types';

const colors = WORKFLOW_THEME.colors;

const NODE_ICON_MAP: Record<string, typeof IconPlug> = {
  clock: IconClock,
  code: IconCode,
  filter: IconFilter,
  mail: IconMail,
  plug: IconPlug,
  plus: IconPlus,
  repeat: IconRepeat,
  search: IconSearch,
  sitemap: IconSitemap,
};

const NODE_ICON_COLORS: Record<string, string> = {
  trigger: colors.nodeTriggerIcon,
  action: colors.nodeActionIcon,
  fallback: colors.nodeIconFallback,
};

const Node = styled.div<{ $index: number }>`
  align-items: center;
  animation: workflowNodeAppear 420ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${150 + $index * 120}ms`};
  background: ${colors.nodeSurface};
  border: 1px solid ${colors.nodeBorder};
  border-radius: ${THEME_LIGHT.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  height: ${WORKFLOW_THEME.nodeHeightPx}px;
  left: 0;
  padding: 8px;
  position: absolute;
  top: 0;
  z-index: 1;

  @keyframes workflowNodeAppear {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const NodeIconContainer = styled.div`
  align-items: center;
  animation: workflowNodeContentAppear 320ms ease both;
  animation-delay: 80ms;
  background: ${colors.nodeIconSurface};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  display: flex;
  flex: 0 0 auto;
  height: 32px;
  justify-content: center;
  width: 32px;

  @keyframes workflowNodeContentAppear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const NodeContent = styled.div`
  align-items: stretch;
  align-self: stretch;
  animation: workflowNodeContentAppear 320ms ease both;
  animation-delay: 80ms;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: space-between;
  max-width: 184px;
  min-width: 0;
  padding-bottom: 2px;

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const NodeLabel = styled.div`
  color: ${colors.textLight};
  font-family: var(--font-product), sans-serif;
  font-size: 11px;
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  line-height: 1;
`;

const NodeTitle = styled.div`
  color: ${colors.textPrimary};
  font-family: var(--font-product), sans-serif;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SkeletonIcon = styled(PREVIEW_SKELETON.Block)`
  border-radius: ${THEME_LIGHT.border.radius.sm};
  flex: 0 0 auto;
  height: 32px;
  width: 32px;
`;

export function WorkflowNode({
  generating = false,
  index = 0,
  node,
}: {
  generating?: boolean;
  index?: number;
  node: WorkflowNodeDef;
}) {
  const Icon = NODE_ICON_MAP[node.iconName] ?? IconCode;
  const iconColor = NODE_ICON_COLORS[node.iconColor ?? 'action'];
  return (
    <Node
      $index={index}
      style={{ left: node.x, top: node.y, width: node.width }}
    >
      {generating ? (
        <>
          <SkeletonIcon />
          <NodeContent>
            <PREVIEW_SKELETON.Bar $height={8} $width="38%" />
            <PREVIEW_SKELETON.Bar $height={9} $width="72%" />
          </NodeContent>
        </>
      ) : (
        <>
          <NodeIconContainer>
            <Icon
              aria-hidden
              color={iconColor}
              size={20}
              stroke={THEME_LIGHT.icon.stroke.sm}
            />
          </NodeIconContainer>
          <NodeContent>
            <NodeLabel>{node.label}</NodeLabel>
            <NodeTitle>{node.title}</NodeTitle>
          </NodeContent>
        </>
      )}
    </Node>
  );
}
