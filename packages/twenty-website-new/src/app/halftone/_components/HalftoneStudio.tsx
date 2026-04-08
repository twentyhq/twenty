'use client';

import { HalftoneCanvas } from '@/app/halftone/_components/HalftoneCanvas';
import { ControlsPanel } from '@/app/halftone/_components/ControlsPanel';
import {
  createFallbackGeometry,
  disposeGeometryCache,
  getGeometryForSpec,
} from '@/app/halftone/_lib/geometry-registry';
import { getBackgroundTone } from '@/app/halftone/_lib/formatters';
import {
  generateReactComponent,
  generateStandaloneHtml,
  getExportedModelFile,
} from '@/app/halftone/_lib/exporters';
import {
  createInitialHalftoneStudioState,
  halftoneStudioReducer,
} from '@/app/halftone/_lib/state';
import type { GeometryCacheEntry, HalftoneGeometrySpec } from '@/app/halftone/_lib/types';
import { Logo as LogoIcon } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import * as THREE from 'three';

const StudioShell = styled.div<{ $background: string }>`
  background: ${(props) => props.$background};
  height: 100vh;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const CanvasLayer = styled.div`
  height: 100%;
  width: 100%;
`;

const LogoLink = styled(Link)`
  display: grid;
  left: 24px;
  position: absolute;
  top: 24px;
  z-index: 2;
`;

const Hint = styled.div<{ $tone: 'dark' | 'light'; $visible: boolean }>`
  color: ${(props) =>
    props.$tone === 'dark' ? 'rgba(255, 255, 255, 0.34)' : 'rgba(0, 0, 0, 0.3)'};
  font-family: ${theme.font.family.mono};
  font-size: 11px;
  left: 50%;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: none;
  position: fixed;
  top: 20px;
  transform: translateX(-50%);
  transition: opacity 0.3s ease;
  z-index: 1;
`;

const Status = styled.div<{
  $error: boolean;
  $tone: 'dark' | 'light';
  $visible: boolean;
}>`
  color: ${(props) => {
    if (props.$error) {
      return 'rgba(214, 66, 66, 0.92)';
    }

    return props.$tone === 'dark'
      ? 'rgba(255, 255, 255, 0.62)'
      : 'rgba(0, 0, 0, 0.55)';
  }};
  font-family: ${theme.font.family.mono};
  font-size: 11px;
  left: 50%;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: none;
  position: fixed;
  top: 44px;
  transform: translateX(-50%);
  transition: opacity 0.2s ease;
  z-index: 1;
`;

const ControlsPositioner = styled.div`
  bottom: 20px;
  height: calc(100vh - 40px);
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 3;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    bottom: 16px;
    height: 48vh;
    left: 16px;
    right: 16px;
    top: auto;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

type PendingFilePicker = {
  resolve: (file: File | null) => void;
};

function downloadBlob(filename: string, blob: Blob) {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(anchor.href);
  }, 0);
}

function downloadText(filename: string, content: string) {
  downloadBlob(filename, new Blob([content], { type: 'text/plain' }));
}

