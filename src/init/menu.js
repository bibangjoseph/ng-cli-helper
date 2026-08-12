import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

/**
 * Crée le fichier de configuration du menu
 */
export function createMenuConfig(basePath) {
    console.log('⚙️  Création de la configuration du menu...');

    const configPath = path.join(basePath, 'core', 'config');
    const menuPath = path.join(configPath, 'menu.ts');

    if (!fs.existsSync(configPath)) {
        shelljs.mkdir('-p', configPath);
    }

    if (fs.existsSync(menuPath)) {
        console.log('ℹ️  Le fichier menu.ts existe déjà.');
        return;
    }

    const menuContent = `/**
 * Configuration centralisée du menu de navigation.
 *
 * - route       : chemin Angular (routerLink)
 * - icon        : identifiant d'icône (classe CSS, SVG sprite, etc.)
 * - children    : sous-menus
 * - permissions : l'utilisateur doit posséder au moins une de ces permissions
 * - roles       : l'utilisateur doit posséder au moins un de ces rôles
 * - exact       : correspondance stricte de la route pour le lien actif
 *
 * Le lien actif est calculé à l'exécution via isMenuItemActive() / MenuService.
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

/** Menu principal de l'application — personnalisez cette liste selon vos features. */
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
        title: 'Créer un utilisateur',
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

/** Indique si un item (avec route) correspond à l'URL courante. */
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

/** Vérifie si l'utilisateur peut voir un item de menu. */
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

/** Filtre récursivement le menu selon les rôles et permissions de l'utilisateur. */
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
    console.log('✅ Créé: core/config/menu.ts');
}

/**
 * Crée le service Menu (lien actif + filtrage permissions)
 */
export function createMenuService(basePath) {
    console.log('⚡ Création du service Menu...');

    const servicesPath = path.join(basePath, 'core', 'services');
    const menuServicePath = path.join(servicesPath, 'menu.service.ts');

    if (fs.existsSync(menuServicePath)) {
        console.log('ℹ️  Le fichier menu.service.ts existe déjà.');
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

  /** Menu filtré selon les rôles et permissions de l'utilisateur connecté. */
  readonly visibleMenu = computed(() => {
    const user = this.coreService.currentUser();
    return filterMenuByAccess(
      APP_MENU,
      user?.roles ?? [],
      user?.permissions ?? []
    );
  });

  /** Indique si l'item correspond à la route courante. */
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
    console.log('✅ Créé: core/services/menu.service.ts');
}

/**
 * Crée le composant de navigation réutilisable (sous-menus + lien actif)
 */
export function createAppNavMenu(basePath) {
    console.log('🧩 Création du composant app-nav-menu...');

    const navPath = path.join(basePath, 'shared', 'components', 'app-nav-menu');

    if (fs.existsSync(navPath)) {
        console.log('ℹ️  Le composant app-nav-menu existe déjà.');
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

    console.log('✅ Créé: shared/components/app-nav-menu/');
}
