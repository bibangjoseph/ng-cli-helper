#!/usr/bin/env node
import path from 'path';
import inquirer from 'inquirer';
import { isAngularProject, setupErrorHandlers, getAngularMajorVersion } from './utils.js';
import { createFolderStructure } from './init/folderStructure.js';
import { createMenuConfig, createMenuService, createAppNavMenu } from './init/menu.js';
import { createEnvironmentFiles } from './init/environment.js';
import { createCoreService } from './init/coreService.js';
import { createApiService } from './init/apiService.js';
import { createGuards } from './init/guards.js';
import { createHttpInterceptor } from './init/interceptor.js';
import { createAppConfig } from './init/appConfig.js';
import { generateMainLayout, replaceAppComponent } from './init/layout.js';
import { createAppRoutes, createDefaultModules } from './init/routes.js';
import { updateAngularJson } from './init/angularJson.js';
import { updateTsConfig } from './init/tsconfig.js';
import { configureCssFramework } from './init/cssFramework.js';

setupErrorHandlers();

/**
 * Initialise la structure complète du projet Angular
 */
async function initProject() {
    console.log('\n🚀 Angular CLI Helper - Initialisation du projet\n');
    console.log('🏗️  Création de la structure de base du projet...\n');

    try {
        if (!isAngularProject()) {
            console.error('❌ Erreur: Ce n\'est pas un projet Angular.');
            console.error('💡 Assurez-vous d\'être dans le dossier racine d\'un projet Angular.\n');
            process.exit(1);
        }

        const angularVersion = getAngularMajorVersion();
        if (angularVersion !== 0 && angularVersion < 22) {
            console.warn(`⚠️  Attention: Ce projet utilise Angular ${angularVersion}. Angular CLI Helper est optimisé pour Angular 22+ (Zoneless, Signals, etc.).`);
            
            const { continueInit } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'continueInit',
                    message: 'Voulez-vous quand même continuer l\'initialisation ?',
                    default: false
                }
            ]);

            if (!continueInit) {
                console.log('🛑 Initialisation annulée.');
                process.exit(0);
            }
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

        // Créer la structure de dossiers
        createFolderStructure(basePath);

        // Créer la configuration du menu (routes, icônes, sous-menus, permissions)
        createMenuConfig(basePath);
        createMenuService(basePath);
        createAppNavMenu(basePath);

        // Créer les fichiers d'environnement
        createEnvironmentFiles();

        // Modifier angular.json pour fileReplacements
        updateAngularJson();

        // Ajouter l'alias @/* dans tsconfig.json
        updateTsConfig();

        // Créer le service Core
        createCoreService(basePath);

        // Créer le service API
        createApiService(basePath);

        // Créer les guards
        createGuards(basePath);

        // Créer l'interceptor
        createHttpInterceptor(basePath);

        // Créer/Mettre à jour app.config.ts
        createAppConfig(basePath);

        // Générer le main-layout
        generateMainLayout();

        // Remplacer app.component
        replaceAppComponent(basePath);

        // Créer app.routes.ts si inexistant
        createAppRoutes(basePath);

        // Créer les modules par défaut
        await createDefaultModules(basePath);

        // Configurer le framework CSS
        configureCssFramework(cssFramework);

        console.log('\n✅ Structure du projet créée avec succès!\n');
        console.log('📦 Structure générée:');
        console.log(`
    src/
    └── app/
        ├── core/
        │   ├── config/
        │   │   └── menu.ts
        │   ├── services/
        │   │   ├── api.service.ts
        │   │   ├── core.service.ts
        │   │   └── menu.service.ts
        │   ├── guards/
        │   │   ├── auth.guard.ts
        │   │   └── guest.guard.ts
        │   └── interceptors/
        │       └── http.interceptor.ts
        ├── shared/
        │   ├── components/
        │   │   └── app-nav-menu/
        │   ├── directives/
        │   └── pipes/
        ├── layout/
        │   └── main-layout/
        ├── features/
        │   ├── auth/
        │   └── dashboard/
        ├── app.ts
        ├── app.config.ts
        └── app.routes.ts
    environments/
        ├── environment.ts
        └── environment.prod.ts
        `);

        console.log('💡 Prochaines étapes:');
        console.log('   - Modules "auth" et "dashboard" créés par défaut');
        console.log('   - Utilisez "npm run g:package" pour créer d\'autres modules');
        console.log('   - Utilisez "npm run g:page" pour créer des pages');
        console.log('   - Le service API est disponible dans core/services/api.service.ts');
        console.log('   - Le service Core gère l\'authentification');
        console.log('   - Les guards AuthGuard et GuestGuard sont disponibles');
        console.log('   - L\'interceptor HTTP est configuré pour injecter le token\n');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

initProject();
