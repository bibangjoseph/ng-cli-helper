# Changelog

All notable changes to this project will be documented in this file.

## [7.0.0] - 2026-08-11

### Added
- **CSS Framework Selection**: During `init-project`, users can now choose between Tailwind CSS, Bootstrap, or a Custom CSS reset. The CLI automatically installs and configures the selected option.
- **Charte v2.0 Compliance**: Generators are updated to strictly follow the new internal front-end charter.
- **Angular 22 Support**: Fully compatible with Angular 22. Uses `provideZonelessChangeDetection` and `withComponentInputBinding` by default in `app.config.ts`.
- **Vitest Infrastructure**: The library now uses Vitest for its internal test coverage.
- **`httpResource`**: Generated `ApiService` uses `httpResource()` for GET requests.
- **Signals**: Full migration of `CoreService` state to Signals.
- **Input API**: Uses `input()` instead of `@Input()` in generated components and directives.
- **Inject API**: Uses `inject()` instead of constructor injection in all generated artifacts.
- **Fallback Route**: `app.routes.ts` now automatically includes a `**` wildcard fallback route with a title.

### Changed
- **Service Generator**: `g:service` now prompts to select whether the service is global (`core`) or feature-specific. Feature services are generated without `providedIn: 'root'` to support route-level providers.
- **Component Generator**: `OnPush` is no longer added by default (removed to align with Zoneless/Signals strategy).
- **Page Route Generator**: Generated route definitions now automatically include a `title` property.

### Fixed
- **Schematics Enforcement**: `angular.json` is updated during project initialization to enforce type suffixes (`.component.ts`, `.service.ts`, etc.) conforming with Angular CLI v20+ breaking changes.
