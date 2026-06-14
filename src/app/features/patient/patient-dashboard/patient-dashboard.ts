import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="workspace-content">
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
            <button class="cta-btn" routerLink="/patient/search">Reservar Ahora</button>
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
    </div>
  `,
  styles: `
    .workspace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }

    .greeting h1 { font-size: 28px; color: #1e293b; margin: 0; }
    .greeting p { color: #64748b; margin-top: 4px; }

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
      border: 1px solid #e2e8f0;
    }

    .next-appointment { display: flex; flex-direction: column; gap: 20px; }
    .badge { background: #f0f9ff; color: #0892d0; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .appointment-details { display: flex; justify-content: space-between; align-items: flex-end; }
    .doc-info h3 { margin: 0; font-size: 20px; }
    .doc-info p { margin: 4px 0 0; color: #64748b; }
    .time-info { display: flex; flex-direction: column; gap: 8px; }
    .info-item { display: flex; align-items: center; gap: 8px; color: #1e293b; font-size: 14px; }
    .info-item svg { width: 16px; height: 16px; color: #0892d0; }
    .card-actions { display: flex; gap: 16px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    .text-btn { background: none; border: none; font-weight: 600; color: #0892d0; cursor: pointer; padding: 0; }
    .text-btn.danger { color: #ef4444; }

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
    .cta-btn { background: white; color: #0892d0; border: none; padding: 12px 24px; border-radius: 30px; font-weight: 700; cursor: pointer; transition: transform 0.2s; }
    .cta-btn:hover { transform: translateY(-2px); }
    .cta-illustration { position: absolute; right: -20px; bottom: -20px; opacity: 0.2; }
    .bg-icon { width: 150px; height: 150px; stroke: white; }

    .medication-tracker { grid-column: 1 / -1; }
    .medication-tracker h3 { margin: 0 0 20px; font-size: 18px; }
    .med-list { display: flex; flex-direction: column; gap: 12px; }
    .checkbox-container { display: flex; align-items: center; padding: 12px; background: #f8fafc; border-radius: 12px; cursor: pointer; position: relative; }
    .checkbox-container input { opacity: 0; position: absolute; }
    .checkmark { height: 22px; width: 22px; background-color: white; border: 2px solid #e2e8f0; border-radius: 6px; margin-right: 16px; position: relative; }
    .checkbox-container:hover input ~ .checkmark { border-color: #0892d0; }
    .checkbox-container input:checked ~ .checkmark { background-color: #0892d0; border-color: #0892d0; }
    .checkmark:after { content: ""; position: absolute; display: none; left: 7px; top: 3px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
    .checkbox-container input:checked ~ .checkmark:after { display: block; }
    .med-info { display: flex; flex: 1; justify-content: space-between; }
    .med-name { font-weight: 600; }
    .med-time { color: #64748b; font-size: 14px; }
    .checkbox-container input:checked ~ .med-info .med-name { text-decoration: line-through; opacity: 0.6; }

    .empty-state { padding: 20px; text-align: center; color: #64748b; font-style: italic; }

    @media (max-width: 850px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `
})
export class PatientDashboardComponent {
  private authService = inject(AuthService);

  userName = () => this.authService.currentUser()?.firstName || 'Paciente';

  nextAppointment = signal<any | null>(null);
  medications = signal<any[]>([]);

  toggleMed(id: number) {
    this.medications.update(meds => 
      meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m)
    );
  }
}
