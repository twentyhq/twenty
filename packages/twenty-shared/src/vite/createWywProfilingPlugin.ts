/* oxlint-disable no-console */
import { type Plugin } from 'vite';

const LINARIA_IMPORT_RE = /@linaria/;

// Minimal Linaria code used to trigger WYW's Babel JIT compilation before
// the real build starts, so the first real file doesn't pay the cold-start cost.
// The ID must be inside the project root so WYW can resolve @linaria/react
// from node_modules. It is set in configResolved once config.root is known.
const WARMUP_CODE = `import { styled } from '@linaria/react';
const StyledDiv = styled.div\`color: red;\`;
`;

type WywProfilingOptions = {
  // Used only for dev-mode real-time slow-file alerts. Summary always uses 10x avg.
  devSlowThresholdMs?: number;
  topSlowFilesCount?: number;
  warmupThresholdMs?: number;
};

export const createWywProfilingPlugin = (
  wywPlugin: Plugin,
  options?: WywProfilingOptions,
): Plugin => {
  const devSlowThresholdMs = options?.devSlowThresholdMs ?? 200;
  const topSlowFilesCount = options?.topSlowFilesCount ?? 10;
  const warmupThresholdMs = options?.warmupThresholdMs ?? 500;

  let totalMs = 0;
  let fileCount = 0;
  let skippedCount = 0;
  let isDevMode = false;
  let warmupId = `${process.cwd()}/src/__wyw_warmup__.tsx`;
  const allTransforms: { id: string; ms: number }[] = [];
  const originalTransform = wywPlugin.transform;

  return {
    ...wywPlugin,
    enforce: 'pre' as const,
    configResolved(config) {
      isDevMode = config.command === 'serve';
      warmupId = `${config.root}/src/__wyw_warmup__.tsx`;
      if (typeof wywPlugin.configResolved === 'function') {
        (wywPlugin.configResolved as Function).call(this, config);
      }
    },
    async buildStart() {
      console.log(`[linaria/wyw] Starting CSS pre-build`);

      const warmupStart = performance.now();
      try {
        const warmupResult = (originalTransform as Function).call(
          this,
          WARMUP_CODE,
          warmupId,
        );
        if (
          warmupResult !== null &&
          typeof warmupResult === 'object' &&
          'then' in warmupResult
        ) {
          await warmupResult;
        }
      } catch {
        // Expected: fake file path causes module resolution errors, but
        // Babel's JIT compilation is already triggered — that's all we need.
      }

      const warmupMs = performance.now() - warmupStart;
      const warmupWarning = warmupMs > warmupThresholdMs ? ' ⚠️  slow' : '';
      console.log(
        `[linaria/wyw] Pre-warm: ${warmupMs.toFixed(0)}ms${warmupWarning}`,
      );
    },
    transform(code: string, id: string, ...rest: unknown[]) {
      if (!LINARIA_IMPORT_RE.test(code)) {
        skippedCount++;
        return null;
      }

      const start = performance.now();
      const result = (originalTransform as Function).call(
        this,
        code,
        id,
        ...rest,
      );

      const handleTiming = (elapsed: number) => {
        totalMs += elapsed;
        fileCount++;
        allTransforms.push({ id, ms: elapsed });

        if (isDevMode && elapsed > devSlowThresholdMs) {
          console.log(
            `[linaria/wyw] slow: ${id.replace(process.cwd(), '')} ${elapsed.toFixed(0)}ms`,
          );
        }
      };

      if (result && typeof result === 'object' && 'then' in result) {
        return (result as Promise<unknown>).then((res) => {
          handleTiming(performance.now() - start);
          return res;
        });
      }

      handleTiming(performance.now() - start);
      return result;
    },
    closeBundle: () => {
      const avg = fileCount > 0 ? totalMs / fileCount : 0;
      const dynamicThreshold = Math.round(10 * avg);
      const slowFiles = allTransforms.filter((f) => f.ms > dynamicThreshold);

      console.log('\n[linaria/wyw] ===== CSS PRE-BUILD SUMMARY =====');
      console.log(`[linaria/wyw] Files transformed: ${fileCount}`);
      console.log(`[linaria/wyw] Files skipped (no @linaria): ${skippedCount}`);
      console.log(`[linaria/wyw] Transform time: ${totalMs.toFixed(0)}ms`);
      console.log(
        `[linaria/wyw] Avg per transformed file: ${avg.toFixed(1)}ms`,
      );
      if (slowFiles.length > 0) {
        console.log(
          `[linaria/wyw] Slow files (>10x avg = ${dynamicThreshold}ms):`,
        );
        slowFiles
          .sort((a, b) => b.ms - a.ms)
          .slice(0, topSlowFilesCount)
          .forEach((slowFile) =>
            console.log(
              `[linaria/wyw]   ${slowFile.ms.toFixed(0)}ms ${slowFile.id.replace(process.cwd(), '')}`,
            ),
          );
      }
      console.log('[linaria/wyw] ==========================================\n');
    },
  };
};
