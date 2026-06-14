import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
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
          <a routerLink="/patient" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Inicio</span>
          </a>
          <a routerLink="/doctors" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Buscar Doctor</span>
          </a>
          <a routerLink="/appointments" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Mis Citas</span>
          </a>
          <a routerLink="/medications" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span>Alarmas de Medicamentos</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/profile" class="nav-item">
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
          <header class="workspace-header">
            <div class="greeting">
              <h1>¡Hola, {{ userName() }}!</h1>
              <p>¿Cómo podemos ayudarte a mantenerte saludable hoy?</p>
            </div>
          </header>

          <div class="dashboard-grid">
            <!-- Widget 1: Siguiente Cita -->
            <div class="card next-appointment">
              <div class="card-header">
                <span class="badge">Siguiente Cita</span>
              </div>
              
              <div *ngIf="nextAppointment(); else noAppointment" class="appointment-details">
                <div class="doc-info">
                  <h3>{{ nextAppointment()?.doctorName }}</h3>
                  <p>{{ nextAppointment()?.specialty }}</p>
                </div>
                <div class="time-info">
                  <div class="info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{{ nextAppointment()?.date }}</span>
                  </div>
                  <div class="info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>{{ nextAppointment()?.time }}</span>
                  </div>
                </div>
              </div>
              <ng-template #noAppointment>
                <div class="empty-state">
                  <p>No tienes citas programadas próximamente.</p>
                </div>
              </ng-template>

              <div class="card-actions" *ngIf="nextAppointment()">
                <button class="text-btn">Reprogramar</button>
                <button class="text-btn danger">Cancelar</button>
              </div>
            </div>

            <!-- Widget 2: Reserva Rápida -->
            <div class="card quick-booking">
              <div class="cta-content">
                <h2>¿Necesitas un chequeo?</h2>
                <p>Reserva una cita en línea en segundos.</p>
                <button class="cta-btn">Reservar Ahora</button>
              </div>
              <div class="cta-illustration">
                 <svg viewBox="0 0 24 24" fill="none" stroke="#0892d0" stroke-width="1.5" class="bg-icon">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            </div>

            <!-- Widget 3: Control de Medicamentos -->
            <div class="card medication-tracker">
              <h3>Control de Medicamentos</h3>
              <div class="med-list" *ngIf="medications().length > 0; else noMeds">
                <div class="med-item" *ngFor="let med of medications()">
                  <label class="checkbox-container">
                    <input type="checkbox" [checked]="med.taken" (change)="toggleMed(med.id)">
                    <span class="checkmark"></span>
                    <div class="med-info">
                      <span class="med-name">{{ med.name }}</span>
                      <span class="med-time">{{ med.time }}</span>
                    </div>
                  </label>
                </div>
              </div>
              <ng-template #noMeds>
                <div class="empty-state">
                  <p>No tienes medicamentos programados para hoy.</p>
                </div>
              </ng-template>
            </div>
          </div>
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

    /* Estilos del Sidebar */
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

    /* Estilos del Contenido Principal */
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

    .workspace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      gap: 20px;
    }

    .greeting h1 { font-size: 28px; color: var(--text-main); margin: 0; }
    .greeting p { color: var(--text-muted); margin-top: 4px; }

    /* Grid y Tarjetas */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border);
    }

    /* Widget Siguiente Cita */
    .next-appointment {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .badge {
      background: #f0f9ff;
      color: var(--primary);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .appointment-details {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .doc-info h3 { margin: 0; font-size: 20px; }
    .doc-info p { margin: 4px 0 0; color: var(--text-muted); }

    .time-info { display: flex; flex-direction: column; gap: 8px; }
    .info-item { display: flex; align-items: center; gap: 8px; color: var(--text-main); font-size: 14px; }
    .info-item svg { width: 16px; height: 16px; color: var(--primary); }

    .card-actions { display: flex; gap: 16px; border-top: 1px solid var(--border); padding-top: 16px; }
    .text-btn { background: none; border: none; font-weight: 600; color: var(--primary); cursor: pointer; padding: 0; }
    .text-btn.danger { color: #ef4444; }

    /* Widget Reserva Rápida */
    .quick-booking {
      background: linear-gradient(135deg, #0892d0 0%, #0369a1 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      min-height: 180px;
    }

    .cta-content { position: relative; z-index: 2; flex: 1; }
    .cta-content h2 { font-size: 24px; margin: 0; }
    .cta-content p { margin: 12px 0 24px; opacity: 0.9; font-size: 15px; }

    .cta-btn {
      background: white;
      color: var(--primary);
      border: none;
      padding: 12px 24px;
      border-radius: 30px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .cta-btn:hover { transform: translateY(-2px); }

    .cta-illustration { position: absolute; right: -20px; bottom: -20px; opacity: 0.2; }
    .bg-icon { width: 150px; height: 150px; stroke: white; }

    /* Widget Control de Medicamentos */
    .medication-tracker {
      grid-column: 1 / -1;
    }

    .medication-tracker h3 { margin: 0 0 20px; font-size: 18px; }
    .med-list { display: flex; flex-direction: column; gap: 12px; }

    .checkbox-container {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #f8fafc;
      border-radius: 12px;
      cursor: pointer;
      position: relative;
    }

    .checkbox-container input { opacity: 0; position: absolute; }

    .checkmark {
      height: 22px;
      width: 22px;
      background-color: white;
      border: 2px solid var(--border);
      border-radius: 6px;
      margin-right: 16px;
      position: relative;
    }

    .checkbox-container:hover input ~ .checkmark { border-color: var(--primary); }
    .checkbox-container input:checked ~ .checkmark { background-color: var(--primary); border-color: var(--primary); }

    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
      left: 7px;
      top: 3px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .checkbox-container input:checked ~ .checkmark:after { display: block; }

    .med-info { display: flex; flex: 1; justify-content: space-between; }
    .med-name { font-weight: 600; }
    .med-time { color: var(--text-muted); font-size: 14px; }
    .checkbox-container input:checked ~ .med-info .med-name { text-decoration: line-through; opacity: 0.6; }

    .empty-state {
      padding: 20px;
      text-align: center;
      color: var(--text-muted);
      font-style: italic;
    }

    /* Responsividad */
    @media (max-width: 850px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.mobile-open { transform: translateX(0); }
      .mobile-close { display: block; }

      .main-content { margin-left: 0; }
      .top-bar { display: flex; }
      .workspace { padding: 20px; }
      .workspace-header { flex-direction: column; align-items: flex-start; }
      .search-box { width: 100%; }

      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `
})
export class PatientDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isMobileMenuOpen = signal(false);

  userName = () => this.authService.currentUser()?.firstName || 'Paciente';
  userInitials = () => {
    const user = this.authService.currentUser();
    return user ? `${user.firstName[0]}${user.lastName[0]}` : 'P';
  };

  // Estado de datos reales (inicialmente vacío)
  nextAppointment = signal<any | null>(null);
  medications = signal<any[]>([]);

  toggleMed(id: number) {
    this.medications.update(meds => 
      meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m)
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