export function HalftoneStudio() {
  const [state, dispatch] = useReducer(
    halftoneStudioReducer,
    undefined,
    createInitialHalftoneStudioState,
  );
  const [activeGeometry, setActiveGeometry] = useState<THREE.BufferGeometry>(() =>
    createFallbackGeometry(),
  );
  const fileInputReference = useRef<HTMLInputElement>(null);
  const pendingFilePickerReference = useRef<PendingFilePicker | null>(null);
  const geometryCacheReference = useRef<Map<string, GeometryCacheEntry>>(
    new Map([['torusKnot', activeGeometry]]),
  );
  const lastSuccessfulShapeReference = useRef(state.settings.shapeKey);

  const selectedShape = useMemo(
    () =>
      state.geometrySpecs.find((shape) => shape.key === state.settings.shapeKey),
    [state.geometrySpecs, state.settings.shapeKey],
  );
  const shapeOptions = useMemo(
    () =>
      state.geometrySpecs.map((shape) => ({
        label: shape.label,
        value: shape.key,
      })),
    [state.geometrySpecs],
  );

  const openFilePicker = useCallback((accept: string) => {
    return new Promise<File | null>((resolve) => {
      const input = fileInputReference.current;

      if (!input) {
        resolve(null);
        return;
      }

      pendingFilePickerReference.current = { resolve };
      input.accept = accept;

      const handleWindowFocus = () => {
        window.setTimeout(() => {
          const pendingPicker = pendingFilePickerReference.current;
          const currentInput = fileInputReference.current;

          if (!pendingPicker) {
            return;
          }

          if (currentInput?.files?.length) {
            return;
          }

          pendingFilePickerReference.current = null;
          pendingPicker.resolve(null);
        }, 300);
      };

      window.addEventListener('focus', handleWindowFocus, { once: true });
      input.click();
    });
  }, []);

  const handleFileInputChange = useCallback(() => {
    const input = fileInputReference.current;
    const pendingPicker = pendingFilePickerReference.current;
    const file = input?.files?.[0] ?? null;

    if (!pendingPicker) {
      if (input) {
        input.value = '';
      }

      return;
    }

    pendingFilePickerReference.current = null;
    pendingPicker.resolve(file);

    if (input) {
      input.value = '';
    }
  }, []);

  const requestImportedFile = useCallback(
    async (shape: HalftoneGeometrySpec) => {
      const existingFile = state.importedFiles[shape.key];

      if (existingFile) {
        return existingFile;
      }

      dispatch({
        type: 'setStatus',
        message: `Select ${shape.label} to import it.`,
      });

      const file = await openFilePicker(
        shape.extensions?.join(',') ?? '.fbx,.glb',
      );

      if (!file) {
        dispatch({ type: 'clearStatus' });
        return null;
      }

      dispatch({
        type: 'setImportedFile',
        key: shape.key,
        file,
      });

      return file;
    },
    [openFilePicker, state.importedFiles],
  );

  const handleShapeChange = useCallback(
    async (key: string) => {
      const shape = state.geometrySpecs.find((candidate) => candidate.key === key);

      if (!shape) {
        return;
      }

      if (shape.kind === 'imported' && !state.importedFiles[shape.key]) {
        const file = await requestImportedFile(shape);

        if (!file) {
          return;
        }
      }

      dispatch({
        type: 'setShapeKey',
        value: key,
      });
    },
    [requestImportedFile, state.geometrySpecs, state.importedFiles],
  );

  const handleUploadModel = useCallback(async () => {
    const file = await openFilePicker('.fbx,.glb');

    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const loader = extension === 'glb' ? 'glb' : 'fbx';
    const nextShape: HalftoneGeometrySpec = {
      key: `userUpload_${Date.now()}`,
      label: file.name,
      kind: 'imported',
      loader,
      filename: file.name,
      description: `${loader.toUpperCase()} model`,
      extensions: [`.${loader}`],
      userProvided: true,
    };

    dispatch({
      type: 'registerImportedFile',
      spec: nextShape,
      file,
      activate: true,
    });
  }, [openFilePicker]);

  const handleExportReact = useCallback(() => {
    downloadText(
      'HalftoneDashes.tsx',
      generateReactComponent(state.settings, selectedShape),
    );

    const importedFile = getExportedModelFile(
      selectedShape,
      selectedShape ? state.importedFiles[selectedShape.key] : undefined,
    );

    if (importedFile) {
      downloadBlob(importedFile.name, importedFile);
    }
  }, [selectedShape, state.importedFiles, state.settings]);

  const handleExportHtml = useCallback(() => {
    downloadText(
      'halftone-dashes.html',
      generateStandaloneHtml(state.settings, selectedShape),
    );

    const importedFile = getExportedModelFile(
      selectedShape,
      selectedShape ? state.importedFiles[selectedShape.key] : undefined,
    );

    if (importedFile) {
      downloadBlob(importedFile.name, importedFile);
    }
  }, [selectedShape, state.importedFiles, state.settings]);

  useEffect(() => {
    return () => {
      disposeGeometryCache(geometryCacheReference.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedShape) {
      return;
    }

    let cancelled = false;

    if (selectedShape.kind === 'imported') {
      dispatch({
        type: 'setStatus',
        message: `Loading ${selectedShape.label}…`,
      });
    } else {
      dispatch({ type: 'clearStatus' });
    }

    void getGeometryForSpec(
      selectedShape,
      state.importedFiles[selectedShape.key],
      geometryCacheReference.current,
    )
      .then((geometry) => {
        if (cancelled) {
          return;
        }

        lastSuccessfulShapeReference.current = selectedShape.key;
        setActiveGeometry(geometry);
        dispatch({ type: 'clearStatus' });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(error);

        dispatch({
          type: 'setStatus',
          message:
            error instanceof Error
              ? error.message
              : `${selectedShape.label} failed to load.`,
          isError: true,
        });

        if (lastSuccessfulShapeReference.current !== selectedShape.key) {
          dispatch({
            type: 'setShapeKey',
            value: lastSuccessfulShapeReference.current,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedShape, state.importedFiles]);

  const background = state.settings.background.transparent
    ? 'transparent'
    : state.settings.background.color;
  const backgroundTone = getBackgroundTone(state.settings.background);
  const handleFirstInteraction = useCallback(() => {
    dispatch({ type: 'hideHint' });
  }, []);

  return (
    <StudioShell $background={background}>
      <LogoLink aria-label="Go to homepage" href="/">
        <LogoIcon
          backgroundColor={theme.colors.secondary.background[100]}
          fillColor={theme.colors.primary.background[100]}
          size={40}
        />
      </LogoLink>

      <Hint $tone={backgroundTone} $visible={state.showHint}>
        Click &amp; drag to rotate
      </Hint>
      <Status
        $error={state.statusIsError}
        $tone={backgroundTone}
        $visible={state.statusMessage.length > 0}
      >
        {state.statusMessage}
      </Status>

      <CanvasLayer>
        <HalftoneCanvas
          geometry={activeGeometry}
          onFirstInteraction={handleFirstInteraction}
          settings={state.settings}
        />
      </CanvasLayer>

      <ControlsPositioner>
        <ControlsPanel
          activeTab={state.activeTab}
          onAnimationModeSelect={(value) =>
            dispatch({
              type: 'patchAnimation',
              value: {
                mode: state.settings.animation.mode === value ? 'none' : value,
              },
            })
          }
          onAnimationSettingsChange={(value) =>
            dispatch({ type: 'patchAnimation', value })
          }
          onBackgroundColorChange={(value) =>
            dispatch({ type: 'patchBackground', value: { color: value } })
          }
          onBackgroundTransparencyChange={(value) =>
            dispatch({
              type: 'patchBackground',
              value: { transparent: value },
            })
          }
          onDashColorChange={(value) =>
            dispatch({
              type: 'patchHalftone',
              value: { dashColor: value },
            })
          }
          onExportHtml={handleExportHtml}
          onExportReact={handleExportReact}
          onHalftoneChange={(value) =>
            dispatch({ type: 'patchHalftone', value })
          }
          onLightingChange={(value) =>
            dispatch({ type: 'patchLighting', value })
          }
          onMaterialChange={(value) =>
            dispatch({ type: 'patchMaterial', value })
          }
          onRotateToggle={() =>
            dispatch({
              type: 'patchAnimation',
              value: {
                rotateEnabled: !state.settings.animation.rotateEnabled,
              },
            })
          }
          onShapeChange={(value) => {
            void handleShapeChange(value);
          }}
          onTabChange={(value) => dispatch({ type: 'setTab', value })}
          onUploadModel={() => {
            void handleUploadModel();
          }}
          selectedShape={selectedShape}
          settings={state.settings}
          shapeOptions={shapeOptions}
        />
      </ControlsPositioner>

      <HiddenFileInput
        accept=".fbx,.glb"
        onChange={handleFileInputChange}
        ref={fileInputReference}
        type="file"
      />
    </StudioShell>
  );
}
