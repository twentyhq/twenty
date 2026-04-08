'use client';

import {
  formatAngle,
  formatDecimal,
} from '@/app/halftone/_lib/formatters';
import type { HalftoneAnimationMode, HalftoneStudioSettings } from '@/app/halftone/_lib/types';
import {
  AnimOption,
  AnimOptionDescription,
  AnimOptionIcon,
  AnimOptionInfo,
  AnimOptionName,
  AnimSubSettings,
  ControlGrid,
  Section,
  SectionTitle,
  SelectControl,
  SliderControl,
  TabContent,
  ToggleControl,
} from './controls-ui';

type PrototypeTabProps = {
  onAnimationModeSelect: (value: HalftoneAnimationMode) => void;
  onAnimationSettingsChange: (
    value: Partial<HalftoneStudioSettings['animation']>,
  ) => void;
  onRotateToggle: () => void;
  settings: HalftoneStudioSettings;
};

const ANIMATION_OPTIONS = [
  {
    description: 'Continuous idle rotation',
    icon: '↻',
    key: 'autoRotate' as const,
    label: 'Auto Rotate',
  },
  {
    description: 'Object tracks cursor on hover',
    icon: '◎',
    key: 'followHover' as const,
    label: 'Follow Mouse (Hover)',
  },
  {
    description: 'Click & drag to orient freely',
    icon: '✥',
    key: 'followDrag' as const,
    label: 'Follow Mouse (Drag)',
  },
  {
    description: 'Spin on chosen axis at set speed',
    icon: '⟳',
    key: 'rotate' as const,
    label: 'Rotate',
  },
];

export function PrototypeTab({
  onAnimationModeSelect,
  onAnimationSettingsChange,
  onRotateToggle,
  settings,
}: PrototypeTabProps) {
  const animation = settings.animation;

  return (
    <TabContent>
      <Section $first>
        <SectionTitle>Animation Mode</SectionTitle>
        <ControlGrid>
          {ANIMATION_OPTIONS.map((option) => {
            const isSelected =
              option.key === 'rotate'
                ? animation.rotateEnabled
                : animation.mode === option.key;

            return (
              <AnimOption
                $selected={isSelected}
                key={option.key}
                onClick={() => {
                  if (option.key === 'rotate') {
                    onRotateToggle();
                    return;
                  }

                  onAnimationModeSelect(option.key);
                }}
                type="button"
              >
                <AnimOptionIcon $selected={isSelected}>
                  {option.icon}
                </AnimOptionIcon>
                <AnimOptionInfo>
                  <AnimOptionName $selected={isSelected}>
                    {option.label}
                  </AnimOptionName>
                  <AnimOptionDescription>
                    {option.description}
                  </AnimOptionDescription>
                </AnimOptionInfo>
              </AnimOption>
            );
          })}
        </ControlGrid>
      </Section>

      <AnimSubSettings $visible={animation.mode === 'autoRotate'}>
        <SectionTitle>Auto Rotate Settings</SectionTitle>
        <ControlGrid>
          <SliderControl
            max={1.5}
            min={0.05}
            onChange={(event) =>
              onAnimationSettingsChange({
                autoSpeed: Number(event.target.value),
              })
            }
            step={0.05}
            value={animation.autoSpeed}
            valueLabel={formatDecimal(animation.autoSpeed, 1)}
          >
            Speed
          </SliderControl>
          <SliderControl
            max={1.5}
            min={0}
            onChange={(event) =>
              onAnimationSettingsChange({
                autoWobble: Number(event.target.value),
              })
            }
            step={0.05}
            value={animation.autoWobble}
            valueLabel={formatDecimal(animation.autoWobble, 1)}
          >
            Wobble
          </SliderControl>
        </ControlGrid>
      </AnimSubSettings>

      <AnimSubSettings $visible={animation.mode === 'followHover'}>
        <SectionTitle>Follow Hover Settings</SectionTitle>
        <ControlGrid>
          <SliderControl
            max={60}
            min={5}
            onChange={(event) =>
              onAnimationSettingsChange({
                hoverRange: Number(event.target.value),
              })
            }
            value={animation.hoverRange}
            valueLabel={formatAngle(animation.hoverRange)}
          >
            Range
          </SliderControl>
          <SliderControl
            max={0.2}
            min={0.01}
            onChange={(event) =>
              onAnimationSettingsChange({
                hoverEase: Number(event.target.value),
              })
            }
            step={0.01}
            value={animation.hoverEase}
            valueLabel={formatDecimal(animation.hoverEase, 2)}
          >
            Easing
          </SliderControl>
          <ToggleControl
            checked={animation.hoverReturn}
            label="Return to center"
            onChange={(event) =>
              onAnimationSettingsChange({
                hoverReturn: event.target.checked,
              })
            }
          />
        </ControlGrid>
      </AnimSubSettings>

      <AnimSubSettings $visible={animation.mode === 'followDrag'}>
        <SectionTitle>Drag Settings</SectionTitle>
        <ControlGrid>
          <SliderControl
            max={0.02}
            min={0.002}
            onChange={(event) =>
              onAnimationSettingsChange({
                dragSens: Number(event.target.value),
              })
            }
            step={0.001}
            value={animation.dragSens}
            valueLabel={formatDecimal(animation.dragSens, 3)}
          >
            Sensitivity
          </SliderControl>
          <SliderControl
            max={0.2}
            min={0.01}
            onChange={(event) =>
              onAnimationSettingsChange({
                dragFriction: Number(event.target.value),
              })
            }
            step={0.01}
            value={animation.dragFriction}
            valueLabel={formatDecimal(animation.dragFriction, 2)}
          >
            Friction
          </SliderControl>
          <ToggleControl
            checked={animation.dragMomentum}
            label="Momentum"
            onChange={(event) =>
              onAnimationSettingsChange({
                dragMomentum: event.target.checked,
              })
            }
          />
        </ControlGrid>
      </AnimSubSettings>

      <AnimSubSettings $visible={animation.rotateEnabled}>
        <SectionTitle>Rotate Settings</SectionTitle>
        <ControlGrid>
          <SelectControl
            onChange={(event) =>
              onAnimationSettingsChange({
                rotateAxis: event.target.value as HalftoneStudioSettings['animation']['rotateAxis'],
              })
            }
            options={[
              { label: 'Y (horizontal)', value: 'y' },
              { label: 'X (vertical)', value: 'x' },
              { label: 'Z (roll)', value: 'z' },
              { label: 'X + Y (diagonal)', value: 'xy' },
            ]}
            value={animation.rotateAxis}
          >
            Axis
          </SelectControl>
          <SliderControl
            max={4}
            min={0.1}
            onChange={(event) =>
              onAnimationSettingsChange({
                rotateSpeed: Number(event.target.value),
              })
            }
            step={0.1}
            value={animation.rotateSpeed}
            valueLabel={formatDecimal(animation.rotateSpeed, 1)}
          >
            Speed
          </SliderControl>
          <ToggleControl
            checked={animation.rotatePingPong}
            label="Ping-pong"
            onChange={(event) =>
              onAnimationSettingsChange({
                rotatePingPong: event.target.checked,
              })
            }
          />
        </ControlGrid>
      </AnimSubSettings>
    </TabContent>
  );
}
