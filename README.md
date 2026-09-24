# Ferber Sleep Timer

A local-first Progressive Web App for Ferber sleep-training intervals. It is designed for a dim nursery: true OLED black, low-luminance amber accents, large countdown typography, and controls kept in the lower thumb zone.

## Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`. To test the session logs locally:

1. Start a bedtime session and end it so it becomes a historical session.
2. Open **Logs**, expand the session, and verify its events are shown.
3. Click the delete icon, cancel the confirmation once, then confirm deletion.
4. Reopen **Logs** and verify the session is gone. An active session's delete action should be disabled.

The development server injects CSS inline. If the page appears as unstyled browser-default HTML, the development CSP may need `style-src 'self' 'unsafe-inline'` in `index.html`; restart the dev server and hard-refresh afterward. Do not carry `'unsafe-inline'` into production. Use a production CSP with `style-src 'self'` (or a nonce/hash for any required inline styles), preferably configured as a response header or environment-specific deployment setting.

Validate the project with:

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run build
npm run security:scan
```

The security scan uses Trivy's filesystem scanner to check the lockfile and repository for vulnerable or outdated dependencies, exposed secrets, and supported misconfigurations. It fails on unfixed high or critical findings.

## Privacy and data

Session history is stored in the browser's IndexedDB database named `FerberTrackerDB`. The app has no account, backend, analytics, telemetry, cloud sync, or external API calls. IndexedDB data is local to the browser origin, but it is not encrypted at rest and can be accessed by code running in that same origin or by someone with access to the device profile.

The timer uses wall-clock timestamps, visibility reconciliation, and a local worker heartbeat instead of incrementing a throttled JavaScript counter. Wake Lock, vibration, and Web Audio are feature-detected enhancements.

Users can customize all 14 day plans from the interval settings. Each day has three minute values, with the final value repeated for later checks. A session snapshots its selected plan when bedtime starts. The first launch includes a short tutorial; it can be reopened from the help button. When an interval expires, Check in and Resume interval are separate actions. Fell asleep starts a local elapsed-sleep clock until the session is ended.

## GitHub Pages

The production build is configured for the repository path `/ferber-oled-pwa/`. Enable **Settings > Pages > GitHub Actions** in the repository, then push to `main`. The workflow in `.github/workflows/deploy.yml` runs tests, typechecks, lints, builds, and deploys `dist/`.