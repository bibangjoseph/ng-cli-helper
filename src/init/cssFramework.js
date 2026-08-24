import fs from 'fs';
import path from 'path';
import shelljs from 'shelljs';

export function cleanCssTraces(frameworkToRemove) {
    const cleanEnv = { ...process.env };
    Object.keys(cleanEnv).forEach(key => {
        if (key.toLowerCase().startsWith('npm_config_')) {
            delete cleanEnv[key];
        }
    });

    const scssPath = path.join(process.cwd(), 'src', 'styles.scss');
    const cssPath = path.join(process.cwd(), 'src', 'styles.css');
    const styleFile = fs.existsSync(scssPath) ? scssPath : (fs.existsSync(cssPath) ? cssPath : null);

    if (frameworkToRemove === 'tailwind') {
        console.log('🧹 Nettoyage des traces de Tailwind CSS...');
        shelljs.exec('npm uninstall tailwindcss @tailwindcss/postcss postcss autoprefixer remixicon', { silent: true, env: cleanEnv });

        if (styleFile) {
            let content = fs.readFileSync(styleFile, 'utf8');
            content = content.replace(/@import\s+['"]tailwindcss['"];?\n?/g, '');
            content = content.replace(/@tailwind\s+(base|components|utilities);?\n?/g, '');
            fs.writeFileSync(styleFile, content);
        }

        const angularJsonPath = path.join(process.cwd(), 'angular.json');
        if (fs.existsSync(angularJsonPath)) {
            try {
                const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
                const projectName = Object.keys(angularJson.projects)[0];
                const architect = angularJson.projects[projectName].architect;

                if (architect && architect.build && architect.build.options) {
                    if (architect.build.options.styles) {
                        architect.build.options.styles = architect.build.options.styles.filter(style =>
                            !style.includes('remixicon')
                        );
                    }
                    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
                }
            } catch (e) {
                // Ignore
            }
        }
    } else if (frameworkToRemove === 'bootstrap') {
        console.log('🧹 Nettoyage des traces de Bootstrap...');
        shelljs.exec('npm uninstall bootstrap bootstrap-icons', { silent: true, env: cleanEnv });

        if (styleFile) {
            let content = fs.readFileSync(styleFile, 'utf8');
            content = content.replace(/@import\s+['"]bootstrap\/scss\/bootstrap['"];?\n?/g, '');
            content = content.replace(/@import\s+['"]bootstrap\/dist\/css\/bootstrap\.min\.css['"];?\n?/g, '');
            fs.writeFileSync(styleFile, content);
        }

        const angularJsonPath = path.join(process.cwd(), 'angular.json');
        if (fs.existsSync(angularJsonPath)) {
            try {
                const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
                const projectName = Object.keys(angularJson.projects)[0];
                const architect = angularJson.projects[projectName].architect;

                if (architect && architect.build && architect.build.options) {
                    if (architect.build.options.scripts) {
                        architect.build.options.scripts = architect.build.options.scripts.filter(script =>
                            !script.includes('bootstrap')
                        );
                    }
                    if (architect.build.options.styles) {
                        architect.build.options.styles = architect.build.options.styles.filter(style =>
                            !style.includes('bootstrap')
                        );
                    }
                    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
                }
            } catch (e) {
                // Silently ignore if angular.json cannot be parsed during cleanup
            }
        }
    }
}

export function configureCssFramework(framework) {
    const cleanEnv = { ...process.env };
    Object.keys(cleanEnv).forEach(key => {
        if (key.toLowerCase().startsWith('npm_config_')) {
            delete cleanEnv[key];
        }
    });

    if (framework === 'bootstrap') {
        cleanCssTraces('tailwind');
        console.log('\n🎨 Configuration de Bootstrap et Bootstrap Icons...');
        const result = shelljs.exec('npm install bootstrap bootstrap-icons', { silent: false, env: cleanEnv });
        
        if (result.code !== 0) {
            console.error("\\n❌ Échec de l'installation de Bootstrap et Bootstrap Icons. Les fichiers d'import n'ont pas été ajoutés.");
            return;
        }

        // On injecte les fichiers CSS et JS de Bootstrap dans angular.json
        const angularJsonPath = path.join(process.cwd(), 'angular.json');
        if (fs.existsSync(angularJsonPath)) {
            try {
                const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
                const projectName = Object.keys(angularJson.projects)[0];
                const architect = angularJson.projects[projectName].architect;

                if (architect && architect.build && architect.build.options) {
                    // Ajout du CSS
                    architect.build.options.styles = architect.build.options.styles || [];
                    // Nettoyage de l'ancienne erreur (node_modules/ préfixé)
                    architect.build.options.styles = architect.build.options.styles.filter(s => !s.startsWith('node_modules/bootstrap'));
                    if (!architect.build.options.styles.includes('bootstrap/dist/css/bootstrap.min.css')) {
                        architect.build.options.styles.unshift('bootstrap/dist/css/bootstrap.min.css');
                    }
                    if (!architect.build.options.styles.includes('bootstrap-icons/font/bootstrap-icons.css')) {
                        architect.build.options.styles.unshift('bootstrap-icons/font/bootstrap-icons.css');
                    }

                    // Ajout du JS
                    architect.build.options.scripts = architect.build.options.scripts || [];
                    // Nettoyage de l'ancienne erreur (node_modules/ préfixé)
                    architect.build.options.scripts = architect.build.options.scripts.filter(s => !s.startsWith('node_modules/bootstrap'));
                    if (!architect.build.options.scripts.includes('bootstrap/dist/js/bootstrap.bundle.min.js')) {
                        architect.build.options.scripts.push('bootstrap/dist/js/bootstrap.bundle.min.js');
                    }

                    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
                    console.log('✅ angular.json mis à jour avec les assets (CSS et JS) Bootstrap.');
                }
            } catch (e) {
                console.error('❌ Erreur lors de la configuration Bootstrap dans angular.json:', e.message);
            }
        }
    } else if (framework === 'tailwind') {
        cleanCssTraces('bootstrap');
        console.log('\n🎨 Configuration de Tailwind CSS...');
        const result = shelljs.exec('npx ng add tailwindcss --skip-confirmation', { silent: false, env: cleanEnv });
        
        if (result.code !== 0) {
            console.error("\\n❌ Échec de l'installation de Tailwind CSS.");
            return;
        }

        console.log('\n🎨 Installation de Remix Icon pour Tailwind...');
        shelljs.exec('npm install remixicon', { silent: false, env: cleanEnv });
        
        const angularJsonPath = path.join(process.cwd(), 'angular.json');
        if (fs.existsSync(angularJsonPath)) {
            try {
                const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
                const projectName = Object.keys(angularJson.projects)[0];
                const architect = angularJson.projects[projectName].architect;

                if (architect && architect.build && architect.build.options) {
                    architect.build.options.styles = architect.build.options.styles || [];
                    if (!architect.build.options.styles.includes('remixicon/fonts/remixicon.css')) {
                        architect.build.options.styles.unshift('remixicon/fonts/remixicon.css');
                    }
                    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));
                    console.log('✅ angular.json mis à jour avec Remix Icon.');
                }
            } catch (e) {
                console.error('❌ Erreur lors de la configuration Remix Icon dans angular.json:', e.message);
            }
        }

        console.log('✅ Tailwind CSS et Remix Icon installés et configurés.');
    } else if (framework === 'custom') {
        cleanCssTraces('tailwind');
        cleanCssTraces('bootstrap');
        console.log('\n🎨 Configuration du CSS Custom (Reset de base)...');
        const scssPath = path.join(process.cwd(), 'src', 'styles.scss');
        const cssPath = path.join(process.cwd(), 'src', 'styles.css');
        const styleFile = fs.existsSync(scssPath) ? scssPath : (fs.existsSync(cssPath) ? cssPath : null);

        if (styleFile) {
            const customReset = `/* Global Reset & Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
}
`;
            let content = fs.readFileSync(styleFile, 'utf8');
            if (!content.includes('box-sizing')) {
                fs.writeFileSync(styleFile, customReset + '\n' + content);
                console.log('✅ Fichier styles mis à jour avec le reset CSS custom.');
            }
        }
    }
}
