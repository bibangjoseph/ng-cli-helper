#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { toPascalCase, toKebabCase, isAngularProject, setupErrorHandlers } from './utils.js';

setupErrorHandlers();

async function createGuard() {
    console.log('\n🛡️  Angular CLI Helper - Création de guard\n');

    if (!isAngularProject()) {
        console.error('❌ Erreur: Ce n\'est pas un projet Angular.');
        console.error('💡 Assurez-vous d\'être dans le dossier racine d\'un projet Angular.\n');
        process.exit(1);
    }

    try {
        const { guardName } = await inquirer.prompt([
            {
                name: 'guardName',
                message: 'Quel est le nom du guard ?',
                validate: input => {
                    if (!input) return 'Le nom est requis.';
                    if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                    return true;
                }
            }
        ]);

        const folderPath = path.join(process.cwd(), 'src', 'app', 'core', 'guards');
        shelljs.mkdir('-p', folderPath);

        const kebabName = toKebabCase(guardName);
        const className = `${toPascalCase(guardName)}Guard`;
        const tsFile = path.join(folderPath, `${kebabName}.guard.ts`);
        const specFile = path.join(folderPath, `${kebabName}.guard.spec.ts`);

        if (fs.existsSync(tsFile)) {
            console.error(`\n❌ Le guard "${kebabName}" existe déjà dans core/guards/\n`);
            process.exit(1);
        }

        const tsContent = `import { CanActivateFn } from '@angular/router';

export const ${className}: CanActivateFn = (route, state) => {
  return true;
};
`;

        const specContent = `import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { ${className} } from './${kebabName}.guard';

describe('${className}', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => ${className}(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
`;

        fs.writeFileSync(tsFile, tsContent);
        fs.writeFileSync(specFile, specContent);

        console.log(`\n✅ Guard "${guardName}" créé avec succès!`);
        console.log(`📁 Emplacement: ${folderPath}`);
        console.log('\n📂 Fichiers créés:');
        console.log(`   ├── ${kebabName}.guard.ts`);
        console.log(`   └── ${kebabName}.guard.spec.ts\n`);

    } catch (error) {
        if (error.isTtyError) {
            console.error('❌ Erreur: Terminal non interactif.');
        } else {
            console.error('❌ Une erreur est survenue:', error.message);
        }
        process.exit(1);
    }
}

createGuard();
