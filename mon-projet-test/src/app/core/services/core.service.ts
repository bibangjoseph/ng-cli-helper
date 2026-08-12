import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  // Ajoutez d'autres propriétés selon vos besoins
}

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  // Signal pour l'utilisateur actuel
  private _currentUser = signal<User | null>(null);
  public readonly currentUser = computed(() => this._currentUser());

  // Signal pour le token
  private _token = signal<string | null>(null);
  public readonly token = computed(() => this._token());

  // Computed pour vérifier si l'utilisateur est authentifié
  public readonly isAuthenticated = computed(() => !!this._token());

  // Getter pour le token (pour l'interceptor)
  public get getToken(): string | null {
    return this._token();
  }

  constructor() {
    // Charger le token depuis le localStorage au démarrage
    this.loadTokenFromStorage();
  }

  /**
   * Charge le token depuis le localStorage
   */
  private loadTokenFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    
    if (token) {
      this._token.set(token);
    }
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this._currentUser.set(user);
      } catch (e) {
        console.error('Erreur lors du parsing du user:', e);
      }
    }
  }

  /**
   * Définit le token d'authentification
   */
  setToken(token: string): void {
    this._token.set(token);
    localStorage.setItem('auth_token', token);
  }

  /**
   * Définit l'utilisateur actuel
   */
  setCurrentUser(user: User): void {
    this._currentUser.set(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    // Implémentez votre logique de vérification des rôles ici
    // Par exemple: return this.currentUser()?.roles?.includes(role) ?? false;
    return false;
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  hasPermission(permission: string): boolean {
    // Implémentez votre logique de vérification des permissions ici
    return false;
  }
}
