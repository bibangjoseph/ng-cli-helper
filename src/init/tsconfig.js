import fs from 'fs';
import path from 'path';

/**
 * Met à jour tsconfig.json pour ajouter l'alias @/* vers src/app/*
 */
export function updateTsConfig() {
    console.log('⚙️  Mise à jour de tsconfig.json (alias @)...');

    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

    if (!fs.existsSync(tsconfigPath)) {
        console.warn('⚠️  Fichier tsconfig.json introuvable.');
        return;
    }

    try {
        const tsconfigRaw = fs.readFileSync(tsconfigPath, 'utf8');
        const tsconfigCleaned = tsconfigRaw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
        const tsconfig = JSON.parse(tsconfigCleaned);

        if (!tsconfig.compilerOptions) {
            tsconfig.compilerOptions = {};
        }

        if (!tsconfig.compilerOptions.paths) {
            tsconfig.compilerOptions.paths = {};
        }

        if (tsconfig.compilerOptions.paths['@/*']) {
            console.log('ℹ️  Alias "@/*" déjà configuré dans tsconfig.json.');
            return;
        }

        tsconfig.compilerOptions.baseUrl = './';
        tsconfig.compilerOptions.paths['@/*'] = ['src/app/*'];

        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
        console.log('✅ tsconfig.json mis à jour (alias @/* vers src/app/*).');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de tsconfig.json:', error.message);
    }
}
