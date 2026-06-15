import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];
  
  // Try signal first, fallback to localStorage for stability during navigation
  const user = authService.currentUser();
  const userRole = user?.role || localStorage.getItem('userRole');

  console.log('RoleGuard checking...', { expectedRole, userRole });

  if (userRole === expectedRole) {
    return true;
  }

  console.warn('Role mismatch or no user. Redirecting to login.');
  router.navigate(['/auth/login']);
  return false;
};
