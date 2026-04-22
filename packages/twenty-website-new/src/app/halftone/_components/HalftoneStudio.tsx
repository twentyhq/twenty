'use client';

import {
  HalftoneCanvas,
  type HalftoneSnapshotFn,
} from '@/app/halftone/_components/HalftoneCanvas';
import { ControlsPanel } from '@/app/halftone/_components/ControlsPanel';
import { resolveExportArtifactNames } from '@/app/halftone/_lib/exportNames';
import {
  createFallbackGeometry,
  disposeGeometryCache,
  getGeometryForSpec,
} from '@/app/halftone/_lib/geometry-registry';
import { REFERENCE_PREVIEW_DISTANCE } from '@/app/halftone/_lib/footprint';
import { generateImageHalftoneSvg } from '@/app/halftone/_lib/imageSvgExport';
import {
  DEFAULT_REACT_EXPORT_SETTINGS,
  deriveExportComponentName,
  generateReactComponent,
  generateStandaloneHtml,
  getExportedModelFile,
  parseExportedPreset,
  type ReactExportSettings,
} from '@/app/halftone/_lib/exporters';
import {
  DEFAULT_IMAGE_HALFTONE_SETTINGS,
  DEFAULT_SHAPE_HALFTONE_SETTINGS,
  createInitialHalftoneStudioState,
  halftoneStudioReducer,
  type HalftoneExportPose,
  type HalftoneGeometrySpec,
  type HalftoneModelLoader,
  type HalftoneSourceMode,
  normalizeHalftoneStudioSettings,
} from '@/app/halftone/_lib/state';
import {
  buildShareUrl,
  decodeShareState,
  encodeShareState,
} from '@/app/halftone/_lib/share';
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

type GeometryCacheEntry = THREE.BufferGeometry | Promise<THREE.BufferGeometry>;
const DESKTOP_CONTROLS_PANEL_WIDTH = 320;
const DESKTOP_CONTROLS_PANEL_OFFSET = 20;
const DESKTOP_CONTROLS_PANEL_FOOTPRINT =
  DESKTOP_CONTROLS_PANEL_WIDTH + DESKTOP_CONTROLS_PANEL_OFFSET;

const StudioShell = styled.div<{ $background: string }>`
  background: ${(props) => props.$background};
  height: 100vh;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const ContentRegion = styled.div<{ $panelOpen: boolean }>`
  height: 100%;
  margin-right: auto;
  position: relative;
  transition: width 0.18s ease;
  width: ${(props) =>
    props.$panelOpen
      ? `calc(100% - ${DESKTOP_CONTROLS_PANEL_FOOTPRINT}px)`
      : '100%'};

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    width: 100%;
  }
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
  position: absolute;
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
  position: absolute;
  top: 44px;
  transform: translateX(-50%);
  transition: opacity 0.2s ease;
  z-index: 1;
`;

const ControlsPositioner = styled.div`
  align-items: flex-start;
  bottom: 20px;
  display: flex;
  height: calc(100vh - 40px);
  justify-content: flex-end;
  pointer-events: none;
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

