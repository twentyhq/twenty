'use client';

import {
  HalftoneCanvas,
  type HalftoneSnapshotFn,
} from '@/app/halftone/_components/HalftoneCanvas';
import { ControlsPanel } from '@/app/halftone/_components/ControlsPanel';
import {
  createFallbackGeometry,
  disposeGeometryCache,
  getGeometryForSpec,
} from '@/app/halftone/_lib/geometry-registry';
import {
  deriveExportComponentName,
  generateReactComponent,
  generateStandaloneHtml,
  getExportedModelFile,
} from '@/app/halftone/_lib/exporters';
import {
  createInitialHalftoneStudioState,
  halftoneStudioReducer,
} from '@/app/halftone/_lib/state';
import type {
  GeometryCacheEntry,
  HalftoneExportPose,
  HalftoneGeometrySpec,
  HalftoneSourceMode,
} from '@/app/halftone/_lib/types';
import { Logo as LogoIcon } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type * as THREE from 'three';

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
    props.$tone === 'dark'
      ? 'rgba(255, 255, 255, 0.34)'
      : 'rgba(0, 0, 0, 0.3)'};
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

const DEFAULT_IMAGE_ASSET_PATH = '/images/shared/halftone/twenty-logo.svg';
const DEFAULT_IMAGE_FILENAME = 'twenty-logo.svg';

type PendingFilePicker = {
  resolve: (file: File | null) => void;
};

function isLightColor(hex: string) {
  const color = hex.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
}

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

function createInitialExportPose(): HalftoneExportPose {
  return {
    autoElapsed: 0,
    rotateElapsed: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    timeElapsed: 0,
  };
}

