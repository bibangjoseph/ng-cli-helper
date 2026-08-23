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

        let modified = false;

        if (!tsconfig.compilerOptions.paths['@/*'] || tsconfig.compilerOptions.paths['@/*'][0] === 'src/app/*') {
            tsconfig.compilerOptions.paths['@/*'] = ['./src/app/*'];
            modified = true;
        }

        if (tsconfig.compilerOptions.baseUrl) {
            delete tsconfig.compilerOptions.baseUrl;
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
            console.log('✅ tsconfig.json mis à jour (alias @/* ajouté et baseUrl nettoyé).');
        } else {
            console.log('ℹ️  tsconfig.json déjà configuré.');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de tsconfig.json:', error.message);
    }
}