const ControlsPanelFrame = styled.div<{ $visible: boolean }>`
  height: ${(props) => (props.$visible ? '100%' : 'auto')};
  pointer-events: auto;
  @media (max-width: ${theme.breakpoints.md - 1}px) {
    width: ${(props) => (props.$visible ? '100%' : 'auto')};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const DEFAULT_PREVIEW_DISTANCE = 6;
const DEFAULT_IMAGE_ASSET_PATH = '/images/shared/halftone/twenty-logo.svg';
const DEFAULT_IMAGE_FILENAME = 'twenty-logo.svg';
const CLIPBOARD_IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
  'image/bmp': '.bmp',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
};
type PendingFilePicker = {
  resolve: (file: File | null) => void;
};

type PendingPresetPicker = {
  resolve: (files: File[]) => void;
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

function getFilenameExtension(
  filename: string | null | undefined,
  fallbackExtension: string,
) {
  const sanitizedFilename = filename?.split(/[?#]/, 1)[0] ?? '';
  const match = sanitizedFilename.match(/(\.[^.\\/]+)$/);

  return match?.[1] ?? fallbackExtension;
}

function getAssetFilenameFromUrl(assetUrl: string, fallbackFilename: string) {
  const sanitizedAssetUrl = assetUrl.split(/[?#]/, 1)[0].replace(/\/+$/, '');
  const assetFilename = sanitizedAssetUrl.split('/').filter(Boolean).pop();

  return assetFilename && assetFilename.length > 0
    ? assetFilename
    : fallbackFilename;
}

function isEditablePasteTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.closest('[contenteditable=""], [contenteditable="true"]') !== null
  );
}

function createPastedImageFile(file: File) {
  const hasExtension = /\.[^.]+$/i.test(file.name);

  if (hasExtension) {
    return file;
  }

  const extension =
    CLIPBOARD_IMAGE_EXTENSION_BY_MIME[file.type] ??
    CLIPBOARD_IMAGE_EXTENSION_BY_MIME['image/png'];

  return new File([file], `pasted-image-${Date.now()}${extension}`, {
    type: file.type || 'image/png',
    lastModified: Date.now(),
  });
}

function hasTextSelection() {
  const selection = window.getSelection();

  return selection !== null && selection.toString().trim().length > 0;
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

function normalizePresetAssetReference(reference: string | null) {
  if (!reference) {
    return null;
  }

  const trimmed = reference.trim();

  if (trimmed.startsWith('./data:')) {
    return trimmed.slice(2);
  }

  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  const withoutRelativePrefix = trimmed.replace(/^\.?\//, '');
  const pathSegments = withoutRelativePrefix.split('/').filter(Boolean);

  return pathSegments[pathSegments.length - 1] ?? withoutRelativePrefix;
}

function findMatchingPresetAsset(files: File[], reference: string | null) {
  const normalizedReference = normalizePresetAssetReference(reference);

  if (!normalizedReference || normalizedReference.startsWith('data:')) {
    return null;
  }

  const targetName = normalizedReference.toLowerCase();

  return files.find((file) => file.name.toLowerCase() === targetName) ?? null;
}

function inferPresetModelLoader(
  reference: string | null,
  fallbackLoader: HalftoneModelLoader | null,
) {
  if (fallbackLoader) {
    return fallbackLoader;
  }

  const normalizedReference = normalizePresetAssetReference(reference) ?? '';

  return normalizedReference.toLowerCase().endsWith('.fbx') ? 'fbx' : 'glb';
}

async function fileFromDataUrl(dataUrl: string, filename: string) {
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error(`Could not load embedded asset ${filename}.`);
  }

  const blob = await response.blob();

  return new File([blob], filename, {
    type: blob.type || 'application/octet-stream',
  });
}

export function HalftoneStudio() {
  const [state, dispatch] = useReducer(
    halftoneStudioReducer,
    undefined,
    createInitialHalftoneStudioState,
  );
  const [controlsVisible, setControlsVisible] = useState(true);
  const [previewDistance, setPreviewDistance] = useState(
    DEFAULT_PREVIEW_DISTANCE,
  );
  const [activeGeometry, setActiveGeometry] = useState<THREE.BufferGeometry>(
    () => createFallbackGeometry(),
  );
  const [exportBackground, setExportBackground] = useState(false);
  const [exportName, setExportName] = useState('');
  const [reactExportSettings, setReactExportSettings] =
    useState<ReactExportSettings>(DEFAULT_REACT_EXPORT_SETTINGS);
  const [reactAssetPublicUrl, setReactAssetPublicUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null,
  );
  const [canvasInitialPose, setCanvasInitialPose] =
    useState<HalftoneExportPose>();
  const defaultImageFileReference = useRef<File | null>(null);
  const defaultImageFilePromiseReference = useRef<Promise<File> | null>(null);
  const snapshotReference = useRef<HalftoneSnapshotFn | null>(null);
  const canvasLayerReference = useRef<HTMLDivElement>(null);
  const fileInputReference = useRef<HTMLInputElement>(null);
  const presetFileInputReference = useRef<HTMLInputElement>(null);
  const pendingFilePickerReference = useRef<PendingFilePicker | null>(null);
  const pendingPresetPickerReference = useRef<PendingPresetPicker | null>(null);
  const geometryCacheReference = useRef<Map<string, GeometryCacheEntry>>(
    new Map([['torusKnot', activeGeometry]]),
  );
  const lastSuccessfulShapeReference = useRef(state.settings.shapeKey);
  const exportPoseReference = useRef<HalftoneExportPose>(
    createInitialExportPose(),
  );
  const halftoneBySourceModeReference = useRef({
    shape: { ...DEFAULT_SHAPE_HALFTONE_SETTINGS },
    image: { ...DEFAULT_IMAGE_HALFTONE_SETTINGS },
  });

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
  const defaultExportName = useMemo(() => {
    if (state.settings.sourceMode === 'image') {
      if (!imageFile || imageFile.name === DEFAULT_IMAGE_FILENAME) {
        return 'TwentyImage';
      }

      return deriveExportComponentName(undefined, imageFile);
    }

    return deriveExportComponentName(
      selectedShape,
      selectedImportedFile ?? undefined,
    );
  }, [
    imageFile,
    selectedImportedFile,
    selectedShape,
    state.settings.sourceMode,
  ]);
  const exportArtifactNames = useMemo(
    () => resolveExportArtifactNames(exportName, defaultExportName),
    [defaultExportName, exportName],
  );
  const reactExportUsesExternalAsset = useMemo(
    () =>
      state.settings.sourceMode === 'image' ||
      selectedShape?.kind === 'imported',
    [selectedShape?.kind, state.settings.sourceMode],
  );
  const defaultReactAssetPublicUrl = useMemo(() => {
    if (!reactExportUsesExternalAsset) {
      return '';
    }

    const assetExtension =
      state.settings.sourceMode === 'image'
        ? getFilenameExtension(
            imageFile?.name ?? DEFAULT_IMAGE_FILENAME,
            '.svg',
          )
        : getFilenameExtension(
            selectedImportedFile?.name ?? selectedShape?.filename,
            selectedShape?.loader === 'fbx' ? '.fbx' : '.glb',
          );

    return `/illustrations/generated/${exportArtifactNames.fileBaseName}${assetExtension}`;
  }, [
    exportArtifactNames.fileBaseName,
    imageFile?.name,
    reactExportUsesExternalAsset,
    selectedImportedFile?.name,
    selectedShape?.filename,
    selectedShape?.loader,
    state.settings.sourceMode,
  ]);

  useEffect(() => {
    halftoneBySourceModeReference.current[state.settings.sourceMode] = {
      ...state.settings.halftone,
    };
  }, [state.settings.halftone, state.settings.sourceMode]);

  // Hydrate from URL hash on first mount. Done in an effect (not the reducer
  // initializer) so the server-rendered HTML matches the client and we don't
  // touch `window` during render.
  const hashHydratedReference = useRef(false);
  useEffect(() => {
    if (hashHydratedReference.current) {
      return;
    }

    hashHydratedReference.current = true;

    const decoded = decodeShareState(window.location.hash);

    if (!decoded) {
      return;
    }

    dispatch({ type: 'replaceSettings', value: decoded.settings });
    setPreviewDistance(decoded.previewDistance);
    setExportName(decoded.exportName);
  }, []);

  // Mirror the current design state to the URL hash so a refresh (and a copy
  // of the URL) restores the same look. We skip the very first effect run so
  // the URL stays clean until the user actually changes something.
  const hashSyncInitializedReference = useRef(false);
  useEffect(() => {
    if (!hashSyncInitializedReference.current) {
      hashSyncInitializedReference.current = true;
      return;
    }

    const timeout = window.setTimeout(() => {
      const hash = encodeShareState({
        settings: state.settings,
        previewDistance,
        exportName,
      });
      const nextUrl = `${window.location.pathname}${window.location.search}#${hash}`;
      window.history.replaceState(null, '', nextUrl);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [state.settings, previewDistance, exportName]);

  const handleCopyShareLink = useCallback(() => {
    const url = buildShareUrl({
      settings: state.settings,
      previewDistance,
      exportName,
    });

    void navigator.clipboard
      .writeText(url)
      .then(() => {
        dispatch({ type: 'setStatus', message: 'Link copied to clipboard.' });
        window.setTimeout(() => dispatch({ type: 'clearStatus' }), 2000);
      })
      .catch(() => {
        dispatch({
          type: 'setStatus',
          message: 'Could not copy the share link.',
          isError: true,
        });
      });
  }, [exportName, previewDistance, state.settings]);

  const handleCopyHalftoneImage = useCallback(
    async (width: number, height: number) => {
      const snapshotFn = snapshotReference.current;

      if (!snapshotFn) {
        return;
      }

      if (
        typeof ClipboardItem === 'undefined' ||
        typeof navigator.clipboard?.write !== 'function'
      ) {
        dispatch({
          type: 'setStatus',
          message: 'Image clipboard copy is not supported in this browser.',
          isError: true,
        });
        return;
      }

      const blob = await snapshotFn(width, height, {
        backgroundColor: state.settings.background.color,
        includeBackground: exportBackground,
      });

      if (!blob) {
        dispatch({
          type: 'setStatus',
          message: 'Could not copy the halftone image.',
          isError: true,
        });
        return;
      }

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type || 'image/png']: blob,
          }),
        ]);
        dispatch({
          type: 'setStatus',
          message: 'Image copied to clipboard.',
        });
        window.setTimeout(() => dispatch({ type: 'clearStatus' }), 2000);
      } catch {
        dispatch({
          type: 'setStatus',
          message: 'Could not copy the halftone image.',
          isError: true,
        });
      }
    },
    [exportBackground, state.settings.background.color],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCopyShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === 'c';

      if (!isCopyShortcut) {
        return;
      }

      if (isEditablePasteTarget(event.target) || hasTextSelection()) {
        return;
      }

      const canvasLayer = canvasLayerReference.current;
      const width = Math.max(canvasLayer?.clientWidth ?? 0, 1);
      const height = Math.max(canvasLayer?.clientHeight ?? 0, 1);

      event.preventDefault();
      void handleCopyHalftoneImage(width, height);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCopyHalftoneImage]);

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

  const openPresetPicker = useCallback((accept: string) => {
    return new Promise<File[]>((resolve) => {
      const input = presetFileInputReference.current;

      if (!input) {
        resolve([]);
        return;
      }

      pendingPresetPickerReference.current = { resolve };
      input.accept = accept;

      const handleWindowFocus = () => {
        window.setTimeout(() => {
          const pendingPicker = pendingPresetPickerReference.current;
          const currentInput = presetFileInputReference.current;

          if (!pendingPicker) {
            return;
          }

          if (currentInput?.files?.length) {
            return;
          }

          pendingPresetPickerReference.current = null;
          pendingPicker.resolve([]);
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

  const handlePresetFileInputChange = useCallback(() => {
    const input = presetFileInputReference.current;
    const pendingPicker = pendingPresetPickerReference.current;
    const files = input?.files ? Array.from(input.files) : [];

    if (!pendingPicker) {
      if (input) {
        input.value = '';
      }

      return;
    }

    pendingPresetPickerReference.current = null;
    pendingPicker.resolve(files);

    if (input) {
      input.value = '';
    }
  }, []);

  const handleShapeChange = useCallback(
    (key: string) => {
      const shape = state.geometrySpecs.find(
        (candidate) => candidate.key === key,
      );

      if (!shape) {
        return;
      }

      dispatch({
        type: 'setShapeKey',
        value: key,
      });
    },
    [state.geometrySpecs],
  );

  const activateUploadedModel = useCallback(
    (file: File) => {
      const currentDashColor = state.settings.halftone.dashColor;
      const currentHoverDashColor = state.settings.halftone.hoverDashColor;
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
      halftoneBySourceModeReference.current[state.settings.sourceMode] = {
        ...state.settings.halftone,
      };
      dispatch({ type: 'setSourceMode', value: 'shape' });
      dispatch({
        type: 'patchHalftone',
        value: {
          ...halftoneBySourceModeReference.current.shape,
          dashColor: currentDashColor,
          hoverDashColor: currentHoverDashColor,
        },
      });
    },
    [state.settings.halftone, state.settings.sourceMode],
  );

  const activateUploadedImage = useCallback(
    (file: File) => {
      const currentDashColor = state.settings.halftone.dashColor;
      const currentHoverDashColor = state.settings.halftone.hoverDashColor;
      setImageFile(file);
      halftoneBySourceModeReference.current[state.settings.sourceMode] = {
        ...state.settings.halftone,
      };
      dispatch({ type: 'setSourceMode', value: 'image' });
      dispatch({
        type: 'patchHalftone',
        value: {
          ...halftoneBySourceModeReference.current.image,
          dashColor: currentDashColor,
          hoverDashColor: currentHoverDashColor,
        },
      });
    },
    [state.settings.halftone, state.settings.sourceMode],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isEditablePasteTarget(event.target)) {
        return;
      }

      const imageItem = Array.from(event.clipboardData?.items ?? []).find(
        (item) => item.type.startsWith('image/'),
      );

      if (!imageItem) {
        return;
      }

      const pastedFile = imageItem.getAsFile();

      if (!pastedFile) {
        dispatch({
          type: 'setStatus',
          message: 'Could not read the pasted image.',
          isError: true,
        });
        return;
      }

      event.preventDefault();
      activateUploadedImage(createPastedImageFile(pastedFile));
      dispatch({
        type: 'setStatus',
        message: 'Image pasted from clipboard.',
      });
      window.setTimeout(() => dispatch({ type: 'clearStatus' }), 2000);
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [activateUploadedImage]);

  const handleUploadSource = useCallback(async () => {
    const file = await openFilePicker(
      '.fbx,.glb,.png,.jpg,.jpeg,.webp,.gif,.svg',
    );

    if (!file) {
      return;
    }

    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)) {
      activateUploadedImage(file);
      return;
    }

    activateUploadedModel(file);
  }, [activateUploadedImage, activateUploadedModel, openFilePicker]);

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
      if (mode !== state.settings.sourceMode) {
        halftoneBySourceModeReference.current[state.settings.sourceMode] = {
          ...state.settings.halftone,
        };
        dispatch({ type: 'setSourceMode', value: mode });
        dispatch({
          type: 'patchHalftone',
          value: { ...halftoneBySourceModeReference.current[mode] },
        });
      }

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
    [
      imageFile,
      loadDefaultImageFile,
      state.settings.halftone,
      state.settings.sourceMode,
    ],
  );

  const handleImportPreset = useCallback(async () => {
    const selectedFiles = await openPresetPicker(
      '.tsx,.html,.fbx,.glb,.png,.jpg,.jpeg,.webp,.gif,.svg',
    );
    const presetFile =
      selectedFiles.find((file) => /\.(tsx|html)$/i.test(file.name)) ?? null;

    if (!presetFile) {
      return;
    }

    try {
      const preset = parseExportedPreset(await presetFile.text());
      const relatedFiles = selectedFiles.filter((file) => file !== presetFile);
      const nextSettings = normalizeHalftoneStudioSettings(preset.settings);
      let nextShapeKey = nextSettings.shapeKey;
      const statusMessages: string[] = [];

      if (nextSettings.sourceMode === 'image') {
        const matchedImageFile = findMatchingPresetAsset(
          relatedFiles,
          preset.imageAssetReference,
        );
        const nextImageFile =
          matchedImageFile ??
          (preset.imageAssetReference
            ? await loadDefaultImageFile()
            : (imageFile ?? (await loadDefaultImageFile())));

        setImageFile(nextImageFile);

        if (!matchedImageFile && preset.imageAssetReference) {
          const missingImageName =
            normalizePresetAssetReference(preset.imageAssetReference) ??
            'the exported image';
          statusMessages.push(
            `${missingImageName} was not selected, so the default image is being used until you upload it.`,
          );
        }
      } else if (preset.shape.kind === 'imported') {
        const embeddedModelReference = normalizePresetAssetReference(
          preset.modelAssetReference,
        );
        const matchedModelFile = embeddedModelReference?.startsWith('data:')
          ? await fileFromDataUrl(
              embeddedModelReference,
              preset.shape.filename ?? `${preset.shape.label}.glb`,
            )
          : findMatchingPresetAsset(relatedFiles, preset.modelAssetReference);

        if (matchedModelFile) {
          const loader = inferPresetModelLoader(
            matchedModelFile.name,
            preset.shape.loader ?? null,
          );
          const importedShapeSpec: HalftoneGeometrySpec = {
            key: preset.shape.key,
            label: matchedModelFile.name,
            kind: 'imported',
            loader,
            filename: matchedModelFile.name,
            description: `${loader.toUpperCase()} model`,
            extensions: [`.${loader}`],
            userProvided: true,
          };

          dispatch({
            type: 'registerImportedFile',
            spec: importedShapeSpec,
            file: matchedModelFile,
            activate: false,
          });
          nextShapeKey = importedShapeSpec.key;
        } else {
          nextShapeKey = 'torusKnot';

          if (preset.shape.filename || preset.modelAssetReference) {
            const missingModelName =
              normalizePresetAssetReference(
                preset.modelAssetReference ?? preset.shape.filename,
              ) ?? preset.shape.label;
            statusMessages.push(
              `${missingModelName} was not selected, so Torus Knot is being shown until you upload the preset's model.`,
            );
          }
        }
      }

      exportPoseReference.current = preset.initialPose;
      setCanvasInitialPose(preset.initialPose);
      const nextPreviewDistance =
        preset.previewDistance ?? REFERENCE_PREVIEW_DISTANCE;
      setPreviewDistance(nextPreviewDistance);
      setExportName(
        preset.componentName ?? presetFile.name.replace(/\.(tsx|html)$/i, ''),
      );
      dispatch({
        type: 'replaceSettings',
        value: {
          ...nextSettings,
          shapeKey: nextShapeKey,
        },
      });
      dispatch({
        type: 'setStatus',
        message:
          statusMessages.length > 0
            ? `Imported ${presetFile.name}. ${statusMessages.join(' ')}`
            : `Imported ${presetFile.name}.`,
      });
    } catch (error) {
      dispatch({
        type: 'setStatus',
        message:
          error instanceof Error
            ? error.message
            : 'Could not import that preset.',
        isError: true,
      });
    }
  }, [imageFile, loadDefaultImageFile, openPresetPicker]);

  const handlePoseChange = useCallback((pose: HalftoneExportPose) => {
    exportPoseReference.current = pose;
  }, []);

  const handleReactExportSettingChange = useCallback(
    (key: keyof ReactExportSettings, value: boolean) => {
      setReactExportSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value,
      }));
    },
    [],
  );

  const handleExportReact = useCallback(() => {
    const componentName = exportArtifactNames.componentName;
    const kebabName = exportArtifactNames.fileBaseName;
    const isImageMode = state.settings.sourceMode === 'image';
    const importedFile = selectedImportedFile;
    const exportBackgroundColor = exportBackground
      ? state.settings.background.color
      : 'transparent';
    const effectiveReactAssetPublicUrl =
      reactExportSettings.includePublicAssetUrl && reactExportUsesExternalAsset
        ? reactAssetPublicUrl.trim() || defaultReactAssetPublicUrl
        : undefined;

    const defaultModelFilename = importedFile
      ? `${kebabName}${importedFile.name.replace(/^[^.]*/, '')}`
      : undefined;
    const modelFilename =
      effectiveReactAssetPublicUrl && defaultModelFilename
        ? getAssetFilenameFromUrl(
            effectiveReactAssetPublicUrl,
            defaultModelFilename,
          )
        : defaultModelFilename;

    const defaultImageExportFilename = imageFile
      ? `${kebabName}${imageFile.name.replace(/^[^.]*/, '')}`
      : undefined;
    const imageExportFilename =
      effectiveReactAssetPublicUrl && defaultImageExportFilename
        ? getAssetFilenameFromUrl(
            effectiveReactAssetPublicUrl,
            defaultImageExportFilename,
          )
        : defaultImageExportFilename;

    downloadText(
      `${componentName}.tsx`,
      generateReactComponent(state.settings, selectedShape, componentName, {
        assetUrl: effectiveReactAssetPublicUrl,
        background: exportBackgroundColor,
        imageFilename: imageExportFilename,
        importedFile: importedFile ?? undefined,
        initialPose: exportPoseReference.current,
        modelFilenameOverride: modelFilename,
        exportSettings: reactExportSettings,
        previewDistance,
      }),
    );

    if (isImageMode && imageFile) {
      downloadBlob(imageExportFilename ?? imageFile.name, imageFile);
    } else if (importedFile) {
      downloadBlob(modelFilename ?? importedFile.name, importedFile);
    }
  }, [
    defaultReactAssetPublicUrl,
    exportArtifactNames,
    exportBackground,
    imageFile,
    previewDistance,
    reactAssetPublicUrl,
    reactExportSettings,
    reactExportUsesExternalAsset,
    selectedImportedFile,
    selectedShape,
    state.settings,
  ]);

  const handleExportHalftoneImage = useCallback(
    async (width: number, height: number) => {
      const snapshotFn = snapshotReference.current;
      const kebabName = exportArtifactNames.fileBaseName;

      if (!snapshotFn) {
        return;
      }

      const blob = await snapshotFn(width, height, {
        backgroundColor: state.settings.background.color,
        includeBackground: exportBackground,
      });

      if (!blob) {
        return;
      }

      downloadBlob(`${kebabName}-${width}x${height}.png`, blob);
    },
    [
      exportArtifactNames.fileBaseName,
      exportBackground,
      state.settings.background.color,
    ],
  );

  const buildHalftoneSvg = useCallback(
    (width: number, height: number) => {
      if (state.settings.sourceMode !== 'image' || !imageElement) {
        return null;
      }

      return generateImageHalftoneSvg({
        backgroundColor: state.settings.background.color,
        image: imageElement,
        includeBackground: exportBackground,
        previewDistance,
        settings: state.settings,
        width,
        height,
      });
    },
    [
      exportBackground,
      imageElement,
      previewDistance,
      state.settings,
    ],
  );

  const handleExportHalftoneSvg = useCallback(
    (width: number, height: number) => {
      const svg = buildHalftoneSvg(width, height);

      if (!svg) {
        dispatch({
          type: 'setStatus',
          message: 'Could not export the halftone SVG.',
          isError: true,
        });
        return;
      }

      downloadBlob(
        `${exportArtifactNames.fileBaseName}-${width}x${height}.svg`,
        new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      );
      dispatch({
        type: 'setStatus',
        message: 'Halftone SVG downloaded.',
      });
      window.setTimeout(() => dispatch({ type: 'clearStatus' }), 2000);
    },
    [
      buildHalftoneSvg,
      exportArtifactNames.fileBaseName,
    ],
  );

  const handleCopyHalftoneSvg = useCallback(
    async (width: number, height: number) => {
      const svg = buildHalftoneSvg(width, height);

      if (!svg) {
        dispatch({
          type: 'setStatus',
          message: 'Could not copy the halftone SVG.',
          isError: true,
        });
        return;
      }

      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });

      if (
        typeof ClipboardItem !== 'undefined' &&
        typeof navigator.clipboard?.write === 'function'
      ) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/svg+xml': svgBlob,
              'text/plain': new Blob([svg], { type: 'text/plain' }),
            }),
          ]);
          dispatch({
            type: 'setStatus',
            message: 'SVG copied to clipboard.',
          });
          window.setTimeout(() => dispatch({ type: 'clearStatus' }), 2000);
          return;
        } catch {
          // Fall through to plain-text clipboard copy below.
        }
      }

      if (typeof navigator.clipboard?.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(svg);
          dispatch({
            type: 'setStatus',
            message: 'SVG markup copied to clipboard as text.',
          });
          window.setTimeout(() => dispatch({ type: 'clearStatus' }), 2000);
          return;
        } catch {
          dispatch({
            type: 'setStatus',
            message: 'Could not copy the halftone SVG.',
            isError: true,
          });
          return;
        }
      }

      dispatch({
        type: 'setStatus',
        message: 'SVG clipboard copy is not supported in this browser.',
        isError: true,
      });
    },
    [buildHalftoneSvg],
  );

  const handleExportHtml = useCallback(async () => {
    const componentName = exportArtifactNames.componentName;
    const kebabName = exportArtifactNames.fileBaseName;
    const isImageMode = state.settings.sourceMode === 'image';
    const importedFile = selectedImportedFile;
    const exportBackgroundColor = exportBackground
      ? state.settings.background.color
      : 'transparent';

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
        {
          background: exportBackgroundColor,
          imageFilename: imageExportFilename,
          importedFile: importedFile ?? undefined,
          initialPose: exportPoseReference.current,
          modelFilenameOverride: modelFilename,
          previewDistance,
        },
      ),
    );

    if (isImageMode && imageFile) {
      downloadBlob(imageExportFilename ?? imageFile.name, imageFile);
    }
  }, [
    exportArtifactNames,
    exportBackground,
    imageFile,
    previewDistance,
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
    const geometryCache = geometryCacheReference.current;

    return () => {
      disposeGeometryCache(geometryCache);
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

      <ContentRegion $panelOpen={controlsVisible}>
        <Hint $tone={backgroundTone} $visible={state.showHint}>
          {state.settings.sourceMode === 'image'
            ? 'Hover to relight the halftone'
            : state.settings.animation.followDragEnabled
              ? 'Click & drag to rotate'
              : state.settings.animation.followHoverEnabled
                ? 'Move the pointer to tilt the object'
                : state.settings.animation.autoRotateEnabled
                  ? 'Idle auto-rotate is active'
                  : 'Open Animations to add motion'}
        </Hint>
        <Status
          $error={state.statusIsError}
          $tone={backgroundTone}
          $visible={state.statusMessage.length > 0}
        >
          {state.statusMessage}
        </Status>

        <CanvasLayer ref={canvasLayerReference}>
          <HalftoneCanvas
            geometry={activeGeometry}
            initialPose={canvasInitialPose}
            imageElement={imageElement}
            onFirstInteraction={handleFirstInteraction}
            onPoseChange={handlePoseChange}
            previewDistance={previewDistance}
            settings={state.settings}
            snapshotRef={snapshotReference}
          />
        </CanvasLayer>
      </ContentRegion>

      <ControlsPositioner>
        <ControlsPanelFrame $visible={controlsVisible}>
          <ControlsPanel
            activeTab={state.activeTab}
            defaultExportName={defaultExportName}
            exportBackground={exportBackground}
            exportName={exportName}
            imageFileName={imageFile?.name ?? null}
            onAnimationSettingsChange={(value) =>
              dispatch({ type: 'patchAnimation', value })
            }
            onCopyShareLink={handleCopyShareLink}
            onDashColorChange={(value) =>
              dispatch({
                type: 'patchHalftone',
                value: { dashColor: value },
              })
            }
            onHoverDashColorChange={(value) =>
              dispatch({
                type: 'patchHalftone',
                value: { hoverDashColor: value },
              })
            }
            onCopyHalftoneImage={(width, height) => {
              void handleCopyHalftoneImage(width, height);
            }}
            onExportHalftoneImage={(width, height) => {
              void handleExportHalftoneImage(width, height);
            }}
            onExportHalftoneSvg={(width, height) => {
              void handleExportHalftoneSvg(width, height);
            }}
            onCopyHalftoneSvg={(width, height) => {
              void handleCopyHalftoneSvg(width, height);
            }}
            onExportBackgroundChange={setExportBackground}
            onExportHtml={() => {
              void handleExportHtml();
            }}
            onExportNameChange={setExportName}
            onExportReact={handleExportReact}
            onReactAssetPublicUrlChange={setReactAssetPublicUrl}
            onReactExportSettingChange={handleReactExportSettingChange}
            onImportPreset={() => {
              void handleImportPreset();
            }}
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
            onToggleVisibility={() => setControlsVisible((visible) => !visible)}
            onUploadSource={() => {
              void handleUploadSource();
            }}
            previewDistance={previewDistance}
            reactAssetPublicUrl={reactAssetPublicUrl}
            reactExportSettings={reactExportSettings}
            selectedShape={selectedShape}
            settings={state.settings}
            shapeOptions={shapeOptions}
            defaultReactAssetPublicUrl={defaultReactAssetPublicUrl}
            showReactAssetPublicUrl={
              reactExportSettings.includePublicAssetUrl &&
              reactExportUsesExternalAsset
            }
            visible={controlsVisible}
          />
        </ControlsPanelFrame>
      </ControlsPositioner>

      <HiddenFileInput
        accept=".fbx,.glb,.png,.jpg,.jpeg,.webp,.gif,.svg"
        onChange={handleFileInputChange}
        ref={fileInputReference}
        type="file"
      />
      <HiddenFileInput
        accept=".tsx,.html,.fbx,.glb,.png,.jpg,.jpeg,.webp,.gif,.svg"
        multiple
        onChange={handlePresetFileInputChange}
        ref={presetFileInputReference}
        type="file"
      />
    </StudioShell>
  );
}
