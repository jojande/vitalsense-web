import { Routes } from '@angular/router';
import { AuthPageComponent } from './features/auth/auth-page';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { PatientLayoutComponent } from './features/patient/patient-layout';
import { PatientDashboardComponent } from './features/patient/patient-dashboard/patient-dashboard';
import { DoctorLayoutComponent } from './features/doctor/doctor-layout';

export const routes: Routes = [
  { path: 'auth/login', component: AuthPageComponent },
  { path: 'auth/register', component: AuthPageComponent },
  { 
    path: 'patient', 
    component: PatientLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'PATIENT' },
    children: [
      { path: 'home', component: PatientDashboardComponent },
      { path: 'search', loadComponent: () => import('./features/patient/doctor-search/doctor-search').then(m => m.DoctorSearchComponent) },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { 
    path: 'doctor', 
    component: DoctorLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'DOCTOR' },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/doctor/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboardComponent) },
      { path: 'calendar', loadComponent: () => import('./features/doctor/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboardComponent) },
      { path: 'patients', loadComponent: () => import('./features/doctor/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboardComponent) },
      { path: 'schedule-config', loadComponent: () => import('./features/doctor/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboardComponent) },
      { path: 'profile', loadComponent: () => import('./features/doctor/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboardComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'patient/home', pathMatch: 'full' },
  { path: '**', redirectTo: 'patient/home' }
];
