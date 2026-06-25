import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentResponseDTO } from '../../../core/models/appointment.models';
import { SPECIALTIES } from '../../auth/auth-page';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AvailabilityService } from '../../../core/services/availability.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  providers: [DatePipe],
  template: `
    <div class="appointments-view">
      <header class="view-header">
        <h1>Historial de Citas</h1>
        <p>Administra tus consultas pasadas y futuras.</p>
      </header>

      <div class="appointments-container" *ngIf="!isLoading(); else loading">
        <div class="appointments-list" *ngIf="bookedAppointments().length > 0; else noResults">
          <div class="appointment-card" *ngFor="let appt of bookedAppointments()">
            <div class="card-info">
              <div class="info-row">
                <span class="label">Fecha:</span>
                <span class="value">{{ formatDate(appt.scheduledDate) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Doctor:</span>
                <span class="value">{{ appt.doctorName }}</span>
              </div>
              <div class="info-row">
                <span class="label">Horario:</span>
                <span class="value">{{ formatTime(appt.scheduledDate) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Especialidad:</span>
                <span class="value">{{ formatSpecialty(appt.doctorSpecialty) }}</span>
              </div>
              <div class="info-row status-row">
                <span class="label">Estado:</span>
                <span class="status-badge" [ngClass]="appt.status.toLowerCase()">
                  {{ translateStatus(appt.status) }}
                </span>
              </div>
            </div>
            
            <div class="card-actions">
              <button class="action-link" *ngIf="appt.meetLink" (click)="openMeet(appt.meetLink)">
                Unirse a Cita
              </button>
              
              <button class="action-link" (click)="loadAvailableSlots(appt)">
                Reprogramar
              </button>

              <button class="action-link danger" (click)="cancel(appt)">
                Cancelar
              </button>
            </div>
          </div>
          <div
            class="reschedule-panel"
            *ngIf="selectedAppointment()"
          >

            <h3>
              Reprogramar cita con
              {{ selectedAppointment()?.doctorName }}
            </h3>

            <div *ngIf="isLoadingSlots()">
              Cargando horarios...
            </div>

            <div
              class="slots-container"
              *ngIf="!isLoadingSlots()"
            >

              <button
                *ngFor="let slot of availableSlots()"
                class="slot-btn"
                [class.selected]="selectedSlot()?.availabilityId === slot.availabilityId"
                (click)="selectedSlot.set(slot)"
              >

                {{ formatDate(slot.startTime) }}
                -
                {{ formatTime(slot.startTime) }}

              </button>

            </div>

            <button
              class="confirm-btn"
              [disabled]="!selectedSlot()"
              (click)="confirmReschedule()"
            >
              Confirmar nueva fecha
            </button>
          </div>
        </div>

        <ng-template #noResults>
          <div class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <h3>No tienes citas registradas</h3>
            <p>Tu historial de consultas médicas aparecerá aquí.</p>
          </div>
        </ng-template>
      </div>

      <ng-template #loading>
        <div class="loading-state">Cargando tus citas...</div>
      </ng-template>
    </div>
  `,
  styles: `
    .appointments-view {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .view-header h1 { font-size: 28px; color: #1e293b; margin: 0; }
    .view-header p { color: #64748b; margin: 5px 0 0; }

    .appointments-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .appointment-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: transform 0.2s;
    }

    .appointment-card:hover { transform: translateY(-2px); }

    .card-info { display: flex; flex-direction: column; gap: 12px; }
    
    .info-row { display: flex; gap: 10px; align-items: baseline; }
    .info-row .label { color: #64748b; font-size: 13px; font-weight: 600; min-width: 90px; }
    .info-row .value { color: #1e293b; font-size: 14px; font-weight: 700; }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-badge.scheduled, .status-badge.pending { background: #fef9c3; color: #854d0e; }
    .status-badge.confirmed { background: #f0f9ff; color: #0892d0; }
    .status-badge.completed { background: #f0fdf4; color: #166534; }
    .status-badge.cancelled { background: #fef2f2; color: #991b1b; }
    .status-badge.rescheduled { background: #e0f2fe; color: #0369a1; }

    .card-actions {
      display: flex;
      gap: 15px;
      border-top: 1px solid #f1f5f9;
      padding-top: 15px;
      margin-top: auto;
    }

    .action-link {
      background: none;
      border: none;
      color: #0892d0;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .action-link:hover { text-decoration: underline; }
    .action-link svg { width: 16px; height: 16px; }
    .action-link.danger { color: #ef4444; }

    .loading-state { text-align: center; padding: 100px 0; color: #64748b; }
    .empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 20px; border: 2px dashed #e2e8f0; }
    .empty-icon { width: 48px; height: 48px; color: #cbd5e1; margin: 0 auto 15px; }

    @media (max-width: 600px) {
      .appointments-list { grid-template-columns: 1fr; }
    }
  `
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private datePipe = inject(DatePipe);
  private snackBar = inject(MatSnackBar);
  private availabilityService = inject(AvailabilityService);

  bookedAppointments = signal<AppointmentResponseDTO[]>([]);
  isLoading = signal(true);

  selectedAppointment = signal<AppointmentResponseDTO | null>(null);
  availableSlots = signal<any[]>([]);
  selectedSlot = signal<any | null>(null);
  isLoadingSlots = signal(false);

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const user = this.authService.currentUser();
    if (user?.profileId) {
      this.appointmentService.getAppointmentsByPatientId(user.profileId).subscribe({
        next: (data) => {
          this.bookedAppointments.set(data.sort((a, b) => 
            new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
          ));
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const formatted = this.datePipe.transform(d, "EEEE, dd/MM/yyyy", '', 'es-ES') || '';
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return this.datePipe.transform(d, "HH:mm", '', 'es-ES');
  }

  formatSpecialty(val: string) {
    return SPECIALTIES.find(s => s.value === val)?.label || val;
  }

  translateStatus(status: string) {
    const map: any = {
      'PENDING': 'Pendiente',
      'SCHEDULED': 'Programada',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'RESCHEDULED': 'Reprogramada',
      'CONFIRMED': 'Confirmada'
    };
    return map[status] || status;
  }

  openMeet(link: string) {
    window.open(link, '_blank');
  }

  reschedule(appt: AppointmentResponseDTO) {

    this.selectedAppointment.set(appt);

    this.selectedSlot.set(null);

    this.isLoadingSlots.set(true);

    this.availabilityService
      .getDoctorAvailability(appt.doctorId)
      .subscribe({

        next: (slots) => {

          const available = slots.filter(
            (s: any) => s.available
          );

          this.availableSlots.set(available);

          this.isLoadingSlots.set(false);
        },

        error: () => {

          this.snackBar.open(
            'No se pudo cargar la disponibilidad',
            'Cerrar',
            { duration: 3000 }
          );

          this.isLoadingSlots.set(false);
        }
      });
  }

  cancel(appt: AppointmentResponseDTO) {
   this.appointmentService
     .cancelAppointment(appt.appointmentId)
      .subscribe({
       next: () => {
         this.snackBar.open('Cita cancelada correctamente', 'Cerrar', { duration: 3000 });
          this.loadAppointments();
        },
        error: (err) => {
          this.snackBar.open(
            'No se pudo cancelar la cita',
            'Cerrar',
            { duration: 3000 }
          );
        }
      });
  }

  loadAvailableSlots(appt: AppointmentResponseDTO) {

  this.selectedAppointment.set(appt);
  this.isLoadingSlots.set(true);

  this.availabilityService
    .getDoctorAvailability(appt.doctorId)
    .subscribe({
      next: (slots) => {

        const available = slots.filter(
          s => s.available === true
        );

        this.availableSlots.set(available);

        this.isLoadingSlots.set(false);
      },
      error: () => {
        this.snackBar.open(
          'No se pudieron cargar los horarios',
          'Cerrar',
          { duration: 3000 }
        );

        this.isLoadingSlots.set(false);
      }
    });
  }

  confirmReschedule() {

    const appointment = this.selectedAppointment();
    const slot = this.selectedSlot();

    if (!appointment || !slot) {
      return;
    }

    this.appointmentService
      .rescheduleAppointment(
        appointment.appointmentId,
        slot.startTime
      )
      .subscribe({
        next: () => {

          this.snackBar.open(
            'Cita reprogramada correctamente',
            'Cerrar',
            { duration: 3000 }
          );

          this.selectedAppointment.set(null);
          this.selectedSlot.set(null);

          this.loadAppointments();
        },

        error: () => {

          this.snackBar.open(
            'No se pudo reprogramar la cita',
            'Cerrar',
            { duration: 3000 }
          );
        }
      });
  }
}
