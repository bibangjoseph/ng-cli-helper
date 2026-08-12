import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

/**
 * Génère le composant main-layout
 */
export function generateMainLayout() {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout', 'main-layout');
    const componentTsPath = path.join(layoutPath, 'main-layout.ts');

    if (fs.existsSync(componentTsPath)) {
        console.log('ℹ️  Le composant main-layout existe déjà.');
        return;
    }

    console.log('🧩 Création du composant main-layout...');

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

    console.log('✅ Composant main-layout créé.');
}

/**
 * Remplace app.component
 */
export function replaceAppComponent(basePath) {
    console.log('🧩 Mise à jour de app.component...');

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
            console.log(`🗑️  Supprimé: ${file}`);
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
    console.log('✅ Fichier app.ts mis à jour.');
}
