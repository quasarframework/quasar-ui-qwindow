import { computed } from "vue";
import { useQuasar } from "quasar";

type ResponsiveWindowOptions = {
  width: number;
  height: number;
  startX: number;
  startY: number;
  mobileWidth?: number;
  mobileHeight?: number;
  mobileStartX?: number;
  mobileStartY?: number;
};

export function useResponsiveWindow(options: ResponsiveWindowOptions) {
  const $q = useQuasar();
  const isMobile = computed(() => $q.screen.lt.sm);

  const width = computed(() => {
    if (isMobile.value !== true) {
      return options.width;
    }

    const safeViewportWidth = Math.max(280, $q.screen.width - 32);
    return Math.min(options.mobileWidth ?? options.width, safeViewportWidth);
  });

  const height = computed(() =>
    isMobile.value === true ? (options.mobileHeight ?? options.height) : options.height,
  );
  const startX = computed(() =>
    isMobile.value === true ? (options.mobileStartX ?? 16) : options.startX,
  );
  const startY = computed(() =>
    isMobile.value === true ? (options.mobileStartY ?? 96) : options.startY,
  );

  return {
    height,
    startX,
    startY,
    width,
  };
}
