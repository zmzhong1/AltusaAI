# Altusa company website

This is the public Firebase-hosted company page for Altusa. It includes a
browser-local operations blueprint builder that lets a visitor:

- choose a product-business operating model;
- identify the largest current workflow pressure;
- select the operational modules to connect first;
- download or copy a tailored 90-day starting blueprint.

The builder does not submit or store visitor selections.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm test
npm audit --omit=dev
```

`npm test` creates the same static export used by Firebase and verifies the
brand metadata, builder content, social image, and absence of private-hosting
references.

## Deploy

The checked-in Firebase configuration targets the `altusa-ai-company` Hosting
site inside the isolated Altusa demo project.

```bash
npm run deploy
```

Production: <https://altusa-ai-company.web.app/>

The interactive warehouse demonstration remains separate:
<https://altusa-ai-wms-demo.web.app/>
