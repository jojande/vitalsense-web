import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      // Allow specific feature components to handle their own localized errors
      const skipGlobalAlert = 
        req.url.toLowerCase().includes('/auth/') || 
        req.url.toLowerCase().includes('/availability/');
      
      if (skipGlobalAlert) {
        return throwError(() => error);
      }

      let message = 'Ocurrió un error inesperado en el sistema';
      
      if (error.status === 401) {
        message = 'No autorizado. Por favor inicie sesión nuevamente.';
      } else if (error.error instanceof ErrorEvent) {
        message = error.error.message;
      } else {
        message = error.error?.message || error.message || message;
      }

      snackBar.open(message, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });

      return throwError(() => error);
    })
  );
};
