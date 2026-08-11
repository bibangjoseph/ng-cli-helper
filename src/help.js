#!/usr/bin/env node

function showHelp() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║              Angular CLI Helper v6.2.0 - Command Guide                ║
╚═══════════════════════════════════════════════════════════════════════╝

📦 PROJECT SETUP
──────────────────────────────────────────────────────────────────────────
  npm run g:init          Initialize the full project structure
                           • Creates core/, shared/, layout/, features/
                           • Generates API service, CoreService, guards
                           • Adds HTTP interceptor (auto JWT injection)
                           • Configures app.config.ts (HttpClient + interceptor)
                           • Adds @/* path alias to tsconfig.json
                           • Sets up environments (dev / prod)
                           • Creates auth & dashboard modules by default

🧩 CODE GENERATION
──────────────────────────────────────────────────────────────────────────
  npm run g:package       Create a feature module
                           • Structure: components/, views/, models/
                           • routes.ts with lazy loading
                           • Guard selection: AuthGuard / GuestGuard / none
                           • app.routes.ts updated automatically

  npm run g:page          Create a page inside a module
                           • Module selected from list (no typing)
                           • ApiService injected automatically
                           • Files named in kebab-case
                           • Route added to module's routes.ts automatically

  npm run g:component     Create a standalone component
                           • Choice: global (shared/) or feature-scoped
                           • Generates .ts, .html, .scss

  npm run g:service       Create an injectable service
                           • Created in core/services/
                           • providedIn: 'root'

  npm run g:model         Create a TypeScript interface
                           • Created in features/<module>/models/

  npm run g:guard         Create a route guard
                           • Created in core/guards/
                           • Uses CanActivateFn (modern syntax)

  npm run g:directive     Create a standalone directive
                           • Created in shared/directives/

  npm run g:pipe          Create a standalone pipe
                           • Created in shared/pipes/

🔑 API SERVICE  (core/services/api.service.ts)
──────────────────────────────────────────────────────────────────────────
  HTTP methods:
  • get<T>(url, options?)
  • post<T>(url, data, options?)
  • put<T>(url, data, options?)
  • patch<T>(url, data, options?)
  • delete<T>(url, options?)

  Extra methods:
  • getPaginate<T>(url)           Paginated GET → PaginatedResponse<T>
  • uploadFile<T>(url, file)      Multipart file upload
  • downloadFile(url)             Download as Blob
  • getFile(url)                  Fetch file by URL
  • buildUrlWithParams(url, obj)  Build URL with query params

  Signals:
  • loading                       signal<boolean>
  • backendErrors                 signal<Record<string, string[]>>
  • clearBackendErrors()
  • clearFieldError(fieldName)

  Auto error handling:
  • 0   → Network error message
  • 401 → Clears token + redirects to /
  • 422 → Stores validation errors in backendErrors signal

🔐 AUTHENTICATION  (core/services/core.service.ts)
──────────────────────────────────────────────────────────────────────────
  • setToken(token)               Save JWT token
  • setCurrentUser(user)          Save current user
  • logout()                      Clear token + user
  • clearToken()                  Clear token only
  • isAuthenticated               computed signal<boolean>
  • currentUser                   computed signal<User | null>
  • token                         computed signal<string | null>

📖 GENERATED PROJECT STRUCTURE
──────────────────────────────────────────────────────────────────────────
  src/
  ├── app/
  │   ├── core/
  │   │   ├── services/          api.service.ts, core.service.ts
  │   │   ├── guards/            auth.guard.ts, guest.guard.ts
  │   │   └── interceptors/      http.interceptor.ts
  │   ├── shared/
  │   │   ├── components/
  │   │   ├── directives/
  │   │   └── pipes/
  │   ├── layout/
  │   │   └── main-layout/
  │   ├── features/
  │   │   ├── auth/              routes.ts (GuestGuard)
  │   │   └── dashboard/         routes.ts (AuthGuard)
  │   ├── app.ts
  │   ├── app.config.ts
  │   └── app.routes.ts
  └── environments/
      ├── environment.ts
      └── environment.prod.ts

🌍 ENVIRONMENTS
──────────────────────────────────────────────────────────────────────────
  Development:  src/environments/environment.ts
  Production:   src/environments/environment.prod.ts

  Production build:  ng build --configuration production
  (environment.ts is replaced by environment.prod.ts automatically)

💡 RECOMMENDED WORKFLOW
──────────────────────────────────────────────────────────────────────────
  1. npm run g:init        Initialize structure (run once)
  2. npm run g:package     Create a feature module
  3. npm run g:page        Add pages to the module
  4. npm run g:component   Add reusable components
  5. npm run g:service     Add business services
  6. npm run g:model       Add interfaces / models

📦 REQUIREMENTS
──────────────────────────────────────────────────────────────────────────
  Angular:  17, 18, 19, 20, 21+
  Node:     >= 18.0.0
  npm:      >= 9.0.0

🔗 RESOURCES
──────────────────────────────────────────────────────────────────────────
  GitHub:   https://github.com/bibangjoseph/angular-cli-helper
  npm:      https://www.npmjs.com/package/angular-cli-helper
  Issues:   https://github.com/bibangjoseph/angular-cli-helper/issues
  Contact:  bibangjoseph@gmail.com

  Happy coding! 🚀
    `);
}

showHelp();
