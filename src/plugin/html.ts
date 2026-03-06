import type { AsyncAPIUIOptions } from "../lib/types.js";

const DEFAULT_CDN_URL = "https://unpkg.com/@asyncapi/react-component";
const DEFAULT_CDN_VERSION = "latest";

/**
 * Generate an HTML page that renders AsyncAPI documentation
 * using the @asyncapi/react-component standalone bundle from CDN.
 */
export function generateHTML(
    specUrl: string,
    options: AsyncAPIUIOptions = {},
): string {
    const {
        cdnUrl = DEFAULT_CDN_URL,
        cdnVersion = DEFAULT_CDN_VERSION,
        sidebar = true,
        title = "AsyncAPI Documentation",
        favicon,
    } = options;

    const cdnBase = `${cdnUrl}@${cdnVersion}`;
    const cssUrl = `${cdnBase}/styles/default.min.css`;
    const jsUrl = `${cdnBase}/browser/standalone/index.js`;

    const faviconTag = favicon
        ? `<link rel="icon" href="${escapeHTML(favicon)}" />`
        : "";

    const configJSON = JSON.stringify({
        show: {
            sidebar,
        },
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(title)}</title>
  ${faviconTag}
  <link rel="stylesheet" href="${escapeHTML(cssUrl)}" />
  <style>
    html, body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    #asyncapi { padding: 1rem; }
    #asyncapi-loading { display: flex; justify-content: center; align-items: center; height: 50vh; font-size: 1.25rem; color: #666; }
  </style>
</head>
<body>
  <div id="asyncapi">
    <div id="asyncapi-loading">Loading AsyncAPI documentation…</div>
  </div>
  <script src="${escapeHTML(jsUrl)}"></script>
  <script>
    AsyncApiStandalone.render({
      schema: {
        url: '${escapeJS(specUrl)}',
        options: { method: 'GET', mode: 'cors' },
      },
      config: ${configJSON},
    }, document.getElementById('asyncapi'));
  </script>
</body>
</html>`;
}

function escapeHTML(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeJS(str: string): string {
    return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
