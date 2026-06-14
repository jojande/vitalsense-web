import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];
  const user = authService.currentUser();

  console.log('RoleGuard checking...', { expectedRole, userRole: user?.role });

  if (user && user.role === expectedRole) {
    return true;
  }

  console.warn('Role mismatch or no user. Redirecting to login.');
  router.navigate(['/auth/login']);
  return false;
};
