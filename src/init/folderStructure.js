import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

export function createFolderStructure(basePath) {
    const folders = {
        core: ['services', 'guards', 'interceptors', 'config'],
        shared: ['components', 'directives', 'pipes'],
        layout: ['main-layout'],
        features: []
    };

    for (const [parent, children] of Object.entries(folders)) {
        const parentPath = path.join(basePath, parent);

        if (!fs.existsSync(parentPath)) {
            shelljs.mkdir('-p', parentPath);
            console.log(`📁 Créé: app/${parent}/`);
        } else {
            console.log(`ℹ️  Existe déjà: app/${parent}/`);
        }

        if (children.length > 0) {
            children.forEach(child => {
                const childPath = path.join(parentPath, child);
                if (!fs.existsSync(childPath)) {
                    shelljs.mkdir('-p', childPath);
                    console.log(`📁 Créé: app/${parent}/${child}/`);
                } else {
                    console.log(`ℹ️  Existe déjà: app/${parent}/${child}/`);
                }
            });
        }
    }

    // Crée des fichiers .gitkeep pour les dossiers vides
    createGitkeepFiles(basePath);
}

/**
 * Crée des fichiers .gitkeep dans les dossiers vides
 */
export function createGitkeepFiles(basePath) {
    const emptyFolders = [
        'shared/components',
        'shared/directives',
        'shared/pipes'
    ];

    emptyFolders.forEach(folder => {
        const gitkeepPath = path.join(basePath, folder, '.gitkeep');
        if (!fs.existsSync(gitkeepPath)) {
            fs.writeFileSync(gitkeepPath, '');
        }
    });
}
