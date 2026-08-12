import { inject } from '@angular/core';
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
