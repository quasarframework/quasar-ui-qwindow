<template>
  <form
    ref="formRef"
    method="post"
    action="https://codepen.io/pen/define/"
    target="_blank"
    rel="noopener"
    class="hidden"
  >
    <input v-if="active" type="hidden" name="data" :value="options" />
  </form>
</template>

<script setup lang="ts">
import { Quasar } from "quasar";
import { ref, reactive, computed, nextTick } from "vue";

import { slugify } from "./markdown-utils";

import siteConfig from "../../siteConfig";

type CodepenParts = {
  Template?: string;
  Script?: string;
  Style?: string;
  [key: string]: string | undefined;
};

const defaultCssResources = [
  "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons",
  `https://cdn.jsdelivr.net/npm/quasar@${Quasar.version}/dist/quasar.min.css`,
];

const defaultJsResources = [
  "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js",
  `https://cdn.jsdelivr.net/npm/quasar@${Quasar.version}/dist/quasar.umd.prod.js`,
];

function indent(code: string, spaces = 2) {
  const padding = " ".repeat(spaces);
  return code
    .split("\n")
    .map((line) => (line.trim().length > 0 ? padding + line : line))
    .join("\n");
}

function getImportNames(content: string, packageName: string) {
  const names = new Set<string>();
  const importRe = new RegExp(`import\\s+{([^}'"\\n]+)}\\s+from\\s+['"]${packageName}['"];?`, "g");
  let match: RegExpExecArray | null;

  while ((match = importRe.exec(content)) !== null) {
    for (const part of match[1].split(",")) {
      const name = part.trim().replace(/\s+as\s+/g, ": ");

      if (name.length > 0) {
        names.add(name);
      }
    }
  }

  return [...names];
}

function getGlobalImportLines(content: string) {
  const vueImports = getImportNames(content, "vue");
  const quasarImports = getImportNames(content, "quasar");

  return [
    vueImports.length > 0 ? `const { ${vueImports.join(", ")} } = Vue` : "",
    quasarImports.length > 0 ? `const { ${quasarImports.join(", ")} } = Quasar` : "",
  ].filter((line) => line.length > 0);
}

function stripImports(content: string) {
  return content
    .replace(/^\s*import\s+type\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?\s*$/gm, "")
    .replace(/^\s*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?\s*$/gm, "")
    .replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, "")
    .trim();
}

function stripCompilerMacros(content: string) {
  return content
    .replace(/^\s*defineOptions\(\s*\{[\s\S]*?\}\s*\)\s*;?\s*$/gm, "")
    .replace(/^\s*defineExpose\(\s*\{[\s\S]*?\}\s*\)\s*;?\s*$/gm, "")
    .trim();
}

function getScriptBlock(script: string, setup: boolean) {
  const re = setup
    ? /<script\s+setup([^>]*)>([\s\S]*?)<\/script>/
    : /<script(?!\s+setup)([^>]*)>([\s\S]*?)<\/script>/;
  const match = re.exec(script);

  return {
    attrs: match?.[1] ?? "",
    content: match?.[2] ?? "",
  };
}

function getSetupReturnNames(content: string) {
  const names = new Set<string>();
  const declarationRe = /(?:^|\n)\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g;
  const functionRe = /(?:^|\n)\s*function\s+([A-Za-z_$][\w$]*)/g;
  let match: RegExpExecArray | null;

  while ((match = declarationRe.exec(content)) !== null) {
    names.add(match[1]);
  }

  while ((match = functionRe.exec(content)) !== null) {
    names.add(match[1]);
  }

  return [...names];
}

