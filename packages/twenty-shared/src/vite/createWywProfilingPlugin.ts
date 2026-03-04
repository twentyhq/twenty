/* eslint-disable no-console */
import { type Plugin } from 'vite';

const LINARIA_IMPORT_RE = /@linaria/;

type WywProfilingOptions = {
  slowThresholdMs?: number;
  topSlowFilesCount?: number;
  progressIntervalFiles?: number;
};

export const createWywProfilingPlugin = (
  wywPlugin: Plugin,
  options?: WywProfilingOptions,
): Plugin => {
  const slowThresholdMs = options?.slowThresholdMs ?? 50;
  const topSlowFilesCount = options?.topSlowFilesCount ?? 10;
  const progressIntervalFiles = options?.progressIntervalFiles ?? 50;

  let totalMs = 0;
  let fileCount = 0;
  let skippedCount = 0;
  const slowFiles: { id: string; ms: number }[] = [];
  const originalTransform = wywPlugin.transform;

  console.log(
    `[linaria/wyw] CSS pre-build profiling enabled (slow threshold: ${slowThresholdMs}ms)`,
  );

  return {
    ...wywPlugin,
    enforce: 'pre' as const,
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

        if (elapsed > slowThresholdMs) {
          slowFiles.push({ id, ms: elapsed });
        }

        if (fileCount % progressIntervalFiles === 0) {
          console.log(
            `[linaria/wyw] CSS pre-build progress: ${fileCount} transformed, ${skippedCount} skipped, ${totalMs.toFixed(0)}ms total`,
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
    buildEnd() {
      console.log('\n[linaria/wyw] ===== CSS PRE-BUILD TIMING SUMMARY =====');
      console.log(`[linaria/wyw] Files transformed: ${fileCount}`);
      console.log(`[linaria/wyw] Files skipped (no @linaria): ${skippedCount}`);
      console.log(`[linaria/wyw] Transform time: ${totalMs.toFixed(0)}ms`);
      console.log(
        `[linaria/wyw] Avg per transformed file: ${fileCount > 0 ? (totalMs / fileCount).toFixed(1) : 0}ms`,
      );

      if (slowFiles.length > 0) {
        console.log(
          `[linaria/wyw] Slow CSS pre-build files (>${slowThresholdMs}ms):`,
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
