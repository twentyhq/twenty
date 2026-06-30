'use client';

import type { HalftoneStudioSettings } from '../../engine/studio-settings-types';

import { ColorField } from './ColorField';
import { CONTROLS_PANEL_SHELL } from './controls-panel-shell';
import { CONTROLS_SECTION } from './ControlsSection';
import { CONTROLS_TABS } from './controls-tabs';
import { HALFTONE_FORMATTERS } from './formatters';
import { LabelWithTooltip } from './LabelWithTooltip';
import { SelectControl } from './SelectControl';
import { SliderControl } from './SliderControl';
import { ToggleControl } from './ToggleControl';

const MIN_ROTATION_SPEED = 0.01;
const ROTATION_SPEED_STEP = 0.01;

type AnimationsTabProps = {
  onAnimationSettingsChange: (
    value: Partial<HalftoneStudioSettings['animation']>,
  ) => void;
  onHoverDashColorChange: (value: string) => void;
  settings: HalftoneStudioSettings;
};

function effectLabel(label: string, description: string) {
  return <LabelWithTooltip description={description} label={label} />;
}

export function AnimationsTab({
  onAnimationSettingsChange,
  onHoverDashColorChange,
  settings,
}: AnimationsTabProps) {
  const animation = settings.animation;
  const isImageMode = settings.sourceMode === 'image';

  return (
    <CONTROLS_TABS.Content>
      {isImageMode ? (
        <>
          <CONTROLS_SECTION.Section $first>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.hoverHalftoneEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  hoverHalftoneEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Hover Halftone',
                'Uses the cursor radius to locally push the halftone power and width, so the bars open or tighten around the mouse instead of only brightening.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.hoverHalftoneEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
                <SliderControl
                  max={1.5}
                  min={-1.5}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      hoverHalftonePowerShift: Number(event.target.value),
                    })
                  }
                  step={0.01}
                  value={animation.hoverHalftonePowerShift}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.hoverHalftonePowerShift,
                    2,
                  )}
                >
                  Power shift
                </SliderControl>
                <SliderControl
                  max={1.35}
                  min={-1.35}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      hoverHalftoneWidthShift: Number(event.target.value),
                    })
                  }
                  step={0.01}
                  value={animation.hoverHalftoneWidthShift}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.hoverHalftoneWidthShift,
                    2,
                  )}
                >
                  Width shift
                </SliderControl>
                <SliderControl
                  max={0.45}
                  min={0.06}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      hoverHalftoneRadius: Number(event.target.value),
                    })
                  }
                  step={0.01}
                  value={animation.hoverHalftoneRadius}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.hoverHalftoneRadius,
                    2,
                  )}
                >
                  Radius
                </SliderControl>
                <CONTROLS_PANEL_SHELL.ColorControlRow>
                  <CONTROLS_PANEL_SHELL.ColorControlLabel>
                    Hover color
                  </CONTROLS_PANEL_SHELL.ColorControlLabel>
                  <ColorField
                    ariaLabel="Hover dash color"
                    onChange={onHoverDashColorChange}
                    value={settings.halftone.hoverDashColor}
                  />
                </CONTROLS_PANEL_SHELL.ColorControlRow>
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.hoverLightEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  hoverLightEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Hover Light',
                'Turns the cursor into a moving light source so the halftone bars open up, tighten, and re-balance as you hover.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.hoverLightEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
                <SliderControl
                  max={2}
                  min={0.1}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      hoverLightIntensity: Number(event.target.value),
                    })
                  }
                  step={0.05}
                  value={animation.hoverLightIntensity}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.hoverLightIntensity,
                    2,
                  )}
                >
                  Intensity
                </SliderControl>
                <SliderControl
                  max={0.45}
                  min={0.06}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      hoverLightRadius: Number(event.target.value),
                    })
                  }
                  step={0.01}
                  value={animation.hoverLightRadius}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.hoverLightRadius,
                    2,
                  )}
                >
                  Radius
                </SliderControl>
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>
        </>
      ) : (
        <>
          <CONTROLS_SECTION.Section $first>
            <CONTROLS_SECTION.Title>Rotation</CONTROLS_SECTION.Title>
            <CONTROLS_PANEL_SHELL.ControlGrid>
              <ToggleControl
                checked={animation.autoRotateEnabled}
                label={effectLabel(
                  'Idle auto-rotate',
                  'Continuously rotates the model on its own, with optional wobble layered on top.',
                )}
                onChange={(event) =>
                  onAnimationSettingsChange({
                    autoRotateEnabled: event.target.checked,
                  })
                }
              />
              {animation.autoRotateEnabled ? (
                <>
                  <SliderControl
                    max={4}
                    min={MIN_ROTATION_SPEED}
                    onChange={(event) =>
                      onAnimationSettingsChange({
                        autoSpeed: Number(event.target.value),
                      })
                    }
                    step={ROTATION_SPEED_STEP}
                    value={animation.autoSpeed}
                    valueLabel={HALFTONE_FORMATTERS.decimal(
                      animation.autoSpeed,
                      2,
                    )}
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
                    valueLabel={HALFTONE_FORMATTERS.decimal(
                      animation.autoWobble,
                      1,
                    )}
                  >
                    Wobble
                  </SliderControl>
                </>
              ) : null}

              <ToggleControl
                checked={animation.rotateEnabled}
                label={effectLabel(
                  'Rotation preset',
                  'Applies a scripted motion path. Axis is simple spin, while the other presets combine multiple frequencies for more complex motion.',
                )}
                onChange={(event) =>
                  onAnimationSettingsChange({
                    rotateEnabled: event.target.checked,
                  })
                }
              />
              {animation.rotateEnabled ? (
                <>
                  <SelectControl
                    onChange={(event) =>
                      onAnimationSettingsChange({
                        rotatePreset: event.target
                          .value as HalftoneStudioSettings['animation']['rotatePreset'],
                      })
                    }
                    options={[
                      { label: 'Axis rotate', value: 'axis' },
                      { label: 'Lissajous', value: 'lissajous' },
                      { label: 'Orbit', value: 'orbit' },
                      { label: 'Tumble', value: 'tumble' },
                    ]}
                    value={animation.rotatePreset}
                  >
                    Pattern
                  </SelectControl>
                  {animation.rotatePreset === 'axis' ? (
                    <SelectControl
                      onChange={(event) =>
                        onAnimationSettingsChange({
                          rotateAxis: event.target
                            .value as HalftoneStudioSettings['animation']['rotateAxis'],
                        })
                      }
                      options={[
                        { label: 'Y (horizontal)', value: 'y' },
                        { label: '-Y (horizontal)', value: '-y' },
                        { label: 'X (vertical)', value: 'x' },
                        { label: '-X (vertical)', value: '-x' },
                        { label: 'Z (roll)', value: 'z' },
                        { label: '-Z (roll)', value: '-z' },
                        { label: 'X + Y (diagonal)', value: 'xy' },
                        { label: '-X + -Y (diagonal)', value: '-xy' },
                      ]}
                      value={animation.rotateAxis}
                    >
                      Axis
                    </SelectControl>
                  ) : null}
                  <SliderControl
                    max={4}
                    min={MIN_ROTATION_SPEED}
                    onChange={(event) =>
                      onAnimationSettingsChange({
                        rotateSpeed: Number(event.target.value),
                      })
                    }
                    step={ROTATION_SPEED_STEP}
                    value={animation.rotateSpeed}
                    valueLabel={HALFTONE_FORMATTERS.decimal(
                      animation.rotateSpeed,
                      2,
                    )}
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
                </>
              ) : null}
            </CONTROLS_PANEL_SHELL.ControlGrid>
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.floatEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  floatEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Float + Drift',
                'Adds a gentle vertical bob plus a small rotational drift so the object feels suspended instead of locked in place.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.floatEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
                <SliderControl
                  max={2}
                  min={0.2}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      floatSpeed: Number(event.target.value),
                    })
                  }
                  step={0.05}
                  value={animation.floatSpeed}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.floatSpeed,
                    2,
                  )}
                >
                  Speed
                </SliderControl>
                <SliderControl
                  max={0.4}
                  min={0.02}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      floatAmplitude: Number(event.target.value),
                    })
                  }
                  step={0.01}
                  value={animation.floatAmplitude}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.floatAmplitude,
                    2,
                  )}
                >
                  Height
                </SliderControl>
                <SliderControl
                  max={24}
                  min={0}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      driftAmount: Number(event.target.value),
                    })
                  }
                  step={1}
                  value={animation.driftAmount}
                  valueLabel={HALFTONE_FORMATTERS.angle(animation.driftAmount)}
                >
                  Drift
                </SliderControl>
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.breatheEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  breatheEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Breathing Scale',
                'Pulses the model scale in and out by a small amount to make static shapes feel alive.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.breatheEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
                <SliderControl
                  max={2}
                  min={0.2}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      breatheSpeed: Number(event.target.value),
                    })
                  }
                  step={0.05}
                  value={animation.breatheSpeed}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.breatheSpeed,
                    2,
                  )}
                >
                  Speed
                </SliderControl>
                <SliderControl
                  max={0.12}
                  min={0.01}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      breatheAmount: Number(event.target.value),
                    })
                  }
                  step={0.005}
                  value={animation.breatheAmount}
                  valueLabel={HALFTONE_FORMATTERS.percent(
                    animation.breatheAmount,
                  )}
                >
                  Amount
                </SliderControl>
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.lightSweepEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  lightSweepEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Light Sweep',
                'Animates the primary light angle and height so highlights travel across the halftone surface.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.lightSweepEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
                <SliderControl
                  max={2}
                  min={0.2}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      lightSweepSpeed: Number(event.target.value),
                    })
                  }
                  step={0.05}
                  value={animation.lightSweepSpeed}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.lightSweepSpeed,
                    2,
                  )}
                >
                  Speed
                </SliderControl>
                <SliderControl
                  max={60}
                  min={5}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      lightSweepRange: Number(event.target.value),
                    })
                  }
                  step={1}
                  value={animation.lightSweepRange}
                  valueLabel={HALFTONE_FORMATTERS.angle(
                    animation.lightSweepRange,
                  )}
                >
                  Angle
                </SliderControl>
                <SliderControl
                  max={1.5}
                  min={0}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      lightSweepHeightRange: Number(event.target.value),
                    })
                  }
                  step={0.05}
                  value={animation.lightSweepHeightRange}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.lightSweepHeightRange,
                    2,
                  )}
                >
                  Height
                </SliderControl>
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.cameraParallaxEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  cameraParallaxEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Camera Parallax',
                'Moves the camera viewpoint with the cursor to create depth without directly rotating the object.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.cameraParallaxEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
                <SliderControl
                  max={0.8}
                  min={0.05}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      cameraParallaxAmount: Number(event.target.value),
                    })
                  }
                  step={0.01}
                  value={animation.cameraParallaxAmount}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.cameraParallaxAmount,
                    2,
                  )}
                >
                  Amount
                </SliderControl>
                <SliderControl
                  max={0.2}
                  min={0.02}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      cameraParallaxEase: Number(event.target.value),
                    })
                  }
                  step={0.01}
                  value={animation.cameraParallaxEase}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.cameraParallaxEase,
                    2,
                  )}
                >
                  Easing
                </SliderControl>
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.springReturnEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  springReturnEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Spring Return',
                'Changes the settling behavior so hover and drag interactions rebound and ease back like a spring instead of stopping flat.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.springReturnEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
                <SliderControl
                  max={0.35}
                  min={0.05}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      springStrength: Number(event.target.value),
                    })
                  }
                  step={0.01}
                  value={animation.springStrength}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.springStrength,
                    2,
                  )}
                >
                  Strength
                </SliderControl>
                <SliderControl
                  max={0.92}
                  min={0.4}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      springDamping: Number(event.target.value),
                    })
                  }
                  step={0.02}
                  value={animation.springDamping}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.springDamping,
                    2,
                  )}
                >
                  Damping
                </SliderControl>
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.followHoverEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  followHoverEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Follow Mouse (Hover)',
                'Tilts the object toward the pointer while the cursor is over the canvas.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.followHoverEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
                <SliderControl
                  max={60}
                  min={5}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      hoverRange: Number(event.target.value),
                    })
                  }
                  value={animation.hoverRange}
                  valueLabel={HALFTONE_FORMATTERS.angle(animation.hoverRange)}
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
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.hoverEase,
                    2,
                  )}
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
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.followDragEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  followDragEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Follow Mouse (Drag)',
                'Lets you rotate the object directly by dragging, optionally continuing with momentum after release.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.followDragEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
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
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.dragSens,
                    3,
                  )}
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
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.dragFriction,
                    2,
                  )}
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
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>

          <CONTROLS_SECTION.Section>
            <CONTROLS_SECTION.ToggleHeader
              checked={animation.waveEnabled}
              onChange={(event) =>
                onAnimationSettingsChange({
                  waveEnabled: event.target.checked,
                })
              }
              preserveCase
            >
              {effectLabel(
                'Wave',
                'Makes the halftone rows undulate horizontally for a liquid, organic feel.',
              )}
            </CONTROLS_SECTION.ToggleHeader>
            {animation.waveEnabled ? (
              <CONTROLS_PANEL_SHELL.ControlGrid>
                <SliderControl
                  max={3}
                  min={0.1}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      waveSpeed: Number(event.target.value),
                    })
                  }
                  step={0.1}
                  value={animation.waveSpeed}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.waveSpeed,
                    1,
                  )}
                >
                  Speed
                </SliderControl>
                <SliderControl
                  max={8}
                  min={0.5}
                  onChange={(event) =>
                    onAnimationSettingsChange({
                      waveAmount: Number(event.target.value),
                    })
                  }
                  step={0.1}
                  value={animation.waveAmount}
                  valueLabel={HALFTONE_FORMATTERS.decimal(
                    animation.waveAmount,
                    1,
                  )}
                >
                  Amount
                </SliderControl>
              </CONTROLS_PANEL_SHELL.ControlGrid>
            ) : null}
          </CONTROLS_SECTION.Section>
        </>
      )}
    </CONTROLS_TABS.Content>
  );
}
