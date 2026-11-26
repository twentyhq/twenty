'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import {
  IconBrandYoutube,
  IconCheck,
  IconForms,
  IconSend,
  IconSpeakerphone,
  IconUsers,
} from '@tabler/icons-react';

import { color, DURATION, EASING, REDUCED_MOTION } from '@/tokens';

import { STEP_CARD_CHROME } from '../integrator-step-visuals/step-card-chrome';

const {
  Panel,
  PanelHeader,
  Row,
  RowLabel,
  RowValue,
  Stage,
  scrub,
  timelineDelay,
} = STEP_CARD_CHROME;

// ApplyStepVisual's sequence: each value types in after the previous one,
// then the form is sent. On scroll the sequence follows the reader; when the
// stepper swipes it plays each time the step becomes active; reduced motion
// shows the filled form.
const TYPE_STAGGER_MS = 550;
const TYPE_DURATION_MS = 500;
const SEND_DELAY_MS = 3 * TYPE_STAGGER_MS + 300;
const TIMELINE_MS = SEND_DELAY_MS + 300;

// The row being typed in lights up, like the home panels' hovered row.
const FieldRow = styled(Row)`
  &[data-index='1'] {
    --d: ${TYPE_STAGGER_MS}ms;
  }

  &[data-index='2'] {
    --d: ${2 * TYPE_STAGGER_MS}ms;
  }

  [data-active] & {
    animation: creatorApplyFocus ${TYPE_DURATION_MS}ms step-end forwards;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorApplyFocus {
    0% {
      background: ${color('graphite')};
    }
    100% {
      background: ${color('charcoal')};
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

// Typed in: the value is uncovered left to right in steps, like keystrokes.
const Typed = styled.span`
  display: inline-block;

  [data-active] & {
    animation: creatorApplyType ${TYPE_DURATION_MS}ms steps(16, end) both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorApplyType {
    from {
      clip-path: inset(0 100% 0 0);
    }
    to {
      clip-path: inset(0 0 0 0);
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
  }
`;

// The send row stays blue once sent, as the site's buttons keep their
// colour when done; the send arrow gives way to a check in the same place
// and the label fades out.
const SubmitRow = styled(Row)`
  background: ${color('blue')};
  color: ${color('white')};

  --d: ${SEND_DELAY_MS}ms;
`;

const SubmitLabels = styled.span`
  align-items: center;
  display: grid;

  & > span {
    color: ${color('white')};
    grid-area: 1 / 1;
  }
`;

const SubmitLabel = styled(RowLabel)`
  [data-active] & {
    animation: creatorApplyFadeOut ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorApplyFadeOut {
    to {
      opacity: 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
    opacity: 0;
  }
`;

const SentCheck = styled.span`
  display: inline-flex;
  opacity: 0;
  transform: scale(0.85);

  [data-active] & {
    animation: creatorApplyFadeIn ${DURATION.xs} ${EASING.gentle} both;
    animation-delay: ${timelineDelay};
  }

  @keyframes creatorApplyFadeIn {
    to {
      opacity: 1;
      transform: none;
    }
  }

  ${REDUCED_MOTION} {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
`;

// The creator form's own labels (affiliate-application-copy), filled in, each
// with its icon in one of the site's accents.
const FIELDS = [
  {
    Icon: IconBrandYoutube,
    tint: color('green'),
    label: msg`Main channel (URL)`,
    value: msg`youtube.com/@yourname`,
  },
  {
    Icon: IconUsers,
    tint: color('pink'),
    label: msg`Audience size or clients`,
    value: msg`12k newsletter subscribers`,
  },
  {
    Icon: IconSpeakerphone,
    tint: color('yellow'),
    label: msg`How you plan to promote Twenty`,
    value: msg`Reviews, tutorials, migration guides`,
  },
];

export function CreatorApplyStepVisual({
  active,
  progress,
}: {
  active: boolean;
  progress?: number;
}) {
  const { i18n } = useLingui();

  return (
    <Stage
      aria-hidden
      data-active={active ? '' : undefined}
      {...scrub(progress, TIMELINE_MS)}
    >
      <Panel>
        <PanelHeader>
          <IconForms size={20} stroke={1.5} />
          {i18n._(msg`Creator application`)}
        </PanelHeader>
        {FIELDS.map(({ Icon, label, tint, value }, index) => (
          <FieldRow data-index={index} key={label.id}>
            <Icon color={tint} size={20} stroke={1.5} />
            <Field>
              <RowLabel>{i18n._(label)}</RowLabel>
              <RowValue>
                <Typed>{i18n._(value)}</Typed>
              </RowValue>
            </Field>
          </FieldRow>
        ))}
        <SubmitRow>
          {/* one icon slot: the send arrow gives way to the check */}
          <SubmitLabels>
            <SubmitLabel>
              <IconSend size={20} stroke={1.5} />
            </SubmitLabel>
            <SentCheck>
              <IconCheck size={20} stroke={2} />
            </SentCheck>
          </SubmitLabels>
          <SubmitLabel>{i18n._(msg`Submit application`)}</SubmitLabel>
        </SubmitRow>
      </Panel>
    </Stage>
  );
}
