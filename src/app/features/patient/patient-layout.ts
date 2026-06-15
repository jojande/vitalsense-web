import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="dashboard-wrapper">
      <!-- Navegación Lateral -->
      <aside class="sidebar" [class.mobile-open]="isMobileMenuOpen()">
        <div class="sidebar-header">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0892d0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="wave-icon">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <span class="app-name">VitalSense</span>
          </div>
          <button class="mobile-close" (click)="isMobileMenuOpen.set(false)">×</button>
        </div>

        <nav class="nav-menu">
          <a routerLink="/patient/home" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Inicio</span>
          </a>
          <a routerLink="/patient/search" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Buscar Doctor</span>
          </a>
          <a routerLink="/patient/appointments" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Mis Citas</span>
          </a>
          <a routerLink="/patient/medications" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span>Alarmas de Medicamentos</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/patient/profile" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            </svg>
            <span>Configuración</span>
          </a>
          <button (click)="logout()" class="nav-item logout-btn">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Área de Contenido Principal -->
      <main class="main-content">
        <!-- Barra Superior (Solo Móvil) -->
        <header class="top-bar">
          <button class="menu-toggle" (click)="isMobileMenuOpen.set(true)">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div class="mobile-logo">VitalSense</div>
          <div class="user-avatar-small">{{ userInitials() }}</div>
        </header>

        <section class="workspace">
          <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `,
  styles: `
    :host {
      --primary: #0892d0;
      --bg: #f8fafc;
      --sidebar-bg: #ffffff;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
    }

    .dashboard-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg);
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .sidebar {
      width: 260px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 1000;
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      padding: 30px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .wave-icon { width: 32px; height: 32px; }
    .app-name { font-size: 20px; font-weight: 700; color: var(--primary); }
    .mobile-close { display: none; background: none; border: none; font-size: 24px; color: var(--text-muted); }

    .nav-menu { flex: 1; padding: 0 12px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 12px;
      margin-bottom: 4px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background: #f1f5f9;
      color: var(--primary);
    }

    .nav-item.active {
      background: #f0f9ff;
      color: var(--primary);
    }

    .nav-icon { width: 20px; height: 20px; }

    .sidebar-footer {
      padding: 20px 12px;
      border-top: 1px solid var(--border);
      margin-top: auto;
    }

    .logout-btn {
      width: 100%;
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      margin-top: 5px;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
    }

    .top-bar {
      display: none;
      padding: 16px 20px;
      background: white;
      border-bottom: 1px solid var(--border);
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 900;
    }

    .user-avatar-small {
      width: 32px;
      height: 32px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
    }

    .workspace {
      padding: 40px;
      width: 100%;
    }

    @media (max-width: 850px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.mobile-open { transform: translateX(0); }
      .mobile-close { display: block; }
      .main-content { margin-left: 0; }
      .top-bar { display: flex; }
      .workspace { padding: 20px; }
    }
  `
})
export class PatientLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isMobileMenuOpen = signal(false);

  userInitials = () => {
    const user = this.authService.currentUser();
    return user ? `${user.firstName[0]}${user.lastName[0]}` : 'P';
  };

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
