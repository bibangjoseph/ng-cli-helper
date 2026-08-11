#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import fs from 'fs';
import path from 'path';
import { toKebabCase, toConstantCase, toPascalCase, isAngularProject } from './utils.js';

function createPackageStructure(modulePath, moduleName) {
    console.log(`\n📦 Création du package "${moduleName}"...\n`);

    const folders = ['views', 'models', 'components'];

    folders.forEach(folder => {
        const folderPath = path.join(modulePath, folder);
        if (!fs.existsSync(folderPath)) {
            shelljs.mkdir('-p', folderPath);
            console.log(`📁 Créé: features/${moduleName}/${folder}/`);
            fs.writeFileSync(path.join(folderPath, '.gitkeep'), '');
        } else {
            console.log(`ℹ️  Existe déjà: features/${moduleName}/${folder}/`);
        }
    });
}

function createRoutesFile(modulePath, moduleName, guardType) {
    const routesPath = path.join(modulePath, 'routes.ts');

    if (fs.existsSync(routesPath)) {
        console.log(`ℹ️  Le fichier routes.ts existe déjà dans ${moduleName}/`);
        return;
    }

    const constantName = toConstantCase(moduleName);

    // Préparer l'import et le canActivate selon le guard choisi
    let guardImport = '';
    let canActivateLine = '';

    if (guardType === 'AuthGuard') {
        guardImport = "import { AuthGuard } from '../../core/guards/auth.guard';";
        canActivateLine = '        canActivate: [AuthGuard],';
    } else if (guardType === 'GuestGuard') {
        guardImport = "import { GuestGuard } from '../../core/guards/guest.guard';";
        canActivateLine = '        canActivate: [GuestGuard],';
    }

    const routesContent = `import { Routes } from '@angular/router';
${guardImport}

export const ${constantName}_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../../layout/main-layout/main-layout').then(m => m.MainLayout),
${canActivateLine}
        children: [
        ]
    }
];
`;

    fs.writeFileSync(routesPath, routesContent);
    console.log(`✅ Créé: features/${moduleName}/routes.ts (avec ${guardType || 'aucun guard'})`);
}

