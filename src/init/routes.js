import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

/**
 * Crée app.routes.ts
 */
export function createAppRoutes(basePath) {
    const routesPath = path.join(basePath, 'app.routes.ts');

    if (fs.existsSync(routesPath)) {
        console.log('ℹ️  Le fichier app.routes.ts existe déjà.');
        return;
    }

    const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log('✅ Fichier app.routes.ts créé.');
}

/**
 * Crée les modules par défaut (auth et dashboard)
 */
export async function createDefaultModules(basePath) {
    console.log('\n📦 Création des modules par défaut...\n');

    const featuresPath = path.join(basePath, 'features');

    // Créer le module auth
    await createModule(featuresPath, 'auth', 'GuestGuard');

    // Créer le module dashboard
    await createModule(featuresPath, 'dashboard', 'AuthGuard');

    // Mettre à jour app.routes.ts avec les modules
    updateAppRoutesWithDefaultModules(basePath);
}

/**
 * Crée un module
 */
export async function createModule(featuresPath, moduleName, guardType) {
    const modulePath = path.join(featuresPath, moduleName);

    if (fs.existsSync(modulePath)) {
        console.log(`ℹ️  Le module "${moduleName}" existe déjà.`);
        return;
    }

    // Créer la structure
    const folders = ['views', 'models', 'components', 'services'];
    shelljs.mkdir('-p', modulePath);

    folders.forEach(folder => {
        const folderPath = path.join(modulePath, folder);
        shelljs.mkdir('-p', folderPath);
        fs.writeFileSync(path.join(folderPath, '.gitkeep'), '');
    });

    console.log(`📁 Créé: features/${moduleName}/`);

    // Créer le fichier routes.ts avec le guard approprié
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
    console.log(`✅ Créé: features/${moduleName}/routes.ts (avec ${guardType})`);
}

/**
 * Met à jour app.routes.ts avec les modules par défaut
 */
export function updateAppRoutesWithDefaultModules(basePath) {
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
    console.log('✅ app.routes.ts mis à jour avec les modules par défaut et route fallback.');
}
