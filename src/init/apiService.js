import fs from 'fs';
import path from 'path';

/**
 * Crée le service API
 */
export function createApiService(basePath) {
    console.log('⚡ Création du service API...');

    const servicesPath = path.join(basePath, 'core', 'services');
    const apiServicePath = path.join(servicesPath, 'api.service.ts');

    if (fs.existsSync(apiServicePath)) {
        console.log('ℹ️  Le fichier api.service.ts existe déjà.');
        return;
    }

    const apiServiceContent = `import { computed, inject, Injectable, signal, ResourceRef } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
// @ts-ignore: Assuming httpResource is available in Angular 22
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { CoreService } from '@/core/services/core.service';

export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  reportProgress?: boolean;
  observe?: 'body';
  withCredentials?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private coreService = inject(CoreService);

  private readonly apiUrl = environment.apiUrl;
  private readonly debugMode = !environment.production;

  private _backendErrors = signal<Record<string, string[]>>({});
  public readonly backendErrors = computed(() => this._backendErrors());

  private _activeRequests = signal<number>(0);
  public readonly loading = computed(() => this._activeRequests() > 0);

  clearBackendErrors(): void {
    this._backendErrors.set({});
  }

  clearFieldError(fieldName: string): void {
    const errors = { ...this._backendErrors() };
    delete errors[fieldName];
    this._backendErrors.set(errors);
  }

  /**
   * Effectue une requête GET via httpResource() (Angular 22+)
   * @param url Chemin de l'API
   * @param options Options pour la ressource
   * @returns ResourceRef gérant isLoading, value, error
   */
  getResource<T>(url: string, options?: any): any /* ResourceRef<T> */ {
    return httpResource<T>(this.apiUrl + url, options);
  }

  get<T>(url: string, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    return this.http.get<T>(this.apiUrl + url, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[GET] \${url}\`, data); }
      }),
      catchError(error => this.handleError(error, 'GET', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  post<T>(url: string, data: any, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    this.clearBackendErrors();
    return this.http.post<T>(this.apiUrl + url, data, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[POST] \${url}\`, { request: data, response: data }); }
      }),
      catchError(error => this.handleError(error, 'POST', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  put<T>(url: string, data: any, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    this.clearBackendErrors();
    return this.http.put<T>(this.apiUrl + url, data, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[PUT] \${url}\`, { request: data, response: data }); }
      }),
      catchError(error => this.handleError(error, 'PUT', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  patch<T>(url: string, data: any, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    this.clearBackendErrors();
    return this.http.patch<T>(this.apiUrl + url, data, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[PATCH] \${url}\`, { request: data, response: data }); }
      }),
      catchError(error => this.handleError(error, 'PATCH', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  delete<T>(url: string, options?: ApiRequestOptions): Observable<T> {
    this._activeRequests.update(n => n + 1);
    return this.http.delete<T>(this.apiUrl + url, options).pipe(
      tap(data => {
        if (this.debugMode) { console.log(\`[DELETE] \${url}\`, data); }
      }),
      catchError(error => this.handleError(error, 'DELETE', url)),
      finalize(() => this._activeRequests.update(n => Math.max(0, n - 1)))
    );
  }

  private handleError(error: HttpErrorResponse, method: string, url: string): Observable<never> {
    if (this.debugMode) {
      console.error(\`[ERROR \${method}] \${url}\`, error);
    }

    switch (error.status) {
      case 0:
        console.error('Connexion au serveur impossible. Vérifiez votre connexion internet.');
        break;
      case 401:
        console.warn('Session expirée. Redirection vers la page de connexion...');
        this.coreService.logout();
        this.router.navigate(['/']);
        break;
      case 422:
        this._backendErrors.set(error.error?.errors || {});
        if (this.debugMode) { console.log('Erreurs de validation:', this._backendErrors()); }
        break;
      default:
        console.error(error.error?.message || 'Une erreur est survenue.');
    }

    return throwError(() => error);
  }
}
`;

    fs.writeFileSync(apiServicePath, apiServiceContent);
    console.log('✅ Créé: core/services/api.service.ts');
}
