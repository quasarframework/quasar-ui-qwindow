import { defineBoot } from "#q-app";
import VuePlugin from "@quasar/quasar-ui-qwindow";

export default defineBoot(({ app }) => {
  app.use(VuePlugin);
});
