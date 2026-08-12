#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';

// Pour ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialise la structure compl?te du projet Angular
 */
async function initProject() {
    console.log('\n?? Angular CLI Helper - Initialisation du projet\n');
    console.log('??  Cr?ation de la structure de base du projet...\n');

    try {
        // V?rifier qu'on est bien dans un projet Angular
        if (!isAngularProject()) {
            console.error('? Erreur: Ce n\'est pas un projet Angular.');
            console.error('?? Assurez-vous d\'?tre dans le dossier racine d\'un projet Angular.\n');
            process.exit(1);
        }

        const { cssFramework } = await inquirer.prompt([
            {
                type: 'list',
                name: 'cssFramework',
                message: 'Quel framework CSS souhaitez-vous utiliser ?',
                choices: [
                    { name: 'Tailwind CSS', value: 'tailwind' },
                    { name: 'Bootstrap', value: 'bootstrap' },
                    { name: 'CSS Custom (aucun framework)', value: 'custom' }
                ]
            }
        ]);

        const basePath = path.join(process.cwd(), 'src', 'app');

        // Cr?er la structure de dossiers
        createFolderStructure(basePath);

        // Cr?er la configuration du menu (routes, ic?nes, sous-menus, permissions)
        createMenuConfig(basePath);
        createMenuService(basePath);
        createAppNavMenu(basePath);

        // Cr?er les fichiers d'environnement
        createEnvironmentFiles();

        // Modifier angular.json pour fileReplacements
        updateAngularJson();

        // Ajouter l'alias @/* dans tsconfig.json
        updateTsConfig();

        // Cr?er le service Core
        createCoreService(basePath);

        // Cr?er le service API
        createApiService(basePath);

        // Cr?er les guards
        createGuards(basePath);

        // Cr?er l'interceptor
        createHttpInterceptor(basePath);

        // Cr?er/Mettre ? jour app.config.ts
        createAppConfig(basePath);

        // G?n?rer le main-layout
        generateMainLayout();

        // Remplacer app.component
        replaceAppComponent(basePath);

        // Cr?er app.routes.ts si inexistant
        createAppRoutes(basePath);

        // Cr?er les modules par d?faut
        await createDefaultModules(basePath);

        // Configurer le framework CSS
        configureCssFramework(cssFramework);

        console.log('\n? Structure du projet cr??e avec succ?s!\n');
        console.log('?? Structure g?n?r?e:');
        console.log(`
    src/
    ??? app/
    ?   ??? core/
    ?   ?   ??? services/
    ?   ?   ?   ??? api.service.ts
    ?   ?   ?   ??? core.service.ts
    ?   ?   ??? guards/
    ?   ?   ?   ??? auth.guard.ts
    ?   ?   ?   ??? guest.guard.ts
    ?   ?   ??? interceptors/
    ?   ?       ??? http.interceptor.ts
    ?   ??? shared/
    ?   ?   ??? components/
    ?   ?   ??? directives/
    ?   ?   ??? pipes/
    ?   ??? layout/
    ?   ?   ??? main-layout/
    ?   ??? features/
    ?   ?   ??? auth/
    ?   ?   ??? dashboard/
    ?   ??? app.ts
    ?   ??? app.config.ts
    ?   ??? app.routes.ts
    ??? environments/
        ??? environment.ts
        ??? environment.prod.ts
        `);

        console.log('?? Prochaines ?tapes:');
        console.log('   - Modules "auth" et "dashboard" cr??s par d?faut');
        console.log('   - Utilisez "npm run g:package" pour cr?er d\'autres modules');
        console.log('   - Utilisez "npm run g:page" pour cr?er des pages');
        console.log('   - Le service API est disponible dans core/services/api.service.ts');
        console.log('   - Le service Core g?re l\'authentification');
        console.log('   - Les guards AuthGuard et GuestGuard sont disponibles');
        console.log('   - L\'interceptor HTTP est configur? pour injecter le token\n');

    } catch (error) {
        console.error('? Erreur lors de l\'initialisation:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * V?rifie si on est dans un projet Angular
 */
function isAngularProject() {
    const angularJsonPath = path.join(process.cwd(), 'angular.json');
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(angularJsonPath)) {
        return false;
    }

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.dependencies && !!packageJson.dependencies['@angular/core'];
    }

    return true;
}

function createFolderStructure(basePath) {
    const folders = {
        core: ['services', 'guards', 'interceptors', 'config'],
        shared: ['components', 'directives', 'pipes'],
        layout: ['main-layout'],
        features: []
    };

    for (const [parent, children] of Object.entries(folders)) {
        const parentPath = path.join(basePath, parent);

        if (!fs.existsSync(parentPath)) {
            shelljs.mkdir('-p', parentPath);
            console.log(`?? Cr??: app/${parent}/`);
        } else {
            console.log(`??  Existe d?j?: app/${parent}/`);
        }

        if (children.length > 0) {
            children.forEach(child => {
                const childPath = path.join(parentPath, child);
                if (!fs.existsSync(childPath)) {
                    shelljs.mkdir('-p', childPath);
                    console.log(`?? Cr??: app/${parent}/${child}/`);
                } else {
                    console.log(`??  Existe d?j?: app/${parent}/${child}/`);
                }
            });
        }
    }

    // Cr?er des fichiers .gitkeep pour les dossiers vides
    createGitkeepFiles(basePath);
}

/**
 * Cr?e des fichiers .gitkeep dans les dossiers vides
 */
function createGitkeepFiles(basePath) {
    const emptyFolders = [
        'shared/components',
        'shared/directives',
        'shared/pipes'
    ];

    emptyFolders.forEach(folder => {
        const gitkeepPath = path.join(basePath, folder, '.gitkeep');
        if (!fs.existsSync(gitkeepPath)) {
            fs.writeFileSync(gitkeepPath, '');
        }
    });
}

/**
 * Cr?e le fichier de configuration du menu
 */
function createMenuConfig(basePath) {
    console.log('?? Cr?ation de la configuration du menu...');

    const configPath = path.join(basePath, 'core', 'config');
    const menuPath = path.join(configPath, 'menu.ts');

    if (!fs.existsSync(configPath)) {
        shelljs.mkdir('-p', configPath);
    }

    if (fs.existsSync(menuPath)) {
        console.log('??  Le fichier menu.ts existe d?j?.');
        return;
    }

    const menuContent = `/**
 * Configuration centralis?e du menu de navigation.
 *
 * - route       : chemin Angular (routerLink)
 * - icon        : identifiant d'ic?ne (classe CSS, SVG sprite, etc.)
 * - children    : sous-menus
 * - permissions : l'utilisateur doit poss?der au moins une de ces permissions
 * - roles       : l'utilisateur doit poss?der au moins un de ces r?les
 * - exact       : correspondance stricte de la route pour le lien actif
 *
 * Le lien actif est calcul? ? l'ex?cution via isMenuItemActive() / MenuService.
 */
export interface MenuItem {
  id: string;
  title: string;
  route?: string;
  icon?: string;
  permissions?: string[];
  roles?: string[];
  children?: MenuItem[];
  exact?: boolean;
}

/** Menu principal de l'application ? personnalisez cette liste selon vos features. */
export const APP_MENU: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    route: '/dashboard',
    icon: 'home',
  },
  {
    id: 'administration',
    title: 'Administration',
    icon: 'settings',
    roles: ['admin'],
    permissions: ['admin.access'],
    children: [
      {
        id: 'users-list',
        title: 'Utilisateurs',
        route: '/admin/users',
        icon: 'users',
        permissions: ['users.read'],
      },
      {
        id: 'users-create',
        title: 'Cr?er un utilisateur',
        route: '/admin/users/create',
        icon: 'user-plus',
        permissions: ['users.create'],
      },
    ],
  },
];

/** Normalise l'URL courante (sans query ni hash). */
export function normalizeMenuUrl(url: string): string {
  return url.split('?')[0].split('#')[0];
}

/** Indique si un item (avec route) correspond ? l'URL courante. */
export function isMenuItemActive(item: MenuItem, currentUrl: string): boolean {
  if (!item.route) {
    return false;
  }

  const normalized = normalizeMenuUrl(currentUrl);
  const route = item.route.endsWith('/') && item.route.length > 1
    ? item.route.slice(0, -1)
    : item.route;

  if (item.exact) {
    return normalized === route || normalized === route + '/';
  }

  return normalized === route || normalized.startsWith(route + '/');
}

/** Indique si un item ou l'un de ses descendants est actif. */
export function isMenuBranchActive(item: MenuItem, currentUrl: string): boolean {
  if (isMenuItemActive(item, currentUrl)) {
    return true;
  }

  return item.children?.some(child => isMenuBranchActive(child, currentUrl)) ?? false;
}

/** V?rifie si l'utilisateur peut voir un item de menu. */
export function canAccessMenuItem(
  item: MenuItem,
  userRoles: string[] = [],
  userPermissions: string[] = []
): boolean {
  const hasRoleConstraint = !!item.roles?.length;
  const hasPermissionConstraint = !!item.permissions?.length;

  if (!hasRoleConstraint && !hasPermissionConstraint) {
    return true;
  }

  const roleOk = !hasRoleConstraint || item.roles!.some(role => userRoles.includes(role));
  const permOk = !hasPermissionConstraint || item.permissions!.some(p => userPermissions.includes(p));

  if (hasRoleConstraint && hasPermissionConstraint) {
    return roleOk && permOk;
  }

  return hasRoleConstraint ? roleOk : permOk;
}

/** Filtre r?cursivement le menu selon les r?les et permissions de l'utilisateur. */
export function filterMenuByAccess(
  items: MenuItem[],
  userRoles: string[] = [],
  userPermissions: string[] = []
): MenuItem[] {
  return items
    .filter(item => canAccessMenuItem(item, userRoles, userPermissions))
    .map(item => ({
      ...item,
      children: item.children
        ? filterMenuByAccess(item.children, userRoles, userPermissions)
        : undefined,
    }))
    .filter(item => !!item.route || (item.children?.length ?? 0) > 0);
}
`;

    fs.writeFileSync(menuPath, menuContent);
    console.log('? Cr??: core/config/menu.ts');
}

/**
 * Cr?e le service Menu (lien actif + filtrage permissions)
 */
function createMenuService(basePath) {
    console.log('? Cr?ation du service Menu...');

    const servicesPath = path.join(basePath, 'core', 'services');
    const menuServicePath = path.join(servicesPath, 'menu.service.ts');

    if (fs.existsSync(menuServicePath)) {
        console.log('??  Le fichier menu.service.ts existe d?j?.');
        return;
    }

    const menuServiceContent = `import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '@/core/services/core.service';
import {
  APP_MENU,
  MenuItem,
  filterMenuByAccess,
  isMenuBranchActive,
  isMenuItemActive,
} from '@/core/config/menu';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private router = inject(Router);
  private coreService = inject(CoreService);

  /** Menu filtr? selon les r?les et permissions de l'utilisateur connect?. */
  readonly visibleMenu = computed(() => {
    const user = this.coreService.currentUser();
    return filterMenuByAccess(
      APP_MENU,
      user?.roles ?? [],
      user?.permissions ?? []
    );
  });

  /** Indique si l'item correspond ? la route courante. */
  isActive(item: MenuItem): boolean {
    return isMenuItemActive(item, this.router.url);
  }

  /** Indique si l'item ou un de ses sous-menus est actif. */
  isBranchActive(item: MenuItem): boolean {
    return isMenuBranchActive(item, this.router.url);
  }
}
`;

    fs.writeFileSync(menuServicePath, menuServiceContent);
    console.log('? Cr??: core/services/menu.service.ts');
}

/**
 * Cr?e le composant de navigation r?utilisable (sous-menus + lien actif)
 */
function createAppNavMenu(basePath) {
    console.log('?? Cr?ation du composant app-nav-menu...');

    const navPath = path.join(basePath, 'shared', 'components', 'app-nav-menu');

    if (fs.existsSync(navPath)) {
        console.log('??  Le composant app-nav-menu existe d?j?.');
        return;
    }

    shelljs.mkdir('-p', navPath);

    const tsContent = `import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '@/core/config/menu';
import { MenuService } from '@/core/services/menu.service';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AppNavMenuComponent],
  templateUrl: './app-nav-menu.component.html',
  styleUrl: './app-nav-menu.component.scss',
})
export class AppNavMenuComponent {
  items = input<MenuItem[]>([]);
  nested = input(false);

  protected menuService = inject(MenuService);
}
`;

    const htmlContent = `<ul class="nav-menu" [class.nav-menu--nested]="nested()">
  @for (item of items(); track item.id) {
    <li
      class="nav-menu__item"
      [class.nav-menu__item--active]="menuService.isBranchActive(item)"
      [class.nav-menu__item--group]="!item.route && item.children?.length"
    >
      @if (item.route) {
        <a
          class="nav-menu__link"
          [routerLink]="item.route"
          routerLinkActive="nav-menu__link--active"
          [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
        >
          @if (item.icon) {
            <span class="nav-menu__icon" [attr.data-icon]="item.icon" aria-hidden="true"></span>
          }
          <span class="nav-menu__label">{{ item.title }}</span>
        </a>
      } @else {
        <span class="nav-menu__group-label">
          @if (item.icon) {
            <span class="nav-menu__icon" [attr.data-icon]="item.icon" aria-hidden="true"></span>
          }
          <span class="nav-menu__label">{{ item.title }}</span>
        </span>
      }

      @if (item.children?.length) {
        <app-nav-menu [items]="item.children!" [nested]="true" />
      }
    </li>
  }
</ul>
`;

    const scssContent = `.nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &--nested {
    margin-top: 0.25rem;
    margin-left: 1rem;
    padding-left: 0.75rem;
    border-left: 2px solid rgba(255, 255, 255, 0.15);
  }
}

.nav-menu__item--active > .nav-menu__link,
.nav-menu__link--active {
  background-color: rgba(255, 255, 255, 0.12);
  font-weight: 600;
}

.nav-menu__link,
.nav-menu__group-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: inherit;
  text-decoration: none;
}

.nav-menu__group-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.75;
  padding-top: 0.75rem;
}

.nav-menu__icon::before {
  content: attr(data-icon);
  font-size: 0.75rem;
  opacity: 0.85;
}
`;

    const specContent = `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppNavMenuComponent } from './app-nav-menu.component';
import { APP_MENU } from '@/core/config/menu';

describe('AppNavMenuComponent', () => {
  let fixture: ComponentFixture<AppNavMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppNavMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppNavMenuComponent);
    fixture.componentRef.setInput('items', APP_MENU);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
`;

    fs.writeFileSync(path.join(navPath, 'app-nav-menu.component.ts'), tsContent);
    fs.writeFileSync(path.join(navPath, 'app-nav-menu.component.html'), htmlContent);
    fs.writeFileSync(path.join(navPath, 'app-nav-menu.component.scss'), scssContent);
    fs.writeFileSync(path.join(navPath, 'app-nav-menu.component.spec.ts'), specContent);

    console.log('? Cr??: shared/components/app-nav-menu/');
}

/**
 * Cr?e les fichiers d'environnement
 */
function createEnvironmentFiles() {
    console.log('?? Cr?ation des fichiers d\\'environnement...');

    const environmentsPath = path.join(process.cwd(), 'src', 'environments');

    if (!fs.existsSync(environmentsPath)) {
        shelljs.mkdir('-p', environmentsPath);
        console.log('?? Cr??: src/environments/');
    }

    const environmentLocalPath = path.join(environmentsPath, 'environment.ts');
    const environmentLocalContent = `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // Ajoutez vos variables d'environnement ici
};
`;

    const environmentProdPath = path.join(environmentsPath, 'environment.prod.ts');
    const environmentProdContent = `export const environment = {
  production: true,
  apiUrl: 'https://api.votredomaine.com/api',
  // Ajoutez vos variables d'environnement ici
};
`;

    if (!fs.existsSync(environmentLocalPath)) {
        fs.writeFileSync(environmentLocalPath, environmentLocalContent);
        console.log('? Cr??: environments/environment.ts');
    } else {
        console.log('??  Existe d?j?: environments/environment.ts');
    }

    if (!fs.existsSync(environmentProdPath)) {
        fs.writeFileSync(environmentProdPath, environmentProdContent);
        console.log('? Cr??: environments/environment.prod.ts');
    } else {
        console.log('??  Existe d?j?: environments/environment.prod.ts');
    }
}

/**?j?: environments/environment.ts');
    }

    if (!fs.existsSync(environmentProdPath)) {
        fs.writeFileSync(environmentProdPath, environmentProdContent);
        console.log('? Cr??: environments/environment.prod.ts');
    } else {
        console.log('??  Existe d?j?: environments/environment.prod.ts');
    }
}

/**
 * Cr?e le service Core
 */
function createCoreService(basePath) {
    console.log('? Cr?ation du service Core...');

    const servicesPath = path.join(basePath, 'core', 'services');
    const coreServicePath = path.join(servicesPath, 'core.service.ts');

    if (fs.existsSync(coreServicePath)) {
        console.log('??  Le fichier core.service.ts existe d?j?.');
        return;
    }

    const coreServiceContent = `import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  permissions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  // Signal pour l'utilisateur actuel
  private _currentUser = signal<User | null>(null);
  public readonly currentUser = computed(() => this._currentUser());

  // Signal pour le token
  private _token = signal<string | null>(null);
  public readonly token = computed(() => this._token());

  // Computed pour v?rifier si l'utilisateur est authentifi?
  public readonly isAuthenticated = computed(() => !!this._token());

  // Getter pour le token (pour l'interceptor)
  public get getToken(): string | null {
    return this._token();
  }

  constructor() {
    // Charger le token depuis le localStorage au d?marrage
    this.loadTokenFromStorage();
  }

  /**
   * Charge le token depuis le localStorage
   */
  private loadTokenFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    
    if (token) {
      this._token.set(token);
    }
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this._currentUser.set(user);
      } catch (e) {
        console.error('Erreur lors du parsing du user:', e);
      }
    }
  }

  /**
   * D?finit le token d'authentification
   */
  setToken(token: string): void {
    this._token.set(token);
    localStorage.setItem('auth_token', token);
  }

  /**
   * D?finit l'utilisateur actuel
   */
  setCurrentUser(user: User): void {
    this._currentUser.set(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  /**
   * D?connecte l'utilisateur
   */
  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  /**
   * V?rifie si l'utilisateur a un r?le sp?cifique
   */
  hasRole(role: string): boolean {
    // Impl?mentez votre logique de v?rification des r?les ici
    // Par exemple: return this.currentUser()?.roles?.includes(role) ?? false;
    return false;
  }

  /**
   * V?rifie si l'utilisateur a une permission sp?cifique
   */
  hasPermission(permission: string): boolean {
    // Impl?mentez votre logique de v?rification des permissions ici
    return false;
  }
}
`;

    fs.writeFileSync(coreServicePath, coreServiceContent);
    console.log('? Cr??: core/services/core.service.ts');
}

/**
 * Cr?e le service API
 */
function createApiService(basePath) {
    console.log('? Cr?ation du service API...');

    const servicesPath = path.join(basePath, 'core', 'services');
    const apiServicePath = path.join(servicesPath, 'api.service.ts');

    if (fs.existsSync(apiServicePath)) {
        console.log('??  Le fichier api.service.ts existe d?j?.');
        return;
    }

    const apiServiceContent = `import { computed, inject, Injectable, signal, ResourceRef } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
// @ts-ignore: Assuming httpResource is available in Angular 22
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { CoreService } from '@/core/services/core.service';

export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  reportProgress?: boolean;
  observe?: 'body';
  withCredentials?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private coreService = inject(CoreService);

  private readonly apiUrl = environment.apiUrl;
  private readonly debugMode = !environment.production;

  private _backendErrors = signal<Record<string, string[]>>({});
  public readonly backendErrors = computed(() => this._backendErrors());

  private _activeRequests = signal<number>(0);
  public readonly loading = computed(() => this._activeRequests() > 0);

  clearBackendErrors(): void {
    this._backendErrors.set({});
  }

  clearFieldError(fieldName: string): void {
    const errors = { ...this._backendErrors() };
    delete errors[fieldName];
    this._backendErrors.set(errors);
  }

  /**
   * Effectue une requ?te GET via httpResource() (Angular 22+)
   * @param url Chemin de l'API
   * @param options Options pour la ressource
   * @returns ResourceRef g?rant isLoading, value, error
   */
  getResource<T>(url: string, options?: any): any /* ResourceRef<T> */ {
    return httpResource<T>(this.apiUrl + url, options);
  }

  get<T>(url: string, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    return this.http.get<T>(this.apiUrl + url, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[GET] \${url}\`, data); }
      }),
      catchError(error => this.handleError(error, 'GET', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  post<T>(url: string, data: any, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    this.clearBackendErrors();
    return this.http.post<T>(this.apiUrl + url, data, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[POST] \${url}\`, { request: data, response: data }); }
      }),
      catchError(error => this.handleError(error, 'POST', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  put<T>(url: string, data: any, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    this.clearBackendErrors();
    return this.http.put<T>(this.apiUrl + url, data, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[PUT] \${url}\`, { request: data, response: data }); }
      }),
      catchError(error => this.handleError(error, 'PUT', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  patch<T>(url: string, data: any, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    this.clearBackendErrors();
    return this.http.patch<T>(this.apiUrl + url, data, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[PATCH] \${url}\`, { request: data, response: data }); }
      }),
      catchError(error => this.handleError(error, 'PATCH', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  delete<T>(url: string, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    return this.http.delete<T>(this.apiUrl + url, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[DELETE] \${url}\`, data); }
      }),
      catchError(error => this.handleError(error, 'DELETE', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  private handleError(error: HttpErrorResponse, method: string, url: string): Observable<never> {
    if (this.debugMode) {
      console.error(\`[ERROR \${method}] \${url}\`, error);
    }

    switch (error.status) {
      case 0:
        console.error('Connexion au serveur impossible. V?rifiez votre connexion internet.');
        break;
      case 401:
        console.warn('Session expir?e. Redirection vers la page de connexion...');
        this.coreService.clearToken();
        this.router.navigate(['/']);
        break;
      case 422:
        this._backendErrors.set(error.error?.errors || {});
        if (this.debugMode) { console.log('Erreurs de validation:', this._backendErrors()); }
        break;
      default:
        console.error(error.error?.message || 'Une erreur est survenue.');
    }

    return throwError(() => error);
  }
}
`;

    fs.writeFileSync(apiServicePath, apiServiceContent);
    console.log('? Cr??: core/services/api.service.ts');
}

/**
 * Cr?e les guards
 */
function createGuards(basePath) {
    console.log('???  Cr?ation des guards...');

    const guardsPath = path.join(basePath, 'core', 'guards');

    // AuthGuard
    const authGuardPath = path.join(guardsPath, 'auth.guard.ts');
    if (!fs.existsSync(authGuardPath)) {
        const authGuardContent = `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CoreService } from '../services/core.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const coreService = inject(CoreService);
  const router = inject(Router);

  if (!coreService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
`;
        fs.writeFileSync(authGuardPath, authGuardContent);
        console.log('? Cr??: core/guards/auth.guard.ts');
    } else {
        console.log('??  Existe d?j?: core/guards/auth.guard.ts');
    }

    // GuestGuard
    const guestGuardPath = path.join(guardsPath, 'guest.guard.ts');
    if (!fs.existsSync(guestGuardPath)) {
        const guestGuardContent = `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CoreService } from '../services/core.service';

export const GuestGuard: CanActivateFn = (route, state) => {
  const coreService = inject(CoreService);
  const router = inject(Router);

  if (coreService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
`;
        fs.writeFileSync(guestGuardPath, guestGuardContent);
        console.log('? Cr??: core/guards/guest.guard.ts');
    } else {
        console.log('??  Existe d?j?: core/guards/guest.guard.ts');
    }
}

/**
 * Cr?e l'interceptor HTTP
 */
function createHttpInterceptor(basePath) {
    console.log('?? Cr?ation de l\'interceptor HTTP...');

    const interceptorsPath = path.join(basePath, 'core', 'interceptors');
    const interceptorPath = path.join(interceptorsPath, 'http.interceptor.ts');

    if (fs.existsSync(interceptorPath)) {
        console.log('??  Le fichier http.interceptor.ts existe d?j?.');
        return;
    }

    const interceptorContent = `import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CoreService } from '../services/core.service';

// HttpRequestInterceptor to inject the token in the header of the request
export function HttpInterceptor(request: HttpRequest<any>, next: HttpHandlerFn) {
  const coreService = inject(CoreService);
  const token = coreService.getToken;
  const isAuth = coreService.isAuthenticated();
  const apiRegex = new RegExp(\`^\${environment.apiUrl}\`);
  
  if (apiRegex.test(request.url)) {
    if (isAuth && token) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: \`Bearer \${token}\`,
        },
      });
      return next(authReq);
    }
  }
  
  return next(request);
}
`;

    fs.writeFileSync(interceptorPath, interceptorContent);
    console.log('? Cr??: core/interceptors/http.interceptor.ts');
}

/**
 * Cr?e ou met ? jour app.config.ts
 */
function createAppConfig(basePath) {
    console.log('??  Mise ? jour de app.config.ts...');

    const configPath = path.join(basePath, 'app.config.ts');

    // Si le fichier n'existe pas, cr?er un fichier minimal
    if (!fs.existsSync(configPath)) {
        const configContent = `import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { HttpInterceptor } from './core/interceptors/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([HttpInterceptor])
    )
  ]
};
`;
        fs.writeFileSync(configPath, configContent);
        console.log('? Cr??: app.config.ts');
        return;
    }

    // Overwrite the file to ensure Zoneless and withComponentInputBinding are present
    const configContent = `import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { HttpInterceptor } from './core/interceptors/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([HttpInterceptor])
    )
  ]
};
`;
    fs.writeFileSync(configPath, configContent);
    console.log('? app.config.ts mis ? jour (Zoneless, Router, HttpClient).');
}

/**
 * G?n?re le composant main-layout
 */
function generateMainLayout() {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout', 'main-layout');
    const componentTsPath = path.join(layoutPath, 'main-layout.ts');

    if (fs.existsSync(componentTsPath)) {
        console.log('??  Le composant main-layout existe d?j?.');
        return;
    }

    console.log('?? Cr?ation du composant main-layout...');

    if (!fs.existsSync(layoutPath)) {
        shelljs.mkdir('-p', layoutPath);
    }

    const tsContent = `import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNavMenuComponent } from '@/shared/components/app-nav-menu/app-nav-menu.component';
import { MenuService } from '@/core/services/menu.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, AppNavMenuComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  protected menuService = inject(MenuService);
}
`;

    const htmlContent = `<div class="main-layout">
  <aside class="sidebar">
    <div class="sidebar__brand">
      <h1>Mon Application</h1>
    </div>
    <nav class="sidebar__nav" aria-label="Navigation principale">
      <app-nav-menu [items]="menuService.visibleMenu()" />
    </nav>
  </aside>

  <div class="main-layout__body">
    <main class="content">
      <div class="container">
        <router-outlet />
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 - Mon Application</p>
      </div>
    </footer>
  </div>
</div>
`;

    const scssContent = `.main-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background-color: #1f2937;
  color: #f9fafb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &__brand {
    padding: 1.25rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    h1 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
    }
  }

  &__nav {
    padding: 1rem 0.75rem;
    flex: 1;
    overflow-y: auto;
  }
}

.main-layout__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.content {
  flex: 1;
  padding: 2rem 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
}

.footer {
  background-color: #f5f5f5;
  padding: 1rem 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    text-align: center;
  }
}
`;

    fs.writeFileSync(componentTsPath, tsContent);
    fs.writeFileSync(path.join(layoutPath, 'main-layout.html'), htmlContent);
    fs.writeFileSync(path.join(layoutPath, 'main-layout.scss'), scssContent);

    console.log('? Composant main-layout cr??.');
}

/**
 * Remplace app.component
 */
function replaceAppComponent(basePath) {
    console.log('?? Mise ? jour de app.component...');

    const appComponentDir = basePath;

    const possibleFiles = [
        'app.component.html',
        'app.html',
        'app.spec.ts',
        'app.component.css',
        'app.css',
        'app.scss',
        'app.component.scss',
        'app.component.sass',
        'app.component.less',
        'app.component.spec.ts'
    ];

    possibleFiles.forEach(file => {
        const filePath = path.join(appComponentDir, file);
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath);
            console.log(`???  Supprim?: ${file}`);
        }
    });

    const appTsPath = path.join(appComponentDir, 'app.ts');
    const appTsContent = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class App {}
`;

    fs.writeFileSync(appTsPath, appTsContent);
    console.log('? Fichier app.ts mis ? jour.');
}

/**
 * Cr?e app.routes.ts
 */
function createAppRoutes(basePath) {
    const routesPath = path.join(basePath, 'app.routes.ts');

    if (fs.existsSync(routesPath)) {
        console.log('??  Le fichier app.routes.ts existe d?j?.');
        return;
    }

    const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log('? Fichier app.routes.ts cr??.');
}

/**
 * Cr?e les modules par d?faut (auth et dashboard)
 */
async function createDefaultModules(basePath) {
    console.log('\n?? Cr?ation des modules par d?faut...\n');

    const featuresPath = path.join(basePath, 'features');

    // Cr?er le module auth
    await createModule(featuresPath, 'auth', 'GuestGuard');

    // Cr?er le module dashboard
    await createModule(featuresPath, 'dashboard', 'AuthGuard');

    // Mettre ? jour app.routes.ts avec les modules
    updateAppRoutesWithDefaultModules(basePath);
}

/**
 * Cr?e un module
 */
async function createModule(featuresPath, moduleName, guardType) {
    const modulePath = path.join(featuresPath, moduleName);

    if (fs.existsSync(modulePath)) {
        console.log(`??  Le module "${moduleName}" existe d?j?.`);
        return;
    }

    // Cr?er la structure
    const folders = ['views', 'models', 'components', 'services'];
    shelljs.mkdir('-p', modulePath);

    folders.forEach(folder => {
        const folderPath = path.join(modulePath, folder);
        shelljs.mkdir('-p', folderPath);
        fs.writeFileSync(path.join(folderPath, '.gitkeep'), '');
    });

    console.log(`?? Cr??: features/${moduleName}/`);

    // Cr?er le fichier routes.ts avec le guard appropri?
    const guardImport = guardType === 'AuthGuard'
        ? "import { AuthGuard } from '../../core/guards/auth.guard';"
        : "import { GuestGuard } from '../../core/guards/guest.guard';";

    const constantName = moduleName.toUpperCase() + '_ROUTES';
    const routesContent = `import { Routes } from '@angular/router';
${guardImport}

export const ${constantName}: Routes = [
    {
        path: '',
        loadComponent: () => import('../../layout/main-layout/main-layout').then(m => m.MainLayout),
        canActivate: [${guardType}],
        children: [
        ]
    }
];
`;

    fs.writeFileSync(path.join(modulePath, 'routes.ts'), routesContent);
    console.log(`? Cr??: features/${moduleName}/routes.ts (avec ${guardType})`);
}

/**
 * Met ? jour app.routes.ts avec les modules par d?faut
 */
function updateAppRoutesWithDefaultModules(basePath) {
    const routesPath = path.join(basePath, 'app.routes.ts');

    const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./features/auth/routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES)
    },
    {
        path: '**',
        title: 'Page introuvable',
        redirectTo: ''
    }
];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log('? app.routes.ts mis ? jour avec les modules par d?faut et route fallback.');
}

/**
 * Met ? jour angular.json
 */
function updateAngularJson() {
    console.log('??  Mise ? jour de angular.json...');

    const angularJsonPath = path.join(process.cwd(), 'angular.json');

    if (!fs.existsSync(angularJsonPath)) {
        console.warn('??  Fichier angular.json introuvable.');
        return;
    }

    try {
        const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
        const projectName = Object.keys(angularJson.projects)[0];

        if (!projectName) {
            console.warn('??  Aucun projet trouv? dans angular.json.');
            return;
        }

        const project = angularJson.projects[projectName];

        if (!project.architect || !project.architect.build) {
            console.warn('??  Configuration build introuvable.');
            return;
        }

        const buildConfig = project.architect.build;

        if (!buildConfig.configurations) {
            buildConfig.configurations = {};
        }

        if (!buildConfig.configurations.production) {
            buildConfig.configurations.production = {};
        }

        buildConfig.configurations.production.fileReplacements = [
            {
                replace: 'src/environments/environment.ts',
                with: 'src/environments/environment.prod.ts'
            }
        ];

        if (!buildConfig.configurations.production.optimization) {
            buildConfig.configurations.production.optimization = true;
        }
        if (!buildConfig.configurations.production.outputHashing) {
            buildConfig.configurations.production.outputHashing = 'all';
        }
        if (!buildConfig.configurations.production.sourceMap) {
            buildConfig.configurations.production.sourceMap = false;
        }

        if (!buildConfig.configurations.development) {
            buildConfig.configurations.development = {
                optimization: false,
                extractLicenses: false,
                sourceMap: true,
                namedChunks: true
            };
        }

        if (project.architect.serve && !project.architect.serve.defaultConfiguration) {
            project.architect.serve.defaultConfiguration = 'development';
        }

        // Configuration des Schematics pour imposer les suffixes de type
        angularJson.schematics = angularJson.schematics || {};
        const schematics = ['component', 'service', 'directive', 'pipe', 'guard'];
        schematics.forEach(type => {
            const key = `@schematics/angular:${type}`;
            angularJson.schematics[key] = angularJson.schematics[key] || {};
            if (type !== 'guard') {
                angularJson.schematics[key].type = type;
            }
        });

        fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
        console.log('? angular.json mis ? jour.');

    } catch (error) {
        console.error('? Erreur lors de la mise ? jour de angular.json:', error.message);
    }
}

/**
 * Met ? jour tsconfig.json pour ajouter l'alias @/* ? src/app/*
 */
function updateTsConfig() {
    console.log('??  Mise ? jour de tsconfig.json (alias @)...');

    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

    if (!fs.existsSync(tsconfigPath)) {
        console.warn('??  Fichier tsconfig.json introuvable.');
        return;
    }

    try {
        const tsconfigRaw = fs.readFileSync(tsconfigPath, 'utf8');
        const tsconfigCleaned = tsconfigRaw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
        const tsconfig = JSON.parse(tsconfigCleaned);

        if (!tsconfig.compilerOptions) {
            tsconfig.compilerOptions = {};
        }

        if (!tsconfig.compilerOptions.paths) {
            tsconfig.compilerOptions.paths = {};
        }

        if (tsconfig.compilerOptions.paths['@/*']) {
            console.log('??  Alias "@/*" d?j? configur? dans tsconfig.json.');
            return;
        }

        tsconfig.compilerOptions.baseUrl = './';
        tsconfig.compilerOptions.paths['@/*'] = ['src/app/*'];

        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
        console.log('? tsconfig.json mis ? jour (alias @/* ? src/app/*).');

    } catch (error) {
        console.error('? Erreur lors de la mise ? jour de tsconfig.json:', error.message);
    }
}

function cleanCssTraces(frameworkToRemove) {
    const scssPath = path.join(process.cwd(), 'src', 'styles.scss');
    const cssPath = path.join(process.cwd(), 'src', 'styles.css');
    const styleFile = fs.existsSync(scssPath) ? scssPath : (fs.existsSync(cssPath) ? cssPath : null);

    if (frameworkToRemove === 'tailwind') {
        console.log('?? Nettoyage des traces de Tailwind CSS...');
        shelljs.exec('npm uninstall tailwindcss @tailwindcss/postcss postcss autoprefixer', { silent: true });
        
        if (styleFile) {
            let content = fs.readFileSync(styleFile, 'utf8');
            content = content.replace(/@import\s+['"]tailwindcss['"];?\n?/g, '');
            content = content.replace(/@tailwind\s+(base|components|utilities);?\n?/g, '');
            fs.writeFileSync(styleFile, content);
        }
    } else if (frameworkToRemove === 'bootstrap') {
        console.log('?? Nettoyage des traces de Bootstrap...');
        shelljs.exec('npm uninstall bootstrap', { silent: true });
        
        if (styleFile) {
            let content = fs.readFileSync(styleFile, 'utf8');
            content = content.replace(/@import\s+['"]bootstrap\/scss\/bootstrap['"];?\n?/g, '');
            content = content.replace(/@import\s+['"]bootstrap\/dist\/css\/bootstrap\.min\.css['"];?\n?/g, '');
            fs.writeFileSync(styleFile, content);
        }

        const angularJsonPath = path.join(process.cwd(), 'angular.json');
        if (fs.existsSync(angularJsonPath)) {
            try {
                const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
                const projectName = Object.keys(angularJson.projects)[0];
                const architect = angularJson.projects[projectName].architect;
                
                if (architect && architect.build && architect.build.options && architect.build.options.scripts) {
                    architect.build.options.scripts = architect.build.options.scripts.filter(script => 
                        !script.includes('bootstrap')
                    );
                    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
                }
            } catch (e) {
                // Silently ignore if angular.json cannot be parsed during cleanup
            }
        }
    }
}

function configureCssFramework(framework) {
    if (framework === 'bootstrap') {
        cleanCssTraces('tailwind');
        console.log('\n?? Configuration de Bootstrap...');
        shelljs.exec('npm install bootstrap', { silent: false });
        
        const scssPath = path.join(process.cwd(), 'src', 'styles.scss');
        const cssPath = path.join(process.cwd(), 'src', 'styles.css');
        const styleFile = fs.existsSync(scssPath) ? scssPath : (fs.existsSync(cssPath) ? cssPath : null);
        
        if (styleFile) {
            let content = fs.readFileSync(styleFile, 'utf8');
            const isScss = styleFile.endsWith('.scss');
            
            // Pour le SCSS, on importe le code source SASS de Bootstrap. Pour le CSS, on importe le fichier minifi?.
            const bootstrapImport = isScss 
                ? `@import 'bootstrap/scss/bootstrap';\n\n`
                : `@import 'bootstrap/dist/css/bootstrap.min.css';\n\n`;
                
            if (!content.includes('bootstrap')) {
                fs.writeFileSync(styleFile, bootstrapImport + content);
                console.log("? Fichier styles mis ? jour avec l'import de Bootstrap.");
            }
        } else {
            console.warn("??  Fichier styles.scss/css introuvable pour ajouter l'import de Bootstrap.");
        }

        // On injecte ?galement le JS de Bootstrap dans angular.json
        const angularJsonPath = path.join(process.cwd(), 'angular.json');
        if (fs.existsSync(angularJsonPath)) {
            try {
                const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
                const projectName = Object.keys(angularJson.projects)[0];
                const architect = angularJson.projects[projectName].architect;
                
                if (architect && architect.build && architect.build.options) {
                    architect.build.options.scripts = architect.build.options.scripts || [];
                    
                    if (!architect.build.options.scripts.includes('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js') &&
                        !architect.build.options.scripts.includes('bootstrap/dist/js/bootstrap.bundle.min.js')) {
                        architect.build.options.scripts.push('bootstrap/dist/js/bootstrap.bundle.min.js');
                    }
                    
                    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
                    console.log('? angular.json mis ? jour avec les scripts Bootstrap.');
                }
            } catch (e) {
                console.error('? Erreur lors de la configuration Bootstrap dans angular.json:', e.message);
            }
        }
    } else if (framework === 'tailwind') {
        cleanCssTraces('bootstrap');
        console.log('\n?? Configuration de Tailwind CSS...');
        shelljs.exec('ng add tailwindcss --skip-confirmation', { silent: false });
        console.log('? Tailwind CSS install? et configur?.');
    } else if (framework === 'custom') {
        cleanCssTraces('tailwind');
        cleanCssTraces('bootstrap');
        console.log('\n?? Configuration du CSS Custom (Reset de base)...');
        const scssPath = path.join(process.cwd(), 'src', 'styles.scss');
        const cssPath = path.join(process.cwd(), 'src', 'styles.css');
        const styleFile = fs.existsSync(scssPath) ? scssPath : (fs.existsSync(cssPath) ? cssPath : null);
        
        if (styleFile) {
            const customReset = `/* Global Reset & Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
}
`;
            let content = fs.readFileSync(styleFile, 'utf8');
            if (!content.includes('box-sizing')) {
                fs.writeFileSync(styleFile, customReset + '\n' + content);
                console.log('? Fichier styles mis ? jour avec le reset CSS custom.');
            }
        }
    }
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
    console.error('\n? Erreur inattendue:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('\n? Promesse rejet?e:', reason);
    process.exit(1);
});

// Ex?cution
initProject();