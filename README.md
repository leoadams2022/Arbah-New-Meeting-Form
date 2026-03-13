# Arbah New Leads Form

A React + Vite lead-capture app that submits each lead to:

- Zoho CRM (WebToLead endpoint)
- Google Forms (form response endpoint)

The app is built for quick internal lead entry, with optional advanced fields, saved default values, and light/dark theme support.

## Features

- Submit one lead to Zoho and Google in the same action
- Required field validation before submit
- Expand/collapse advanced fields
- Save default field values in `localStorage`
- Reset to saved defaults or clear the form completely
- Custom alert and confirm dialogs
- PWA support (installable, auto-update service worker)

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- Flowbite React
- vite-plugin-pwa

## Project Structure

```text
src/
  pages/
    Form.jsx               # Main lead form
    SetDefaultValues.jsx   # Modal to save defaults in localStorage
    options.js             # Dropdown option lists
  Google.js                # Google Form submission logic + mapping
  Zoho.js                  # Zoho WebToLead submission logic + mapping/tokens
  context/
    AppDialogProvider.jsx  # Alert/confirm system
  components/              # Reusable input and UI components
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run development server

```bash
npm run dev
```

### 3) Build for production

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Create production build in `dist/`
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Data Flow

On submit, the app:

1. Validates required UI fields
2. Sends data to Zoho using `submitLeadToZoho()` in `src/Zoho.js`
3. Sends data to Google Forms using `googleSubmition()` in `src/Google.js`
4. Shows success/error message based on both results

## Required Lead Fields in UI

These fields are treated as required in `Form.jsx`:

- `LastName`
- `Phone`
- `ClickedAdd`
- `Agent`
- `LeadStatus`
- `LeadDisposition`
- `LeadSource`
- `FileName`

## Integration Configuration

### Zoho CRM

File: `src/Zoho.js`

Update these parts when moving to another Zoho form/account:

- `tokens` object:
  - `xnQsjsdp`
  - `xmIwtLD`
  - `actionType`
  - `returnURL`
  - `zc_gad`
  - `aG9uZXlwb3Q` (should stay empty)
- `endpoint` (default: `https://crm.zoho.com/crm/WebToLeadForm`)
- `fieldMap` object (maps app keys to Zoho field names like `LEADCF*`)

### Google Forms

File: `src/Google.js`

Update these parts when moving to another Google Form:

- `googleFormURL` (`.../formResponse`)
- `googleFormFieldMapping` object (`entry.xxxxxxxx` => app key)

Important: Google submission uses `mode: "no-cors"`, so the code currently returns `{ ok: true }` after calling fetch.

## Defaults and Local Storage

- Saved defaults key: `defaultValues`
- Theme key: `theme`

Default values are managed from the settings button in the top-right of the form.

## Options / Dropdown Values

Update dropdown values in:

- `src/pages/options.js`

Includes:

- Clicked Add options
- Lead Source options
- Lead Status options
- Lead Disposition options
- Agents options

## PWA

PWA configuration is in `vite.config.js` using `vite-plugin-pwa`.

- Service worker is registered in `src/main.jsx` via `registerSW({ immediate: true })`
- Manifest icons are in `public/`

## Notes

- `src/zoho.html` is a reference export of the original Zoho WebToLead form.
- `src/config.js` exists but is currently not used by the rendered app.

## Security Recommendation

Zoho tokens and Google form IDs are currently committed in source files. For production hardening:

- Move sensitive values into environment variables
- Inject them at build time
- Keep private keys/tokens out of public repositories
