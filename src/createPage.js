#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { formatFolderName, toPascalCase, toKebabCase, toConstantCase, getAvailableModules, getAngularMajorVersion, setupErrorHandlers } from './utils.js';

setupErrorHandlers();

/**
 * Met à jour le fichier routes.ts du module avec la nouvelle page (lazy loading)
 */
function updateModuleRoutes(modulePath, moduleName, folderName, className, pageName) {
    const routesPath = path.join(modulePath, 'routes.ts');

    if (!fs.existsSync(routesPath)) {
        console.log('⚠️  Fichier routes.ts introuvable, création...');
        createRoutesFile(routesPath, moduleName);
    }

    try {
        let content = fs.readFileSync(routesPath, 'utf8');

        const routePath = toKebabCase(folderName);

        // Vérifier si la route existe déjà
        if (content.includes(`path: '${routePath}'`) && content.includes(folderName)) {
            console.log(`ℹ️  La route "${routePath}" existe déjà dans routes.ts`);
            return;
        }

        const newRoute = `            {
                path: '${routePath}',
                title: '${toPascalCase(pageName)}',
                loadComponent: () => import('./views/${folderName}/${folderName}.page').then(m => m.${className})
            }`;

        // Trouver le tableau children
        const childrenMatch = content.match(/(children:\s*\[)([\s\S]*?)(\n\s*\])/);

        if (!childrenMatch) {
            console.error('❌ Format du fichier routes.ts non reconnu (propriété "children" introuvable).');
            return;
        }

        const before = childrenMatch[1];
        const existing = childrenMatch[2];
        const closing = childrenMatch[3];

        const trimmed = existing.trim();
        let newContent;

        if (!trimmed) {
            // Tableau vide
            newContent = before + '\n' + newRoute + '\n        ' + closing.trimStart();
        } else {
            // Ajouter une virgule à la dernière entrée si absente, puis insérer
            const withComma = trimmed.endsWith(',') ? existing : existing.replace(/(\s*)$/, ',$1');
            newContent = before + withComma + '\n' + newRoute + closing;
        }

        content = content.replace(childrenMatch[0], newContent);
        fs.writeFileSync(routesPath, content);
        console.log(`✅ Route "${routePath}" ajoutée à ${moduleName}/routes.ts`);

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de routes.ts:', error.message);
        console.error(error.stack);
    }
}

/**
 * Crée le fichier routes.ts s'il n'existe pas
 */
function createRoutesFile(routesPath, moduleName) {
    const constantName = toConstantCase(moduleName);
    const content = `import { Routes } from '@angular/router';

export const ${constantName}_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../../layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
        ]
    }
];
`;
    fs.writeFileSync(routesPath, content);
    console.log(`✅ Fichier routes.ts créé dans ${moduleName}/`);
}

async function createPage() {
    console.log('\n🚀 Angular CLI Helper - Création de page\n');

    const modules = getAvailableModules();

    if (modules.length === 0) {
        console.error('❌ Aucun module trouvé dans src/app/features.');
        console.log('💡 Créez d\'abord un module avec: npm run g:package\n');
        process.exit(1);
    }

    const { pageName, moduleName } = await inquirer.prompt([
        {
            name: 'pageName',
            message: 'Quel est le nom de la page ?',
            validate: input => {
                if (!input) return 'Le nom de la page est requis.';
                if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) {
                    return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                }
                return true;
            }
        },
        {
            type: 'list',
            name: 'moduleName',
            message: 'Dans quel module ?',
            choices: modules
        }
    ]);

    const folderName = formatFolderName(pageName);
    const modulePath = path.join(process.cwd(), 'src', 'app', 'features', moduleName);
    const basePath = path.join(modulePath, 'views', folderName);

    if (fs.existsSync(basePath)) {
        console.error(`\n❌ La page "${folderName}" existe déjà dans ${moduleName}/views/\n`);
        process.exit(1);
    }

    try {
        shelljs.mkdir('-p', basePath);

        const selector = `app-${folderName}`;
        const className = `${toPascalCase(pageName)}Page`;
        const angularVersion = getAngularMajorVersion();
        const standaloneFlag = angularVersion > 0 && angularVersion < 19 ? '\n  standalone: true,' : '';
        const tsFile = path.join(basePath, `${folderName}.page.ts`);
        const htmlFile = path.join(basePath, `${folderName}.page.html`);
        const scssFile = path.join(basePath, `${folderName}.page.scss`);
        const specFile = path.join(basePath, `${folderName}.page.spec.ts`);

        const tsContent = `import { Component, inject } from '@angular/core';
import { ApiService } from '@/core/services/api.service';

@Component({
  selector: '${selector}',${standaloneFlag}
  imports: [],
  templateUrl: './${folderName}.page.html',
  styleUrl: './${folderName}.page.scss'
})
export class ${className} {
  private apiService = inject(ApiService);
}
`;
        const specContent = `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ${className} } from './${folderName}.page';

describe('${className}', () => {
  let component: ${className};
  let fixture: ComponentFixture<${className}>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [${className}]
    }).compileComponents();

    fixture = TestBed.createComponent(${className});
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`;

        fs.writeFileSync(tsFile, tsContent);
        fs.writeFileSync(htmlFile, `<p>${selector} works!</p>\n`);
        fs.writeFileSync(scssFile, '');
        fs.writeFileSync(specFile, specContent);

        console.log(`\n✅ Page "${pageName}" créée avec succès!`);
        console.log(`📁 Emplacement: ${basePath}`);

        updateModuleRoutes(modulePath, moduleName, folderName, className, pageName);

        console.log('\n📂 Fichiers créés:');
        console.log(`   ├── ${folderName}.page.ts`);
        console.log(`   ├── ${folderName}.page.html`);
        console.log(`   ├── ${folderName}.page.scss`);
        console.log(`   └── ${folderName}.page.spec.ts`);
        console.log(`\n💡 Accessible via: /${toKebabCase(moduleName)}/${toKebabCase(folderName)}\n`);

    } catch (error) {
        console.error('\n❌ Erreur lors de la création de la page:', error.message);
        process.exit(1);
    }
}

createPage();