export function HalftoneStudio() {
  const [state, dispatch] = useReducer(
    halftoneStudioReducer,
    undefined,
    createInitialHalftoneStudioState,
  );
  const [previewDistance, setPreviewDistance] = useState(4);
  const [activeGeometry, setActiveGeometry] = useState<THREE.BufferGeometry>(
    () => createFallbackGeometry(),
  );
  const [exportName, setExportName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null,
  );
  const defaultImageFileReference = useRef<File | null>(null);
  const defaultImageFilePromiseReference = useRef<Promise<File> | null>(null);
  const snapshotReference = useRef<HalftoneSnapshotFn | null>(null);
  const fileInputReference = useRef<HTMLInputElement>(null);
  const pendingFilePickerReference = useRef<PendingFilePicker | null>(null);
  const geometryCacheReference = useRef<Map<string, GeometryCacheEntry>>(
    new Map([['torusKnot', activeGeometry]]),
  );
  const lastSuccessfulShapeReference = useRef(state.settings.shapeKey);
  const exportPoseReference = useRef<HalftoneExportPose>(
    createInitialExportPose(),
  );

  const selectedShape = useMemo(
    () =>
      state.geometrySpecs.find(
        (shape) => shape.key === state.settings.shapeKey,
      ),
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
  const selectedImportedFile = useMemo(
    () =>
      getExportedModelFile(
        selectedShape,
        selectedShape ? state.importedFiles[selectedShape.key] : undefined,
      ),
    [selectedShape, state.importedFiles],
  );
  const defaultExportName = useMemo(
    () =>
      deriveExportComponentName(
        selectedShape,
        selectedImportedFile ?? undefined,
      ),
    [selectedImportedFile, selectedShape],
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
      const shape = state.geometrySpecs.find(
        (candidate) => candidate.key === key,
      );

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

  const handleUploadImage = useCallback(async () => {
    const file = await openFilePicker('.png,.jpg,.jpeg,.webp,.gif');

    if (!file) {
      return;
    }

    setImageFile(file);
    dispatch({ type: 'setSourceMode', value: 'image' });
  }, [openFilePicker]);

  const loadDefaultImageFile = useCallback(async () => {
    if (defaultImageFileReference.current) {
      return defaultImageFileReference.current;
    }

    if (!defaultImageFilePromiseReference.current) {
      defaultImageFilePromiseReference.current = fetch(DEFAULT_IMAGE_ASSET_PATH)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Could not load the default image.');
          }

          const blob = await response.blob();
          const file = new File([blob], DEFAULT_IMAGE_FILENAME, {
            type: blob.type || 'image/jpeg',
          });

          defaultImageFileReference.current = file;

          return file;
        })
        .finally(() => {
          defaultImageFilePromiseReference.current = null;
        });
    }

    return defaultImageFilePromiseReference.current;
  }, []);

  const handleSourceModeChange = useCallback(
    (mode: HalftoneSourceMode) => {
      dispatch({ type: 'setSourceMode', value: mode });

      if (mode !== 'image' || imageFile) {
        return;
      }

      void loadDefaultImageFile()
        .then((file) => {
          setImageFile((currentFile) => currentFile ?? file);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    [imageFile, loadDefaultImageFile],
  );

  const handlePoseChange = useCallback((pose: HalftoneExportPose) => {
    exportPoseReference.current = pose;
  }, []);

  const handleExportReact = useCallback(() => {
    const componentName = exportName || defaultExportName;
    const kebabName = componentName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    const isImageMode = state.settings.sourceMode === 'image';
    const importedFile = selectedImportedFile;

    const modelFilename = importedFile
      ? `${kebabName}${importedFile.name.replace(/^[^.]*/, '')}`
      : undefined;

    const imageExportFilename = imageFile
      ? `${kebabName}${imageFile.name.replace(/^[^.]*/, '')}`
      : undefined;

    downloadText(
      `${componentName}.tsx`,
      generateReactComponent(
        state.settings,
        selectedShape,
        componentName,
        modelFilename,
        exportPoseReference.current,
        importedFile ?? undefined,
        imageExportFilename,
      ),
    );

    if (isImageMode && imageFile) {
      downloadBlob(imageExportFilename ?? imageFile.name, imageFile);
    } else if (importedFile) {
      downloadBlob(modelFilename ?? importedFile.name, importedFile);
    }
  }, [
    defaultExportName,
    exportName,
    imageFile,
    selectedImportedFile,
    selectedShape,
    state.settings,
  ]);

  const handleExportHalftoneImage = useCallback(
    async (width: number, height: number) => {
      const snapshotFn = snapshotReference.current;

      if (!snapshotFn) {
        return;
      }

      const blob = await snapshotFn(width, height);

      if (!blob) {
        return;
      }

      downloadBlob(`halftone-${width}x${height}.png`, blob);
    },
    [],
  );

  const handleExportHtml = useCallback(async () => {
    const componentName = exportName || defaultExportName;
    const kebabName = componentName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    const isImageMode = state.settings.sourceMode === 'image';
    const importedFile = selectedImportedFile;

    const modelFilename = importedFile
      ? `${kebabName}${importedFile.name.replace(/^[^.]*/, '')}`
      : undefined;

    const imageExportFilename = imageFile
      ? `${kebabName}${imageFile.name.replace(/^[^.]*/, '')}`
      : undefined;

    downloadText(
      `${kebabName}.html`,
      await generateStandaloneHtml(
        state.settings,
        selectedShape,
        componentName,
        modelFilename,
        exportPoseReference.current,
        importedFile ?? undefined,
        imageExportFilename,
      ),
    );

    if (isImageMode && imageFile) {
      downloadBlob(imageExportFilename ?? imageFile.name, imageFile);
    }
  }, [
    defaultExportName,
    exportName,
    imageFile,
    selectedImportedFile,
    selectedShape,
    state.settings,
  ]);

  useEffect(() => {
    void loadDefaultImageFile()
      .then((file) => {
        setImageFile((currentFile) => currentFile ?? file);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [loadDefaultImageFile]);

  useEffect(() => {
    if (!imageFile) {
      setImageElement(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => setImageElement(img);
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

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

  const background = state.settings.background.color;
  const backgroundTone = isLightColor(background) ? 'light' : 'dark';
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
        {state.settings.sourceMode === 'image'
          ? 'Drag to shift the halftone pattern'
          : 'Click & drag to rotate'}
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
          imageElement={imageElement}
          onFirstInteraction={handleFirstInteraction}
          onPoseChange={handlePoseChange}
          previewDistance={previewDistance}
          settings={state.settings}
          snapshotRef={snapshotReference}
        />
      </CanvasLayer>

      <ControlsPositioner>
        <ControlsPanel
          activeTab={state.activeTab}
          defaultExportName={defaultExportName}
          exportName={exportName}
          imageFileName={imageFile?.name ?? null}
          onAnimationSettingsChange={(value) =>
            dispatch({ type: 'patchAnimation', value })
          }
          onDashColorChange={(value) =>
            dispatch({
              type: 'patchHalftone',
              value: { dashColor: value },
            })
          }
          onExportHalftoneImage={(width, height) => {
            void handleExportHalftoneImage(width, height);
          }}
          onExportHtml={() => {
            void handleExportHtml();
          }}
          onExportNameChange={setExportName}
          onExportReact={handleExportReact}
          onBackgroundChange={(value) =>
            dispatch({ type: 'patchBackground', value })
          }
          onHalftoneChange={(value) =>
            dispatch({ type: 'patchHalftone', value })
          }
          onLightingChange={(value) =>
            dispatch({ type: 'patchLighting', value })
          }
          onMaterialChange={(value) =>
            dispatch({ type: 'patchMaterial', value })
          }
          onPreviewDistanceChange={setPreviewDistance}
          onShapeChange={(value) => {
            void handleShapeChange(value);
          }}
          onSourceModeChange={handleSourceModeChange}
          onTabChange={(value) => dispatch({ type: 'setTab', value })}
          onUploadImage={() => {
            void handleUploadImage();
          }}
          onUploadModel={() => {
            void handleUploadModel();
          }}
          previewDistance={previewDistance}
          selectedShape={selectedShape}
          settings={state.settings}
          shapeOptions={shapeOptions}
        />
      </ControlsPositioner>

      <HiddenFileInput
        accept=".fbx,.glb,.png,.jpg,.jpeg,.webp,.gif"
        onChange={handleFileInputChange}
        ref={fileInputReference}
        type="file"
      />
    </StudioShell>
  );
}
