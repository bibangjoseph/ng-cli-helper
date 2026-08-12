import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

/**
 * Crée les fichiers d'environnement
 */
export function createEnvironmentFiles() {
    console.log('🌐 Création des fichiers d\'environnement...');

    const environmentsPath = path.join(process.cwd(), 'src', 'environments');

    if (!fs.existsSync(environmentsPath)) {
        shelljs.mkdir('-p', environmentsPath);
        console.log('📁 Créé: src/environments/');
    }

    const environmentLocalPath = path.join(environmentsPath, 'environment.ts');
    const environmentLocalContent = `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // Ajoutez vos variables d'environnement ici
};
`;

    const environmentProdPath = path.join(environmentsPath, 'environment.prod.ts');
    const environmentProdContent = `export const environment = {
  production: true,
  apiUrl: 'https://api.votredomaine.com/api',
  // Ajoutez vos variables d'environnement ici
};
`;

    if (!fs.existsSync(environmentLocalPath)) {
        fs.writeFileSync(environmentLocalPath, environmentLocalContent);
        console.log('✅ Créé: environments/environment.ts');
    } else {
        console.log('ℹ️  Existe déjà: environments/environment.ts');
    }

    if (!fs.existsSync(environmentProdPath)) {
        fs.writeFileSync(environmentProdPath, environmentProdContent);
        console.log('✅ Créé: environments/environment.prod.ts');
    } else {
        console.log('ℹ️  Existe déjà: environments/environment.prod.ts');
    }
}
