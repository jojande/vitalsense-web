import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="workspace-container">
      <header class="workspace-header">
        <div class="greeting">
          <h1>¡Hola, Dr. {{ doctorLastName() }}!</h1>
          <p>¿Cómo va su jornada médica hoy?</p>
        </div>
        <div class="date-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="calendar-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{{ today() }}</span>
        </div>
      </header>

      <div class="dashboard-grid">
        <!-- Widget 1: Resumen Diario -->
        <div class="card stats-card">
          <div class="stat-item">
            <div class="stat-value">{{ totalAppointmentsToday() }}</div>
            <div class="stat-label">Citas programadas para hoy</div>
          </div>
        </div>

        <!-- Widget 2: Citas del Día -->
        <div class="card schedule-card">
          <div class="card-header">
            <h2>Citas del Día</h2>
          </div>
          
          <div class="appointment-list" *ngIf="todaysAppointments().length > 0; else noAppointments">
            <div class="appointment-row" *ngFor="let appt of todaysAppointments()">
              <div class="time-col">{{ appt.time }}</div>
              <div class="patient-col">
                <span class="patient-name">{{ appt.patientName }}</span>
                <span class="reason-text">{{ appt.reason }}</span>
              </div>
              <div class="status-col">
                <span class="status-badge" [ngClass]="appt.status.toLowerCase()">
                  {{ appt.status }}
                </span>
              </div>
              <div class="action-col">
                <button class="action-btn">Ver Detalles</button>
              </div>
            </div>
          </div>

          <ng-template #noAppointments>
            <div class="empty-state">
              <p>No tiene citas programadas para el resto del día.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: `
    .workspace-container {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .workspace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 40px;
      gap: 20px;
      box-sizing: border-box;
    }

    .greeting {
      min-width: 0;
      flex: 1;
    }

    .greeting h1 { 
      font-size: 28px; 
      color: #1e293b; 
      margin: 0; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
    }
    .greeting p { color: #64748b; margin-top: 4px; }

    .date-badge {
      background: white;
      padding: 10px 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: #1e293b;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      flex-shrink: 0;
    }

    .calendar-icon { width: 18px; height: 18px; color: #0892d0; }

    .dashboard-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
      width: 100%;
      box-sizing: border-box;
    }

    .card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      width: 100%;
      box-sizing: border-box;
    }

    .stats-card {
      padding: 30px;
      background: linear-gradient(135deg, #0892d0 0%, #0369a1 100%);
      color: white;
      border: none;
    }

    .stat-value { font-size: 36px; font-weight: 800; }
    .stat-label { font-size: 16px; opacity: 0.9; margin-top: 5px; }

    .schedule-card h2 { margin: 0 0 24px; font-size: 20px; color: #1e293b; }

    .appointment-list { 
      display: flex; 
      flex-direction: column; 
      width: 100%;
    }

    .appointment-row {
      display: grid;
      grid-template-columns: 70px 1fr 100px 100px;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;
      gap: 15px;
      width: 100%;
    }

    .time-col { font-weight: 700; color: #1e293b; font-size: 14px; }
    
    .patient-col { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .patient-name { font-weight: 600; color: #1e293b; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .reason-text { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .status-badge {
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
    }

    .status-badge.pendiente { background: #fef9c3; color: #854d0e; }
    .status-badge.completada { background: #dcfce7; color: #166534; }

    .action-btn {
      background: none;
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #0892d0;
      cursor: pointer;
      white-space: nowrap;
    }

    @media (max-width: 1024px) {
      .appointment-row {
        grid-template-columns: 60px 1fr 90px 90px;
        gap: 10px;
      }
    }

    @media (max-width: 850px) {
      .workspace-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
      .date-badge { padding: 8px 15px; }

      .appointment-row {
        grid-template-columns: 1fr 100px;
        grid-template-rows: auto auto;
        gap: 5px;
      }
      .time-col { grid-row: 1; grid-column: 1; }
      .status-col { grid-row: 1; grid-column: 2; text-align: right; }
      .patient-col { grid-row: 2; grid-column: 1; }
      .action-col { grid-row: 2; grid-column: 2; display: flex; justify-content: flex-end; }
      .action-btn { width: auto; padding: 4px 8px; font-size: 11px; }
    }
  `
})
export class DoctorDashboardComponent {
  private authService = inject(AuthService);
  private datePipe = inject(DatePipe);

  doctorLastName = () => this.authService.currentUser()?.lastName || 'Doctor';
  today = () => {
    const d = new Date();
    const dateStr = this.datePipe.transform(d, "EEEE, d 'de' MMMM", '', 'es-ES') || '';
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  todaysAppointments = signal<any[]>([]);
  totalAppointmentsToday = () => this.todaysAppointments().length;
}
