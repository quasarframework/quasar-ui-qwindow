import type { ComputedRef } from 'vue'
import type { Screen } from 'quasar'

export type NumberArray = number[]
export type StringArray = string[]

/**
 * Quasar screen breakpoints that can be used as the mobile cutoff.
 */
export type QWindowResponsiveBreakpoint = keyof Screen['lt']

/**
 * Props commonly used to size and position a QWindow instance.
 */
export interface QWindowResponsiveProps {
  height: number
  startX: number
  startY: number
  width: number
}

/**
 * Predicate used when an app wants custom responsive behavior instead of a fixed breakpoint.
 */
export type QWindowResponsivePredicate = (screen: Screen) => boolean

/**
 * Options for generating responsive QWindow size and position props.
 */
export interface QWindowResponsivePropsOptions extends QWindowResponsiveProps {
  /**
   * Quasar breakpoint where mobile values start applying. Defaults to "sm".
   */
  mobileBreakpoint?: QWindowResponsiveBreakpoint

  /**
   * Height to use while the current screen matches the mobile condition.
   */
  mobileHeight?: number

  /**
   * Custom predicate for deciding when mobile values should apply.
   */
  mobilePredicate?: QWindowResponsivePredicate

  /**
   * Horizontal start position to use while the current screen matches the mobile condition.
   */
  mobileStartX?: number

  /**
   * Vertical start position to use while the current screen matches the mobile condition.
   */
  mobileStartY?: number

  /**
   * Width to use while the current screen matches the mobile condition.
   */
  mobileWidth?: number

  /**
   * Minimum viewport width used when clamping the mobile width. Defaults to 280.
   */
  minViewportWidth?: number

  /**
   * Horizontal viewport padding subtracted before clamping the mobile width. Defaults to 32.
   */
  viewportPadding?: number
}

/**
 * Creates a reactive QWindow prop object that swaps to mobile-friendly size and position values.
 *
 * @param options - Desktop values plus optional mobile overrides.
 * @returns A computed object that can be passed directly to QWindow with `v-bind`.
 */
export function useQWindowResponsiveProps(
  options: QWindowResponsivePropsOptions,
): ComputedRef<QWindowResponsiveProps>
