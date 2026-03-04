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

diff --git a/packages/twenty-ui/src/layout/modal/components/ModalHeader.tsx b/packages/twenty-ui/src/layout/modal/components/ModalHeader.tsx
index 82d9671098..1b31360e5b 100644
--- a/packages/twenty-ui/src/layout/modal/components/ModalHeader.tsx
+++ b/packages/twenty-ui/src/layout/modal/components/ModalHeader.tsx
@@ -40,7 +40,6 @@ export type ModalHeaderProps = React.PropsWithChildren & {
   hasBorderBottom?: boolean;
   paddingHorizontal?: number;
   backgroundColor?: string;
-  className?: string;
 };
 
 export const ModalHeader = ({
@@ -50,7 +49,6 @@ export const ModalHeader = ({
   hasBorderBottom,
   paddingHorizontal,
   backgroundColor,
-  className,
 }: ModalHeaderProps) => (
   <StyledHeader
     noPadding={noPadding}
@@ -58,7 +56,6 @@ export const ModalHeader = ({
     hasBorderBottom={hasBorderBottom}
     paddingHorizontal={paddingHorizontal}
     backgroundColor={backgroundColor}
-    className={className}
   >
     {children}
   </StyledHeader>
