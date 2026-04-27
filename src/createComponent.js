#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { formatFolderName, toPascalCase, isAngularProject, getAvailableModules, getAngularMajorVersion, setupErrorHandlers } from './utils.js';

setupErrorHandlers();

async function createComponent() {
    console.log('\n🧩 Angular CLI Helper - Création de composant\n');

    if (!isAngularProject()) {
        console.error('❌ Erreur: Ce n\'est pas un projet Angular.');
        console.error('💡 Assurez-vous d\'être dans le dossier racine d\'un projet Angular.\n');
        process.exit(1);
    }

    try {
        const modules = getAvailableModules();

        const { componentName, isGlobal, moduleName } = await inquirer.prompt([
            {
                name: 'componentName',
                message: 'Nom du composant :',
                validate: input => {
                    if (!input) return 'Le nom est requis.';
                    if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                    return true;
                }
            },
            {
                type: 'confirm',
                name: 'isGlobal',
                message: 'Est-ce un composant global (shared) ?',
                default: false
            },
            {
                type: 'list',
                name: 'moduleName',
                message: 'Dans quel module ?',
                choices: modules,
                when: answers => !answers.isGlobal
            }
        ]);

        const folderName = formatFolderName(componentName);
        const basePath = isGlobal
            ? path.join(process.cwd(), 'src', 'app', 'shared', 'components', folderName)
            : path.join(process.cwd(), 'src', 'app', 'features', moduleName, 'components', folderName);

        if (fs.existsSync(basePath)) {
            console.error(`\n❌ Le composant "${folderName}" existe déjà.\n`);
            process.exit(1);
        }

        shelljs.mkdir('-p', basePath);

        const className = `${toPascalCase(componentName)}Component`;
        const selector = `app-${folderName}`;
        const angularVersion = getAngularMajorVersion();
        const standaloneFlag = angularVersion > 0 && angularVersion < 19 ? '\n  standalone: true,' : '';

        const tsContent = `import { Component } from '@angular/core';

@Component({
  selector: '${selector}',${standaloneFlag}
  imports: [],
  templateUrl: './${folderName}.component.html',
  styleUrls: ['./${folderName}.component.scss']
})
export class ${className} {}
`;

        const specContent = `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ${className} } from './${folderName}.component';

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

        fs.writeFileSync(path.join(basePath, `${folderName}.component.ts`), tsContent);
        fs.writeFileSync(path.join(basePath, `${folderName}.component.html`), `<p>${selector} works!</p>`);
        fs.writeFileSync(path.join(basePath, `${folderName}.component.scss`), '');
        fs.writeFileSync(path.join(basePath, `${folderName}.component.spec.ts`), specContent);

        console.log(`\n✅ Composant "${componentName}" créé avec succès!`);
        console.log(`📁 Emplacement: ${basePath}`);
        console.log('\n📂 Fichiers créés:');
        console.log(`   ├── ${folderName}.component.ts`);
        console.log(`   ├── ${folderName}.component.html`);
        console.log(`   ├── ${folderName}.component.scss`);
        console.log(`   └── ${folderName}.component.spec.ts\n`);

    } catch (error) {
        if (error.isTtyError) {
            console.error('❌ Erreur: Terminal non interactif.');
        } else {
            console.error('❌ Une erreur est survenue:', error.message);
        }
        process.exit(1);
    }
}

createComponent();