function getAppSetup() {
  return ["app.use(Quasar, { config: {} })", siteConfig.codepen?.jsSetup ?? ""]
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

function createSetupScript(script: string) {
  const { content } = getScriptBlock(script, true);
  const globalImports = getGlobalImportLines(content);
  const setupContent = stripCompilerMacros(stripImports(content));
  const returnNames = getSetupReturnNames(setupContent);
  const setupBody = [
    setupContent.length > 0 ? indent(setupContent, 4) : "",
    returnNames.length > 0 ? `    return { ${returnNames.join(", ")} }` : "",
  ]
    .filter((line) => line.length > 0)
    .join("\n\n");

  return [
    ...globalImports,
    `const app = Vue.createApp({
  setup () {
${setupBody}
  }
})`,
    getAppSetup(),
    "app.mount('#q-app')",
  ].join("\n\n");
}

function createOptionsScript(script: string) {
  const { content } = getScriptBlock(script, false);
  const globalImports = getGlobalImportLines(content);
  const match = /export\s+default\s+{([\s\S]*)}/.exec(content);
  const beforeDefault =
    match === null ? stripImports(content) : stripImports(content.slice(0, match.index));
  let component = match?.[1]?.trim() ?? "";

  if (component.length > 0) {
    component = "\n  " + component + "\n";
  }

  return [
    ...globalImports,
    beforeDefault,
    `const app = Vue.createApp({${component}})`,
    getAppSetup(),
    "app.mount('#q-app')",
  ]
    .filter((line) => line.length > 0)
    .join("\n\n");
}

const props = defineProps({ title: { type: String, required: true } });

const active = ref(false);
const formRef = ref(null);
const def = reactive<{ parts: CodepenParts }>({ parts: {} });

const cssResources = computed(() => {
  return [...defaultCssResources, ...(siteConfig.codepen?.cssExternal ?? [])].join(";");
});

const jsResources = computed(() => {
  return [...defaultJsResources, ...(siteConfig.codepen?.jsExternal ?? [])].join(";");
});

const css = computed(() => {
  return (def.parts.Style || "").replace(/(<style.*?>|<\/style>)/g, "").trim();
});

const cssPreprocessor = computed(() => {
  const lang = /<style.*lang=["'](.*)["'].*>/.exec(def.parts.Style || "");

  return lang ? lang[1] : "none";
});

const js = computed(() => {
  const script = def.parts.Script ?? "";

  return script.includes("<script setup") === true
    ? createSetupScript(script)
    : createOptionsScript(script);
});

const jsPreProcessor = computed(() => {
  const setupBlock = getScriptBlock(def.parts.Script ?? "", true);
  const optionsBlock = getScriptBlock(def.parts.Script ?? "", false);
  const attrs = setupBlock.content.length > 0 ? setupBlock.attrs : optionsBlock.attrs;

  return (
    siteConfig.codepen?.jsPreProcessor ?? (/lang=["']ts["']/.test(attrs) ? "typescript" : "babel")
  );
});

const html = computed(() => {
  return (def.parts.Template || "")
    .replace(/(<template>|<\/template>$)/g, "")
    .replace(/\n/g, "\n  ")
    .replace(/([\w]+=")([^"]*?)(")/g, function (match, p1, p2, p3) {
      return p1 + p2.replace(/>/g, "___TEMP_REPLACEMENT___") + p3;
    })
    .replace(/<(q-[\w-]+|div)([^>]*?)\s*?([\n\r][\t ]+)?\/>/gs, "<$1$2$3></$1>")
    .replace(
      /(<template[^>]*>)(\s*?(?:[\n\r][\t ]+)?)<(thead|tbody|tfoot)/gs,
      "$1$2<___PREVENT_TEMPLATE___$3",
    )
    .replace(/<(thead|tbody|tfoot)(.*?)[\n\r]?(\s*)<\/\1>/gs, function (match, p1, p2, p3) {
      return (
        "<template>\n" +
        p3 +
        "  <" +
        p1 +
        p2.split(/[\n\r]+/g).join("\n  ") +
        "\n" +
        p3 +
        "  </" +
        p1 +
        ">\n" +
        p3 +
        "</template>"
      );
    })
    .replace(/___PREVENT_TEMPLATE___/g, "")
    .replace(/___TEMP_REPLACEMENT___/g, ">")
    .replace(/^\s{2}/gm, "")
    .trim();
});

const editors = computed(() => {
  const flag = (html.value && 0b100) | (css.value && 0b010) | (js.value && 0b001);
  return flag.toString(2);
});

const computedTitle = computed(() => {
  return (
    (typeof document !== "undefined" ? document.title.split(" | ")[0] + ": " : "") +
    (props.title ? props.title + " - " : "") +
    `Quasar v${Quasar.version}`
  );
});

const slugifiedTitle = computed(() => {
  return slugify("example-" + props.title);
});

/**
 * Computed property that returns the options for the component.
 * This property is reactive and will update whenever its dependencies change.
 *
 * @returns {Object} The options object for the component.
 */
const options = computed(() => {
  const data = {
    title: computedTitle.value,
    html: `<!--
Forked from:
${location.origin + location.pathname}#${slugifiedTitle.value}
-->
<div id="q-app" style="min-height: 100vh;">
${html.value}
</div>`,
    html_pre_processor: "none",
    css: css.value,
    css_pre_processor: cssPreprocessor.value,
    css_external: cssResources.value,
    js: js.value,
    js_pre_processor: jsPreProcessor.value,
    js_external: jsResources.value,
    head: siteConfig.codepen?.head ?? "",
    editors: editors.value,
  };
  return JSON.stringify(data);
});

/**
 * Opens a specific part of the application.
 *
 * @param {string} whichParts - The parts of the application to open.
 */
function open(whichParts: CodepenParts) {
  def.parts = whichParts;

  if (active.value) {
    formRef.value.submit();
    return;
  }

  active.value = true;

  nextTick(() => {
    formRef.value.submit();
  });
}

defineExpose({ open });
</script>
