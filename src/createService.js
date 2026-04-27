#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { toPascalCase, toKebabCase, isAngularProject, setupErrorHandlers } from './utils.js';

setupErrorHandlers();

async function createService() {
    console.log('\n⚡ Angular CLI Helper - Création de service\n');

    if (!isAngularProject()) {
        console.error('❌ Erreur: Ce n\'est pas un projet Angular.');
        console.error('💡 Assurez-vous d\'être dans le dossier racine d\'un projet Angular.\n');
        process.exit(1);
    }

    try {
        const { serviceName } = await inquirer.prompt([
            {
                name: 'serviceName',
                message: 'Quel est le nom du service ?',
                validate: input => {
                    if (!input) return 'Le nom est requis.';
                    if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                    return true;
                }
            }
        ]);

        const targetPath = path.join(process.cwd(), 'src', 'app', 'core', 'services');
        shelljs.mkdir('-p', targetPath);

        const kebabName = toKebabCase(serviceName);
        const className = `${toPascalCase(serviceName)}Service`;
        const tsFile = path.join(targetPath, `${kebabName}.service.ts`);
        const specFile = path.join(targetPath, `${kebabName}.service.spec.ts`);

        if (fs.existsSync(tsFile)) {
            console.error(`\n❌ Le service "${kebabName}" existe déjà dans core/services/\n`);
            process.exit(1);
        }

        const tsContent = `import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ${className} {}
`;

        const specContent = `import { TestBed } from '@angular/core/testing';
import { ${className} } from './${kebabName}.service';

describe('${className}', () => {
  let service: ${className};

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(${className});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
`;

        fs.writeFileSync(tsFile, tsContent);
        fs.writeFileSync(specFile, specContent);

        console.log(`\n✅ Service "${serviceName}" créé avec succès!`);
        console.log(`📁 Emplacement: ${targetPath}`);
        console.log('\n📂 Fichiers créés:');
        console.log(`   ├── ${kebabName}.service.ts`);
        console.log(`   └── ${kebabName}.service.spec.ts\n`);

    } catch (error) {
        if (error.isTtyError) {
            console.error('❌ Erreur: Terminal non interactif.');
        } else {
            console.error('❌ Une erreur est survenue:', error.message);
        }
        process.exit(1);
    }
}

createService();
