#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';
import { toPascalCase, toKebabCase, isAngularProject, getAngularMajorVersion, setupErrorHandlers } from './utils.js';

setupErrorHandlers();

async function createPipe() {
    console.log('\n🔧 Angular CLI Helper - Création de pipe\n');

    if (!isAngularProject()) {
        console.error('❌ Erreur: Ce n\'est pas un projet Angular.');
        console.error('💡 Assurez-vous d\'être dans le dossier racine d\'un projet Angular.\n');
        process.exit(1);
    }

    try {
        const { pipeName } = await inquirer.prompt([
            {
                name: 'pipeName',
                message: 'Quel est le nom du pipe ?',
                validate: input => {
                    if (!input) return 'Le nom est requis.';
                    if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) return 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores.';
                    return true;
                }
            }
        ]);

        const folderPath = path.join(process.cwd(), 'src', 'app', 'shared', 'pipes');
        shelljs.mkdir('-p', folderPath);

        const kebabName = toKebabCase(pipeName);
        const className = `${toPascalCase(pipeName)}Pipe`;
        const angularVersion = getAngularMajorVersion();
        const standaloneFlag = angularVersion > 0 && angularVersion < 19 ? '\n  standalone: true,' : '';
        const tsFile = path.join(folderPath, `${kebabName}.pipe.ts`);
        const specFile = path.join(folderPath, `${kebabName}.pipe.spec.ts`);

        if (fs.existsSync(tsFile)) {
            console.error(`\n❌ Le pipe "${kebabName}" existe déjà dans shared/pipes/\n`);
            process.exit(1);
        }

        const tsContent = `import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: '${kebabName}',${standaloneFlag}
})
export class ${className} implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return value;
  }
}
`;

        const specContent = `import { ${className} } from './${kebabName}.pipe';

describe('${className}', () => {
  it('should create an instance', () => {
    const pipe = new ${className}();
    expect(pipe).toBeTruthy();
  });
});
`;

        fs.writeFileSync(tsFile, tsContent);
        fs.writeFileSync(specFile, specContent);

        console.log(`\n✅ Pipe "${pipeName}" créé avec succès!`);
        console.log(`📁 Emplacement: ${folderPath}`);
        console.log('\n📂 Fichiers créés:');
        console.log(`   ├── ${kebabName}.pipe.ts`);
        console.log(`   └── ${kebabName}.pipe.spec.ts\n`);

    } catch (error) {
        if (error.isTtyError) {
            console.error('❌ Erreur: Terminal non interactif.');
        } else {
            console.error('❌ Une erreur est survenue:', error.message);
        }
        process.exit(1);
    }
}

createPipe();
