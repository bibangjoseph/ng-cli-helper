import fs from 'fs';
import path from 'path';

/**
 * Crée l'interceptor HTTP
 */
export function createHttpInterceptor(basePath) {
    console.log('🔌 Création de l\'interceptor HTTP...');

    const interceptorsPath = path.join(basePath, 'core', 'interceptors');
    const interceptorPath = path.join(interceptorsPath, 'http.interceptor.ts');

    if (fs.existsSync(interceptorPath)) {
        console.log('ℹ️  Le fichier http.interceptor.ts existe déjà.');
        return;
    }

    const interceptorContent = `import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CoreService } from '../services/core.service';

// HttpRequestInterceptor to inject the token in the header of the request
export function HttpInterceptor(request: HttpRequest<any>, next: HttpHandlerFn) {
  const coreService = inject(CoreService);
  const token = coreService.getToken;
  const isAuth = coreService.isAuthenticated();
  const apiRegex = new RegExp(\`^\${environment.apiUrl}\`);

  if (apiRegex.test(request.url)) {
    if (isAuth && token) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: \`Bearer \${token}\`,
        },
      });
      return next(authReq);
    }
  }

  return next(request);
}
`;

    fs.writeFileSync(interceptorPath, interceptorContent);
    console.log('✅ Créé: core/interceptors/http.interceptor.ts');
}
