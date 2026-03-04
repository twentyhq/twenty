commit eda905f271d72e984186509869caa7e0de243657
Author: Charles Bochet <charlesBochet@users.noreply.github.com>
Date:   Wed Mar 4 17:04:16 2026 +0100

    [DevXP] Improve Linaria pre-build speed (#18382)
    
    ## Summary
    
    This PR improves Linaria/WYW pre-build speed and continues the migration
    of `twenty-ui` components away from runtime `ThemeContext` reads toward
    static CSS variables and theme constants.
    
    ### Linaria/WYW profiling plugin improvements (`twenty-shared`)
    
    - **Babel JIT warmup**: added a `buildStart` warmup step that triggers
    WYW's Babel JIT compilation before the real build starts, so the first
    real file doesn't pay the cold-start penalty
    - **`configResolved` hook**: detects dev vs prod mode and resolves the
    correct warmup file path relative to `config.root`
    - **Dev-only per-file logging**: slow file warnings are now gated behind
    `isDevMode`, keeping production/CI build output clean
    - **`closeBundle` summary**: moved the final top-slow-files report to
    `closeBundle` for accurate end-of-build reporting
    - **Removed noisy progress interval logging** in favor of the warmup log
    + final summary
    
    ### Migration from `ThemeContext` to static CSS variables / constants
    
    Across `twenty-ui`, replaced runtime `useTheme()` reads with:
    - `themeCssVariables` CSS custom properties (colors, spacing)
    - Hard-coded design-system constants (`ICON.size.md` → `16`,
    `ICON.stroke.sm` → `1.6`) so components no longer need a React context
    at render time — enabling Linaria static extraction
    
    **Components migrated:**
    - `Button`, `AnimatedButton`, `LightButton`, `LightIconButton`,
    `AnimatedLightIconButton`, `ButtonIcon`, `ButtonSoon`
    - `ProgressBar` (Framer Motion width animation → CSS `transition`)
    - `Info`, `HorizontalSeparator`, `LinkChip`
    - `MenuPicker`, `MenuItemLeftContent`, `MenuItemIconWithGripSwap`,
    `NavigationBarItem`
    - `JsonArrow`, `JsonNestedNode`
    - `ModalHeader`
    
    ### Other
    - Added `aria-valuenow` to `ProgressBar` for accessibility
    - `VisibilityHidden` component updated to inline accessibility styles

diff --git a/packages/twenty-shared/src/vite/createWywProfilingPlugin.ts b/packages/twenty-shared/src/vite/createWywProfilingPlugin.ts
index cb184a4374..27aae3f859 100644
--- a/packages/twenty-shared/src/vite/createWywProfilingPlugin.ts
+++ b/packages/twenty-shared/src/vite/createWywProfilingPlugin.ts
@@ -3,33 +3,75 @@ import { type Plugin } from 'vite';
 
 const LINARIA_IMPORT_RE = /@linaria/;
 
+// Minimal Linaria code used to trigger WYW's Babel JIT compilation before
+// the real build starts, so the first real file doesn't pay the cold-start cost.
+// The ID must be inside the project root so WYW can resolve @linaria/react
+// from node_modules. It is set in configResolved once config.root is known.
+const WARMUP_CODE = `import { styled } from '@linaria/react';
+const StyledDiv = styled.div\`color: red;\`;
+`;
+
 type WywProfilingOptions = {
-  slowThresholdMs?: number;
+  // Used only for dev-mode real-time slow-file alerts. Summary always uses 10x avg.
+  devSlowThresholdMs?: number;
   topSlowFilesCount?: number;
-  progressIntervalFiles?: number;
+  warmupThresholdMs?: number;
 };
 
 export const createWywProfilingPlugin = (
   wywPlugin: Plugin,
   options?: WywProfilingOptions,
 ): Plugin => {
-  const slowThresholdMs = options?.slowThresholdMs ?? 50;
+  const devSlowThresholdMs = options?.devSlowThresholdMs ?? 200;
   const topSlowFilesCount = options?.topSlowFilesCount ?? 10;
-  const progressIntervalFiles = options?.progressIntervalFiles ?? 50;
+  const warmupThresholdMs = options?.warmupThresholdMs ?? 500;
 
   let totalMs = 0;
   let fileCount = 0;
   let skippedCount = 0;
-  const slowFiles: { id: string; ms: number }[] = [];
+  let isDevMode = false;
+  let warmupId = `${process.cwd()}/src/__wyw_warmup__.tsx`;
+  const allTransforms: { id: string; ms: number }[] = [];
   const originalTransform = wywPlugin.transform;
 
-  console.log(
-    `[linaria/wyw] CSS pre-build profiling enabled (slow threshold: ${slowThresholdMs}ms)`,
-  );
-
   return {
     ...wywPlugin,
     enforce: 'pre' as const,
+    configResolved(config) {
+      isDevMode = config.command === 'serve';
+      warmupId = `${config.root}/src/__wyw_warmup__.tsx`;
+      if (typeof wywPlugin.configResolved === 'function') {
+        (wywPlugin.configResolved as Function).call(this, config);
+      }
+    },
+    async buildStart() {
+      console.log(`[linaria/wyw] Starting CSS pre-build`);
+
+      const warmupStart = performance.now();
+      try {
+        const warmupResult = (originalTransform as Function).call(
+          this,
+          WARMUP_CODE,
+          warmupId,
+        );
+        if (
+          warmupResult !== null &&
+          typeof warmupResult === 'object' &&
+          'then' in warmupResult
+        ) {
+          await warmupResult;
+        }
+      } catch {
+        // Expected: fake file path causes module resolution errors, but
+        // Babel's JIT compilation is already triggered — that's all we need.
+      }
+
+      const warmupMs = performance.now() - warmupStart;
+      const warmupWarning = warmupMs > warmupThresholdMs ? ' ⚠️  slow' : '';
+      console.log(
+        `[linaria/wyw] Pre-warm: ${warmupMs.toFixed(0)}ms${warmupWarning}`,
+      );
+    },
     transform(code: string, id: string, ...rest: unknown[]) {
       if (!LINARIA_IMPORT_RE.test(code)) {
         skippedCount++;
@@ -47,14 +89,11 @@ export const createWywProfilingPlugin = (
       const handleTiming = (elapsed: number) => {
         totalMs += elapsed;
         fileCount++;
+        allTransforms.push({ id, ms: elapsed });
 
-        if (elapsed > slowThresholdMs) {
-          slowFiles.push({ id, ms: elapsed });
-        }
-
-        if (fileCount % progressIntervalFiles === 0) {
+        if (isDevMode && elapsed > devSlowThresholdMs) {
           console.log(
-            `[linaria/wyw] CSS pre-build progress: ${fileCount} transformed, ${skippedCount} skipped, ${totalMs.toFixed(0)}ms total`,
+            `[linaria/wyw] slow: ${id.replace(process.cwd(), '')} ${elapsed.toFixed(0)}ms`,
           );
         }
       };
@@ -69,18 +108,21 @@ export const createWywProfilingPlugin = (
       handleTiming(performance.now() - start);
       return result;
     },
-    buildEnd() {
-      console.log('\n[linaria/wyw] ===== CSS PRE-BUILD TIMING SUMMARY =====');
+    closeBundle: () => {
+      const avg = fileCount > 0 ? totalMs / fileCount : 0;
+      const dynamicThreshold = Math.round(10 * avg);
+      const slowFiles = allTransforms.filter((f) => f.ms > dynamicThreshold);
+
+      console.log('\n[linaria/wyw] ===== CSS PRE-BUILD SUMMARY =====');
       console.log(`[linaria/wyw] Files transformed: ${fileCount}`);
       console.log(`[linaria/wyw] Files skipped (no @linaria): ${skippedCount}`);
       console.log(`[linaria/wyw] Transform time: ${totalMs.toFixed(0)}ms`);
       console.log(
-        `[linaria/wyw] Avg per transformed file: ${fileCount > 0 ? (totalMs / fileCount).toFixed(1) : 0}ms`,
+        `[linaria/wyw] Avg per transformed file: ${avg.toFixed(1)}ms`,
       );
-
       if (slowFiles.length > 0) {
         console.log(
-          `[linaria/wyw] Slow CSS pre-build files (>${slowThresholdMs}ms):`,
+          `[linaria/wyw] Slow files (>10x avg = ${dynamicThreshold}ms):`,
         );
         slowFiles
           .sort((a, b) => b.ms - a.ms)
@@ -91,7 +133,6 @@ export const createWywProfilingPlugin = (
             ),
           );
       }
-
       console.log('[linaria/wyw] ==========================================\n');
     },
   };
