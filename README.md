# Ferber Sleep Timer

A local-first Progressive Web App for Ferber sleep-training intervals. It is designed for a dim nursery: true OLED black, low-luminance amber accents, large countdown typography, and controls kept in the lower thumb zone.

## Development

```bash
npm install
npm run dev
```

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