function createModuleReadme(modulePath, moduleName, guardType) {
    const readmePath = path.join(modulePath, 'README.md');

    if (fs.existsSync(readmePath)) {
        return;
    }

    const pascalName = toPascalCase(moduleName);
    const guardInfo = guardType ? `\n- **Guard**: ${guardType}` : '';

    const readmeContent = `# ${pascalName} Module

## Description
Module ${pascalName} - Description à compléter${guardInfo}

## Structure
\`\`\`
${moduleName}/
├── components/     # Composants réutilisables du module
├── views/          # Pages/vues du module
├── models/         # Interfaces et types
└── routes.ts       # Configuration des routes (lazy loading)
\`\`\`

## Routes
- \`/${toKebabCase(moduleName)}\` - Route principale (lazy loaded)

## Commandes utiles
\`\`\`bash
# Créer une page
npm run g:page

# Créer un composant
npm run g:component

# Créer un modèle
npm run g:model
\`\`\`
`;

    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ Créé: features/${moduleName}/README.md`);
}

function updateAppRoutes(moduleName) {
    console.log('\n⚙️  Mise à jour de app.routes.ts...');

    const appRoutesPath = path.join(process.cwd(), 'src', 'app', 'app.routes.ts');

    if (!fs.existsSync(appRoutesPath)) {
        console.error('❌ Fichier app.routes.ts introuvable.');
        return;
    }

    try {
        let content = fs.readFileSync(appRoutesPath, 'utf8');

        const constantName = toConstantCase(moduleName);
        const importName = `${constantName}_ROUTES`;
        const kebabName = toKebabCase(moduleName);

        // Vérifier si le module existe déjà
        if (content.includes(`path: '${kebabName}'`) && content.includes(importName)) {
            console.log(`ℹ️  Le module "${moduleName}" est déjà dans app.routes.ts`);
            return;
        }

        const newRoute = `    {
        path: '${kebabName}',
        loadChildren: () => import('./features/${moduleName}/routes').then(m => m.${importName})
    }`;

        const routesStartRegex = /export\s+const\s+routes:\s*Routes\s*=\s*\[/;
        const routesStartMatch = content.match(routesStartRegex);

        if (!routesStartMatch) {
            console.error('❌ Impossible de trouver "export const routes: Routes = ["');
            return;
        }

        const arrayStartIndex = routesStartMatch.index + routesStartMatch[0].length;

        let bracketCount = 1;
        let arrayEndIndex = -1;

        for (let i = arrayStartIndex; i < content.length; i++) {
            if (content[i] === '[') {
                bracketCount++;
            } else if (content[i] === ']') {
                bracketCount--;
                if (bracketCount === 0) {
                    arrayEndIndex = i;
                    break;
                }
            }
        }

        if (arrayEndIndex === -1) {
            console.error('❌ Impossible de trouver la fermeture du tableau routes');
            return;
        }

        let routesContent = content.slice(arrayStartIndex, arrayEndIndex);

        const wildcardRegex = /\{\s*path:\s*['"][*]{2}['"]/;
        const hasWildcard = wildcardRegex.test(routesContent);

        if (hasWildcard) {
            const wildcardMatch = routesContent.match(wildcardRegex);
            const wildcardPos = routesContent.indexOf(wildcardMatch[0]);

            let wildcardStart = wildcardPos;
            let braceCount = 0;

            for (let i = wildcardPos; i >= 0; i--) {
                if (routesContent[i] === '}') {
                    braceCount++;
                } else if (routesContent[i] === '{') {
                    if (braceCount === 0) {
                        wildcardStart = i;
                        break;
                    }
                    braceCount--;
                }
            }

            const beforeWildcard = routesContent.slice(0, wildcardStart);
            const wildcardAndAfter = routesContent.slice(wildcardStart);

            const trimmedBefore = beforeWildcard.trimEnd();
            let needsComma = false;

            if (trimmedBefore.length > 0) {
                const lastChar = trimmedBefore[trimmedBefore.length - 1];
                needsComma = lastChar !== ',' && lastChar !== '[';
            }

            routesContent = beforeWildcard +
                (needsComma ? ',' : '') +
                '\n' + newRoute + ',' +
                '\n' + wildcardAndAfter;

            console.log('✅ Route ajoutée avant le wildcard (**)');

        } else {
            const trimmedContent = routesContent.trimEnd();
            let needsComma = false;

            if (trimmedContent.length > 0) {
                const lastChar = trimmedContent[trimmedContent.length - 1];
                needsComma = lastChar !== ',' && lastChar !== '[';
            }

            routesContent = routesContent +
                (needsComma ? ',' : '') +
                '\n' + newRoute;

            console.log('✅ Route ajoutée à la fin du tableau');
        }

        content = content.slice(0, arrayStartIndex) + routesContent + content.slice(arrayEndIndex);

        fs.writeFileSync(appRoutesPath, content, 'utf8');
        console.log(`✅ Module "${moduleName}" ajouté à app.routes.ts avec succès!\n`);

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de app.routes.ts:', error.message);
    }
}

async function createPackage() {
    console.log('\n🚀 Angular CLI Helper - Création de package\n');

    if (!isAngularProject()) {
        console.error('❌ Erreur: Ce n\'est pas un projet Angular.\n');
        process.exit(1);
    }

    const answers = await inquirer.prompt([
        {
            name: 'moduleName',
            message: 'Quel est le nom du package/module ?',
            validate: input => {
                if (!input) {
                    return 'Le nom du package ne peut pas être vide.';
                }
                if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) {
                    return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                }
                return true;
            },
            filter: input => toKebabCase(input)
        },
        {
            type: 'list',
            name: 'guardType',
            message: 'Quel guard voulez-vous utiliser ?',
            choices: [
                { name: 'AuthGuard (pour les routes authentifiées)', value: 'AuthGuard' },
                { name: 'GuestGuard (pour les routes publiques)', value: 'GuestGuard' },
                { name: 'Aucun guard', value: null }
            ]
        }
    ]);

    const { moduleName, guardType } = answers;
    const modulePath = path.join(process.cwd(), 'src', 'app', 'features', moduleName);

    if (fs.existsSync(modulePath)) {
        console.error(`\n❌ Le module "${moduleName}" existe déjà.\n`);
        process.exit(1);
    }

    try {
        createPackageStructure(modulePath, moduleName);
        createRoutesFile(modulePath, moduleName, guardType);
        createModuleReadme(modulePath, moduleName, guardType);
        updateAppRoutes(moduleName);

        console.log(`✅ Package "${moduleName}" créé avec succès!\n`);
        console.log('📂 Structure créée:');
        console.log(`
    features/${moduleName}/
    ├── components/
    ├── views/
    ├── models/
    ├── routes.ts${guardType ? ` (protégé par ${guardType})` : ''}
    └── README.md
        `);

        console.log('💡 Prochaines étapes:');
        console.log(`   - Utilisez "npm run g:page" pour créer des pages dans ce module`);
        console.log(`   - Le module est accessible via: /${moduleName}\n`);

    } catch (error) {
        console.error('\n❌ Erreur lors de la création du package:', error.message);
        process.exit(1);
    }
}

process.on('uncaughtException', (error) => {
    console.error('\n❌ Erreur inattendue:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('\n❌ Promesse rejetée:', reason);
    process.exit(1);
});

createPackage();