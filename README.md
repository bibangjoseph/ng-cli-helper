# Angular CLI Helper

[![npm version](https://badge.fury.io/js/angular-cli-helper.svg)](https://www.npmjs.com/package/angular-cli-helper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/angular-cli-helper.svg)](https://www.npmjs.com/package/angular-cli-helper)

**Angular CLI Helper** is a CLI tool designed to speed up development on Angular standalone projects (Angular 14+). It scaffolds components, services, models, pages, packages, guards, directives, and pipes — and can initialize a full project structure with a built-in **API service**, **authentication system**, and **HTTP interceptor**.

Every generated artifact comes with its **`.spec.ts` test file**, ready to run. The generator automatically detects your Angular version — on Angular 19+, `standalone: true` is omitted since it's the default.

---

## ✨ Why Angular CLI Helper?

- 🚀 **Save time** — Automatic boilerplate generation
- 🧪 **Tests included** — Every artifact generates its `.spec.ts` file out of the box
- 📁 **Consistent structure** — Standardized, professional project architecture
- 🎯 **Best practices** — Follows Angular conventions and modern patterns
- 🔧 **Built-in API service** — Full HTTP service with error handling and signals
- 🔐 **Auth ready** — Guards, CoreService, and HTTP interceptor pre-configured
- 💡 **Intuitive** — Interactive CLI prompts with module selection lists
- ⚡ **Lazy loading** — Routes automatically configured with `loadComponent` / `loadChildren`
- 🛡️ **Route protection** — AuthGuard and GuestGuard included
- 🔗 **Path alias** — `@/*` alias automatically added to `tsconfig.json`
- 📐 **Version-aware** — Adapts generated code to your Angular version (14–18 vs 19+)

---

## 📦 Version compatibility

| Library version | Recommended Angular | Architecture                        |
|-----------------|---------------------|-------------------------------------|
| `^6.3.x`        | Angular 14 – 21+    | Standalone + `features/` + Auth + `@/` alias + spec files + version-aware |
| `^6.2.x`        | Angular 17 – 21+    | Standalone + `features/` + Auth + `@/` alias |
| `^5.x`          | Angular 17 – 21+    | Standalone + `features/` + Auth     |
| `^4.x`          | Angular 17 – 20+    | Classic modules                     |
| `^2.x`          | Angular 16+         | Classic modules                     |
| `^1.x`          | Angular ≤ 15        | Classic modules                     |

---

## 🚀 Installation

```bash
npm install angular-cli-helper --save-dev
```

Add the scripts to your project's `package.json`:

```json
"scripts": {
  "g:init":      "init-project",
  "g:component": "create-component",
  "g:service":   "create-service",
  "g:model":     "create-model",
  "g:page":      "create-page",
  "g:package":   "create-package",
  "g:guard":     "create-guard",
  "g:directive": "create-directive",
  "g:pipe":      "create-pipe",
  "help":        "angular-cli-help"
}
```

Then run any generator with:

```bash
npm run g:init
npm run g:package
npm run g:page
# etc.
```

---

## 📚 Usage guide

### 1. 🎬 Initialize a new project

```bash
npm run g:init
```

Automatically creates the following structure inside your Angular project:

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── api.service.ts        # Full HTTP service
│   │   │   └── core.service.ts       # Auth & user management
│   │   ├── guards/
│   │   │   ├── auth.guard.ts         # Protects authenticated routes
│   │   │   └── guest.guard.ts        # Protects public routes
│   │   └── interceptors/
│   │       └── http.interceptor.ts   # Auto JWT injection
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── layout/
│   │   └── main-layout/              # Main layout component
│   ├── features/
│   │   ├── auth/                     # Default auth module (GuestGuard)
│   │   └── dashboard/                # Default dashboard module (AuthGuard)
│   ├── app.ts
│   ├── app.config.ts                 # HttpClient + interceptor configured
│   └── app.routes.ts                 # Lazy-loaded routes
└── environments/
    ├── environment.ts                 # Development config
    └── environment.prod.ts            # Production config
```

**Also configures:**
- `angular.json` — `fileReplacements` for production build
- `tsconfig.json` — `@/*` path alias pointing to `src/app/*`
- `app.config.ts` — `provideHttpClient` + interceptor added (existing file preserved)

---

### 2. 🔐 Authentication system

#### CoreService

Manages token and current user with Angular signals:

```typescript
import { inject } from '@angular/core';
import { CoreService } from '@/core/services/core.service';

export class MyComponent {
  private coreService = inject(CoreService);

  isAuth      = this.coreService.isAuthenticated; // computed signal
  currentUser = this.coreService.currentUser;     // computed signal

  login(token: string, user: any) {
    this.coreService.setToken(token);
    this.coreService.setCurrentUser(user);
  }

  logout() {
    this.coreService.logout();
  }
}
```

#### Guards

**AuthGuard** — protects authenticated routes:
```typescript
{
  path: 'dashboard',
  loadChildren: () => import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES),
  canActivate: [AuthGuard] // redirects to / if not authenticated
}
```

**GuestGuard** — protects public routes:
```typescript
{
  path: '',
  loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES),
  canActivate: [GuestGuard] // redirects to /dashboard if already authenticated
}
```

#### HTTP Interceptor

Automatically injects the JWT token into every API request:

```typescript
// Already configured in app.config.ts
provideHttpClient(withInterceptors([HttpInterceptor]))

// Your requests become:
// GET https://api.yourdomain.com/api/products
// Headers: { Authorization: 'Bearer <token>' }
```

---

### 3. 📦 Create a module (package)

```bash
npm run g:package
```

```
? Package name: products
? Which guard do you want to use?
  ❯ AuthGuard (authenticated routes)
    GuestGuard (public routes)
    No guard
```

**Generated structure:**
```
features/products/
├── components/
├── views/
├── models/
├── routes.ts       # With selected guard + lazy loading
└── README.md
```

**Generated `routes.ts`:**
```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const PRODUCTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../../layout/main-layout/main-layout').then(m => m.MainLayout),
        canActivate: [AuthGuard],
        children: [
        ]
    }
];
```

`app.routes.ts` is updated automatically:
```typescript
export const routes: Routes = [
    { path: '', loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES) },
    { path: 'dashboard', loadChildren: () => import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES) },
    { path: 'products', loadChildren: () => import('./features/products/routes').then(m => m.PRODUCTS_ROUTES) }
];
```

---

### 4. 📄 Create a page

```bash
npm run g:page
```

```
? Page name: product-list
? Module: (select from list)
  ❯ auth
    dashboard
    products
```

**Generated files:**
```
features/products/views/product-list/
├── product-list.page.ts
├── product-list.page.html
├── product-list.page.scss
└── product-list.page.spec.ts
```

**Generated `product-list.page.ts`** (Angular 19+):
```typescript
import { Component, inject } from '@angular/core';
import { ApiService } from '@/core/services/api.service';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss']
})
export class ProductListPage {
  private apiService = inject(ApiService);
}
```

> On Angular 14–18, `standalone: true` is added automatically.

`routes.ts` is updated automatically with the new child route:
```typescript
children: [
    {
        path: 'product-list',
        loadComponent: () => import('./views/product-list/product-list.page').then(m => m.ProductListPage)
    }
]
```

---

### 5. 🧩 Create a component

```bash
npm run g:component
```

```
? Component name: product-card
? Is it a global (shared) component? (Y/n)
```

**If feature-scoped, a module list is shown:**
```
? Module:
  ❯ auth
    dashboard
    products
```

**Generated files (global):**
```
shared/components/product-card/
├── product-card.component.ts
├── product-card.component.html
├── product-card.component.scss
└── product-card.component.spec.ts
```

**Generated files (feature-scoped):**
```
features/products/components/product-card/
├── product-card.component.ts
├── product-card.component.html
├── product-card.component.scss
└── product-card.component.spec.ts
```

---

### 6. ⚙️ Create a service

```bash
npm run g:service
```

```
? Service name: products
```

**Generated files:**
```
core/services/
├── products.service.ts
└── products.service.spec.ts
```

---

### 7. 📋 Create a model

```bash
npm run g:model
```

```
? Model name: product
? Module:
  ❯ auth
    dashboard
    products
```

Creates `features/products/models/product.ts`:
```typescript
export interface Product {

}
```

---

### 8. 🛡️ Create a guard

```bash
npm run g:guard
```

```
? Guard name: admin
```

**Generated files:**
```
core/guards/
├── admin.guard.ts
└── admin.guard.spec.ts
```

```typescript
import { CanActivateFn } from '@angular/router';

export const AdminGuard: CanActivateFn = (route, state) => {
  return true;
};
```

---

### 9. 🎨 Create a directive

```bash
npm run g:directive
```

Creates `shared/directives/<name>.directive.ts` and `<name>.directive.spec.ts` with a standalone directive scaffold.

---

### 10. 🔧 Create a pipe

```bash
npm run g:pipe
```

Creates `shared/pipes/<name>.pipe.ts` and `<name>.pipe.spec.ts` with a standalone pipe scaffold.

---

## 🎯 Recommended workflow

```bash
# 1. Create an Angular project
ng new my-app

# 2. Install angular-cli-helper
cd my-app
npm install angular-cli-helper --save-dev

# 3. Initialize the full structure
npm run g:init
# ✅ Creates: core services, auth, guards, interceptor, layout
# ✅ Configures: tsconfig.json (@/* alias), angular.json, app.config.ts

# 4. Create your feature modules
npm run g:package   # e.g. "products" with AuthGuard

# 5. Add pages to your modules
npm run g:page      # e.g. "product-list" → select "products"

# 6. Add reusable components
npm run g:component # e.g. "product-card" → feature-scoped in "products"

# 7. Add business services
npm run g:service   # e.g. "products"

# 8. Add models
npm run g:model     # e.g. "product" in "products"
```

---

## 🔑 API Service features

The generated `ApiService` includes:

```typescript
// Standard HTTP methods
this.apiService.get<Product[]>('/products').subscribe();
this.apiService.post<Product>('/products', data).subscribe();
this.apiService.put<Product>('/products/1', data).subscribe();
this.apiService.patch<Product>('/products/1', { name: 'X' }).subscribe();
this.apiService.delete('/products/1').subscribe();

// Paginated GET
this.apiService.getPaginate<Product>('/products?page=1').subscribe();

// File upload
this.apiService.uploadFile('/upload', file).subscribe();

// File download
this.apiService.downloadFile('/export/pdf').subscribe(blob => { });

// Get a file by URL
this.apiService.getFile(url).subscribe(blob => { });

// Build URL with query params
const url = this.apiService.buildUrlWithParams('/products', { page: 1, limit: 10 });
```

**Automatic error handling:**

| HTTP status | Behavior |
|-------------|----------|
| `0`         | Logs a network error message |
| `401`       | Clears token + redirects to `/` |
| `422`       | Stores validation errors in `backendErrors` signal |
| Other       | Logs the error message |

**Loading & error signals:**

```typescript
isLoading     = this.apiService.loading;       // signal<boolean>
backendErrors = this.apiService.backendErrors; // signal<Record<string, string[]>>

// Clear errors
this.apiService.clearBackendErrors();
this.apiService.clearFieldError('email');
```

---

## 🌍 Environments

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api'
};
```

```bash
ng build --configuration production
# environment.ts is replaced by environment.prod.ts automatically
```

---

## 📝 Available commands

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `npm run g:init`      | Initialize the full project structure            |
| `npm run g:package`   | Create a new feature module with guard           |
| `npm run g:page`      | Create a page inside a module (select from list) |
| `npm run g:component` | Create a component (shared or feature-scoped)    |
| `npm run g:service`   | Create a service in `core/services`              |
| `npm run g:model`     | Create a model / interface                       |
| `npm run g:guard`     | Create a custom guard in `core/guards`           |
| `npm run g:directive` | Create a directive in `shared/directives`        |
| `npm run g:pipe`      | Create a pipe in `shared/pipes`                  |
| `npm run help`        | Display command help                             |

---

## 🆕 What's new in v6.3.0

- ✅ **Spec files generated by default** — Every artifact (component, page, service, guard, directive, pipe) now generates its `.spec.ts` file automatically
- ✅ **Angular version detection** — Reads `@angular/core` version from your `package.json` and omits `standalone: true` on Angular 19+ (where it's the default)
- ✅ **Module selection as list in all generators** — `g:component` and `g:model` now show available modules interactively, just like `g:page`
- ✅ **Standalone service generator** — `g:service` no longer relies on `ng generate` under the hood; files are generated directly
- ✅ **Unified error handling** — All generators validate the Angular project context and handle errors consistently
- ✅ **Shared helpers** — `getAvailableModules()` and `setupErrorHandlers()` extracted to `utils.js`

## 🆕 What's new in v6.2.0

- ✅ **Module selection as list** — `g:page` now shows available modules to pick from instead of free text input
- ✅ **Reliable route insertion** — Comma handling fixed when adding multiple pages to `children`
- ✅ **Consistent file naming** — All generated files use kebab-case (`folderName`) consistently
- ✅ **`@/` path alias** — `tsconfig.json` updated automatically with `@/* → src/app/*`
- ✅ **Preserved `app.config.ts`** — Init only injects HttpClient + interceptor, keeps existing config intact
- ✅ **Shared utilities** — Internal helpers extracted to `src/utils.js` (no more duplication)
- ✅ **Upgraded API service** — `getPaginate`, `uploadFile`, `downloadFile`, `getFile`, typed `ApiRequestOptions`

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the project
2. Create your branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

MIT © BIBANG BEFENE Joseph Donovan

---

## 🔗 Links

- 📦 [npm](https://www.npmjs.com/package/angular-cli-helper)
- 🐙 [GitHub](https://github.com/bibangjoseph/angular-cli-helper)
- 📧 Contact: bibangjoseph@gmail.com

---

Developed with ❤️ by **BIBANG BEFENE Joseph Donovan**

If this tool helps you, consider starring the repo on [GitHub](https://github.com/bibangjoseph/angular-cli-helper) ⭐
