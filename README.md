# MyNominee.In — Angular Guest Website

A static, frontend-only Angular guest website inspired by the supplied React project and reference websites. No backend, database, authentication, external API calls, or server-side storage are required.

## Core sections
- Problem — why financial records and unclaimed assets can be difficult for families to trace
- Solution — a simple family-preparedness journey
- Assets — interactive category checklist for common financial and important records
- Resources — links to official government and regulator resources
- Unclaimed Amounts — plain-language overview and steps to begin official searches
- Contact Us — WhatsApp and email contact links already present in the supplied project

## Requirements
- Node.js compatible with Angular CLI 20 (Node.js 20.19+ or 22.12+; use a supported LTS release)
- npm

## Run locally
```bash
npm install
npm start
```
Open the local URL printed by Angular CLI (normally http://localhost:4200).

## Production build
```bash
npm run build
```
The static production output is generated under `dist/mynominee-guest-angular/browser`.

## Frontend-only behavior
- The asset category checklists are informational modals.
- The preparedness self-check runs in component memory only. It is not submitted to a server and is discarded when the page is refreshed or closed.
- No credentials, PAN, Aadhaar, bank account details or other sensitive data should be entered into this guest page.
- The page does not search databases, verify ownership, register legal nominations, or recover assets. Visitors must use the official institution/regulator process.

## Audit and accessibility improvements
- Added a keyboard-accessible skip-to-content link.
- Added explicit section labels for the Problem, Solution, Assets, Resources, Unclaimed Amounts and Contact Us areas.
- Clarified that external resource sites are operated by their respective organizations and that MyNomini does not receive search data through outbound links.
- Added visible keyboard focus styling and section scroll offsets for fixed navigation.

## Resource references
- Government common landing portal: https://www.unclaimedassetsportal.in/public/
- RBI UDGAM: https://udgam.rbi.org.in/unclaimed-deposits/
- IRDAI Bima Bharosa: https://bimabharosa.irdai.gov.in/
- MF Central: https://www.mfcentral.com/
- IEPFA: https://www.iepf.gov.in/
- EPFO: https://www.epfindia.gov.in/

Links and processes may change; visitors should confirm current instructions on the official website.
