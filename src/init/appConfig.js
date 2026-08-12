import fs from 'fs';
import path from 'path';

/**
 * Crée ou met à jour app.config.ts
 */
export function createAppConfig(basePath) {
    console.log('⚙️  Mise à jour de app.config.ts...');

    const configPath = path.join(basePath, 'app.config.ts');

    // Si le fichier n'existe pas, créer un fichier minimal
    if (!fs.existsSync(configPath)) {
        const configContent = `import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { HttpInterceptor } from './core/interceptors/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([HttpInterceptor])
    )
  ]
};
`;
        fs.writeFileSync(configPath, configContent);
        console.log('✅ Créé: app.config.ts');
        return;
    }

    // Overwrite the file to ensure Zoneless and withComponentInputBinding are present
    const configContent = `import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { HttpInterceptor } from './core/interceptors/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([HttpInterceptor])
    )
  ]
};
`;
    fs.writeFileSync(configPath, configContent);
    console.log('✅ app.config.ts mis à jour (Zoneless, Router, HttpClient).');
}
