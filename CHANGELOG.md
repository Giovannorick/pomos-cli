# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-28

### Added

- **Interactive Notifications**: Added "Start Break" and "Start Focus" buttons to desktop notifications. Clicking them immediately starts the next timer phase.
- **Enhanced Live Clock**: Now displays the city name alongside the time and timezone (e.g., `12:00 PM GMT+8 | Singapore`) for better context.
- **Quick Timer Auto-Exit**: The Quick Timer mode (`pomos timer ...`) now displays a 3-second countdown and automatically exits when the timer finishes.

### Changed

- Updated internal timer logic to support seamless phase transitions via notification callbacks.

## [1.0.4] - 2026-01-28

### Added

- Initial public release of `@giovannorick/pomos-cli`.
- Core Pomodoro functionality (25/5, 50/10, Custom).
- Quick Timer mode.
- Desktop notifications (basic).
- Custom sound alerts.
