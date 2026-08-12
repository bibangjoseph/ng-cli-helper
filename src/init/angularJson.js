import fs from 'fs';
import path from 'path';

/**
 * Met à jour angular.json
 */
export function updateAngularJson() {
    console.log('⚙️  Mise à jour de angular.json...');

    const angularJsonPath = path.join(process.cwd(), 'angular.json');

    if (!fs.existsSync(angularJsonPath)) {
        console.warn('⚠️  Fichier angular.json introuvable.');
        return;
    }

    try {
        const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
        const projectName = Object.keys(angularJson.projects)[0];

        if (!projectName) {
            console.warn('⚠️  Aucun projet trouvé dans angular.json.');
            return;
        }

        const project = angularJson.projects[projectName];

        if (!project.architect || !project.architect.build) {
            console.warn('⚠️  Configuration build introuvable.');
            return;
        }

        const buildConfig = project.architect.build;

        if (!buildConfig.configurations) {
            buildConfig.configurations = {};
        }

        if (!buildConfig.configurations.production) {
            buildConfig.configurations.production = {};
        }

        buildConfig.configurations.production.fileReplacements = [
            {
                replace: 'src/environments/environment.ts',
                with: 'src/environments/environment.prod.ts'
            }
        ];

        if (!buildConfig.configurations.production.optimization) {
            buildConfig.configurations.production.optimization = true;
        }
        if (!buildConfig.configurations.production.outputHashing) {
            buildConfig.configurations.production.outputHashing = 'all';
        }
        if (!buildConfig.configurations.production.sourceMap) {
            buildConfig.configurations.production.sourceMap = false;
        }

        if (!buildConfig.configurations.development) {
            buildConfig.configurations.development = {
                optimization: false,
                extractLicenses: false,
                sourceMap: true,
                namedChunks: true
            };
        }

        if (project.architect.serve && !project.architect.serve.defaultConfiguration) {
            project.architect.serve.defaultConfiguration = 'development';
        }

        // Configuration des Schematics pour imposer les suffixes de type
        angularJson.schematics = angularJson.schematics || {};
        const schematics = ['component', 'service', 'directive', 'pipe', 'guard'];
        schematics.forEach(type => {
            const key = `@schematics/angular:${type}`;
            angularJson.schematics[key] = angularJson.schematics[key] || {};
            if (type !== 'guard') {
                angularJson.schematics[key].type = type;
            }
        });

        fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
        console.log('✅ angular.json mis à jour.');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de angular.json:', error.message);
    }
}
