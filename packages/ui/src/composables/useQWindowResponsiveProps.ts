import { computed, type ComputedRef } from "vue";
import { type Screen, useQuasar } from "quasar";

/**
 * Quasar screen breakpoints that can be used as the mobile cutoff.
 */
export type QWindowResponsiveBreakpoint = keyof Screen["lt"];

/**
 * Props commonly used to size and position a QWindow instance.
 */
export interface QWindowResponsiveProps {
  height: number;
  startX: number;
  startY: number;
  width: number;
}

/**
 * Predicate used when an app wants custom responsive behavior instead of a fixed breakpoint.
 */
export type QWindowResponsivePredicate = (screen: Screen) => boolean;

/**
 * Options for generating responsive QWindow size and position props.
 */
export interface QWindowResponsivePropsOptions extends QWindowResponsiveProps {
  /**
   * Quasar breakpoint where mobile values start applying. Defaults to "sm".
   */
  mobileBreakpoint?: QWindowResponsiveBreakpoint;

  /**
   * Height to use while the current screen matches the mobile condition.
   */
  mobileHeight?: number;

  /**
   * Custom predicate for deciding when mobile values should apply.
   */
  mobilePredicate?: QWindowResponsivePredicate;

  /**
   * Horizontal start position to use while the current screen matches the mobile condition.
   */
  mobileStartX?: number;

  /**
   * Vertical start position to use while the current screen matches the mobile condition.
   */
  mobileStartY?: number;

  /**
   * Width to use while the current screen matches the mobile condition.
   */
  mobileWidth?: number;

  /**
   * Minimum viewport width used when clamping the mobile width. Defaults to 280.
   */
  minViewportWidth?: number;

  /**
   * Horizontal viewport padding subtracted before clamping the mobile width. Defaults to 32.
   */
  viewportPadding?: number;
}

const DEFAULT_MOBILE_BREAKPOINT: QWindowResponsiveBreakpoint = "sm";
const DEFAULT_MOBILE_START_X = 16;
const DEFAULT_MOBILE_START_Y = 96;
const DEFAULT_MIN_VIEWPORT_WIDTH = 280;
const DEFAULT_VIEWPORT_PADDING = 32;

/**
 * Creates a reactive QWindow prop object that swaps to mobile-friendly size and position values.
 *
 * @param options - Desktop values plus optional mobile overrides.
 * @returns A computed object that can be passed directly to QWindow with `v-bind`.
 */
export function useQWindowResponsiveProps(
  options: QWindowResponsivePropsOptions,
): ComputedRef<QWindowResponsiveProps> {
  const $q = useQuasar();

  return computed(() => {
    const isMobile =
      options.mobilePredicate?.($q.screen) ??
      $q.screen.lt[options.mobileBreakpoint ?? DEFAULT_MOBILE_BREAKPOINT];

    if (isMobile !== true) {
      return {
        height: options.height,
        startX: options.startX,
        startY: options.startY,
        width: options.width,
      };
    }

    const viewportPadding = options.viewportPadding ?? DEFAULT_VIEWPORT_PADDING;
    const minViewportWidth = options.minViewportWidth ?? DEFAULT_MIN_VIEWPORT_WIDTH;
    const safeViewportWidth = Math.max(minViewportWidth, $q.screen.width - viewportPadding);

    return {
      height: options.mobileHeight ?? options.height,
      startX: options.mobileStartX ?? DEFAULT_MOBILE_START_X,
      startY: options.mobileStartY ?? DEFAULT_MOBILE_START_Y,
      width: Math.min(options.mobileWidth ?? options.width, safeViewportWidth),
    };
  });
}
