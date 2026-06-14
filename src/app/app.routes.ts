import { Routes } from '@angular/router';
import { AuthPageComponent } from './features/auth/auth-page';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'auth/login', component: AuthPageComponent },
  { path: 'auth/register', component: AuthPageComponent },
  { 
    path: '', 
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'patient', 
        loadComponent: () => import('./features/patient/patient-dashboard/patient-dashboard').then(m => m.PatientDashboardComponent),
        canActivate: [roleGuard],
        data: { role: 'PATIENT' }
      },
      { 
        path: 'doctor', 
        loadComponent: () => import('./features/doctor/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboardComponent),
        canActivate: [roleGuard],
        data: { role: 'DOCTOR' }
      },
      { path: '', redirectTo: 'patient', pathMatch: 'full' } // Default redirect, can be dynamic
    ]
  },
  { path: '**', redirectTo: '' }
];
