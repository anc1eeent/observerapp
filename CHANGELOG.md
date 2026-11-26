# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project follows [Semantic Versioning](https://semver.org/).

## [1.0.0-rc.1] - 2026-11-26

First release candidate: the application is ready for a demo.

### Added
- Task priority (low, medium, high) and an optional due date, shown on task cards
  as "Today", "Tomorrow" or "Overdue".
- Total focus time per task, calculated from Pomodoro sessions.
- "Focus" button on a task that opens the Pomodoro timer with this task selected.
- Search and sorting by priority, due date or creation time.
- Pomodoro statistics: focus time and sessions today, the last 7 days as a chart,
  and recent sessions.
- Demo data script: `python -m scripts.seed`.

### Known issues
- The access token expires 30 minutes after login, even for an active user;
  a running Pomodoro session can be lost.

## [0.3.0] - 2026-11-26

### Added
- Configuration is validated at startup; the application refuses to start
  and names a missing or invalid variable.
- Ownership checks: a task cannot be added to another user's list, and a
  Pomodoro session cannot be linked to another user's task.

### Fixed
- Invalid input returns 422 instead of being saved: empty task title,
  non-positive Pomodoro duration, invalid email.
- A duplicate email returns 409 instead of 500.
- An invalid or forged token returns 401 instead of 500.
- Typo in the "Username already registered" message.

## [0.2.0] - 2026-11-26

### Added
- Task editing in a dialog window, bound to a `Task` model with validating setters.
- Confirmation before deleting a task.
- Toast notifications instead of browser alerts.
- Design tokens in `theme.css` and a consistent dark theme; the layout adapts to small screens.

### Changed
- The profile opens in a dialog window.

## [0.1.0] - 2026-11-26

### Fixed
- Registration and login returned 500 because the `Habit` model was not registered.
- Database migrations were out of sync with the models.
- API errors were not shown to the user or were shown as `[object Object]`.
- The Pomodoro timer did not start; finished sessions were not saved.
- The sidebar showed a hardcoded username.

### Removed
- Navigation items and buttons that did nothing.

### Added
- Tests run against PostgreSQL in CI on every pull request; the Docker image
  is built and pushed only after the tests pass.

[1.0.0-rc.1]: https://github.com/anc1eeent/observerapp/compare/v0.3.0...v1.0.0-rc.1
[0.3.0]: https://github.com/anc1eeent/observerapp/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/anc1eeent/observerapp/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/anc1eeent/observerapp/releases/tag/v0.1.0
