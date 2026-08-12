import fs from 'fs';
import path from 'path';

/**
 * Crée les guards
 */
export function createGuards(basePath) {
    console.log('🛡️  Création des guards...');

    const guardsPath = path.join(basePath, 'core', 'guards');

    // AuthGuard
    const authGuardPath = path.join(guardsPath, 'auth.guard.ts');
    if (!fs.existsSync(authGuardPath)) {
        const authGuardContent = `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CoreService } from '../services/core.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const coreService = inject(CoreService);
  const router = inject(Router);

  if (!coreService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
`;
        fs.writeFileSync(authGuardPath, authGuardContent);
        console.log('✅ Créé: core/guards/auth.guard.ts');
    } else {
        console.log('ℹ️  Existe déjà: core/guards/auth.guard.ts');
    }

    // GuestGuard
    const guestGuardPath = path.join(guardsPath, 'guest.guard.ts');
    if (!fs.existsSync(guestGuardPath)) {
        const guestGuardContent = `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CoreService } from '../services/core.service';

export const GuestGuard: CanActivateFn = (route, state) => {
  const coreService = inject(CoreService);
  const router = inject(Router);

  if (coreService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
`;
        fs.writeFileSync(guestGuardPath, guestGuardContent);
        console.log('✅ Créé: core/guards/guest.guard.ts');
    } else {
        console.log('ℹ️  Existe déjà: core/guards/guest.guard.ts');
    }
}
