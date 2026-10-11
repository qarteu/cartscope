# Static browser demo

CartScope's side-panel interface can also run from ordinary static hosting. This gives reviewers a working preview without installing a Chrome extension or configuring AWS.

## Run locally

```sh
npm run demo
```

Open the URL printed by the server. The preview uses the same HTML, CSS, and UI modules as the extension. It begins in a clearly labeled sample workspace when running outside Chrome extension mode. Browser data is stored in `localStorage` for the preview origin; extension data stays in Chrome extension storage. Use the settings controls to export or remove the preview's data.

Supported preview flows include saved products and budget, manual offer comparison, observed sample history and alerts, manual orders, installment arithmetic, and data controls. User-initiated capture of a separate retailer tab and optional Chrome notifications are extension-only APIs. In preview mode, use manual product entry or the bundled labeled samples.

## Publish on GitHub Pages

Published demo: [https://qarteu.github.io/cartscope/](https://qarteu.github.io/cartscope/). The hosted Chrome smoke test verified HTTPS 200, iframe navigation, persisted cart edits, and a 390-pixel mobile layout. See [verification evidence](VERIFICATION.md).

Run `npm run build:demo` to generate `site/`. The site includes a landing page and the same extension interface inside an interactive preview. `npm run publish` verifies the qarteu account, publishes source/release/issues, pushes `site/` to gh-pages, and enables GitHub Pages. Keep the script and asset paths relative. The static site does not require secrets, environment variables, an AWS backend, or a database. The repository's publication tooling should package/deploy these files after validation.

After publishing, test the public URL in a fresh browser profile and verify navigation, sample labels, persistence, compare actions, order editing, calculator results, and data export. Record the published URL and actual test results in `VERIFICATION.md`.
