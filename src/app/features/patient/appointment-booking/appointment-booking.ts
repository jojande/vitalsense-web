import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AvailabilityService } from '../../../core/services/availability.service';
import { AuthService } from '../../../core/services/auth.service';
import { SPECIALTIES } from '../../auth/auth-page';

interface BookingSlot {
  id: number;
  start: string;
  end: string;
  date: string;
  label: string;
}

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="booking-view" *ngIf="doctor(); else noDoctor">
      <header class="booking-header">
        <h1>Agendar Cita Médica</h1>
        <p>Selecciona un horario disponible para confirmar tu cita en pocos pasos.</p>
      </header>

      <!-- Step 1: Doctor Summary Card -->
      <div class="card doctor-summary">
        <div class="avatar-circle">{{ doctor()?.fullName?.[0] }}</div>
        <div class="doc-details">
          <h2>{{ doctor()?.fullName }}</h2>
          <span class="specialty-badge">{{ formatSpecialty(doctor()?.specialty || '') }}</span>
        </div>
      </div>

      <!-- Step 2: 3-Day Availability Picker -->
      <div class="availability-section">
        <div class="section-title">Selecciona un horario</div>
        
        <div class="availability-grid" *ngIf="!isLoading(); else loading">
          <div class="date-column" *ngFor="let day of availability()">
            <div class="date-header">{{ day.label }}</div>
            <div class="slots-list">
              <button 
                *ngFor="let slot of day.slots" 
                class="slot-chip" 
                [class.selected]="selectedSlot()?.id === slot.id"
                (click)="selectSlot(slot)">
                {{ slot.label }}
              </button>
              <div class="no-slots" *ngIf="day.slots.length === 0">No hay horarios disponibles</div>
            </div>
          </div>
        </div>
        
        <ng-template #loading>
          <div class="loading-state">Cargando horarios...</div>
        </ng-template>
      </div>

      <!-- Step 3: Confirmation Summary Box -->
      <div class="card confirmation-box" *ngIf="selectedSlot()">
        <div class="conf-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <p>
          Vas a reservar una cita en la especialidad de <strong>{{ formatSpecialty(doctor()?.specialty || '') }}</strong> 
          con el/la <strong>{{ doctor()?.fullName }}</strong> el día <strong>{{ selectedSlot()?.date }}</strong> 
          de <strong>{{ selectedSlot()?.label }}</strong>.
        </p>
      </div>

      <!-- Action Footer Area -->
      <footer class="booking-footer">
        <button 
          class="confirm-btn" 
          [disabled]="!selectedSlot() || isSubmitting()"
          (click)="confirmBooking()">
          {{ isSubmitting() ? 'Confirmando...' : 'Confirmar Cita' }}
        </button>
      </footer>

      <div class="error-msg" *ngIf="errorMessage()">
        {{ errorMessage() }}
      </div>
    </div>

    <ng-template #noDoctor>
      <div class="empty-state">
        <p>No se ha seleccionado ningún médico. Por favor, busca un doctor primero.</p>
        <button class="primary-btn" routerLink="/patient/search">Buscar Doctor</button>
      </div>
    </ng-template>
  `,
  styles: `
    .booking-view {
      display: flex;
      flex-direction: column;
      gap: 30px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .booking-header h1 { font-size: 28px; color: #1e293b; margin: 0; }
    .booking-header p { color: #64748b; margin: 5px 0 0; }

    .card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .doctor-summary { display: flex; align-items: center; gap: 20px; }
    .avatar-circle { width: 60px; height: 60px; background: #f0f9ff; color: #0892d0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; border: 2px solid #e0f2fe; }
    .doc-details h2 { margin: 0; font-size: 20px; color: #1e293b; }
    .specialty-badge { display: inline-block; background: #f0fdf4; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }

    .section-title { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
    .availability-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .date-column { display: flex; flex-direction: column; gap: 15px; }
    .date-header { text-align: center; font-weight: 700; color: #64748b; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; text-transform: capitalize; }
    .slots-list { display: flex; flex-direction: column; gap: 10px; }
    .slot-chip { background: white; border: 1px solid #cbd5e1; padding: 10px; border-radius: 12px; text-align: center; font-size: 14px; font-weight: 600; color: #334155; cursor: pointer; transition: all 0.2s; }
    .slot-chip:hover { border-color: #0892d0; background: #f0f9ff; }
    .slot-chip.selected { background: #0892d0; border-color: #0892d0; color: white; box-shadow: 0 4px 6px -1px rgba(8, 146, 208, 0.3); }
    .no-slots { font-size: 12px; color: #94a3b8; text-align: center; font-style: italic; }

    .confirmation-box { display: flex; align-items: flex-start; gap: 15px; background: #f0f9ff; border-color: #0892d0; }
    .conf-icon { color: #0892d0; flex-shrink: 0; margin-top: 2px; }
    .confirmation-box p { margin: 0; color: #1e293b; line-height: 1.6; font-size: 15px; }

    .booking-footer { display: flex; justify-content: flex-end; margin-top: 10px; }
    .confirm-btn { background-color: #0892d0; color: white; border: none; padding: 14px 40px; border-radius: 30px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(8, 146, 208, 0.3); transition: all 0.2s; }
    .confirm-btn:hover { background-color: #0369a1; transform: translateY(-2px); }
    .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .error-msg { 
      color: #ef4444; 
      font-size: 14px; 
      text-align: center; 
      margin-top: 15px; 
      font-weight: 600; 
      background: #fef2f2;
      padding: 10px;
      border-radius: 12px;
      border: 1px solid #fee2e2;
    }

    .empty-state { text-align: center; padding: 100px 20px; }
    .primary-btn { background: #0892d0; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; margin-top: 20px; }

    @media (max-width: 850px) {
      .availability-grid { grid-template-columns: 1fr; }
      .date-column { border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
      .date-column:last-child { border-bottom: none; }
      .booking-footer .confirm-btn { width: 100%; }
    }
  `
})
export class AppointmentBookingComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private availabilityService = inject(AvailabilityService);
  private authService = inject(AuthService);
  private datePipe = inject(DatePipe);
  private router = inject(Router);

  doctor = this.appointmentService.selectedDoctor;
  availability = signal<{ label: string, slots: BookingSlot[] }[]>([]);
  selectedSlot = signal<BookingSlot | null>(null);
  
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    if (this.doctor()) {
      this.loadAvailability();
    }
  }

  loadAvailability() {
    this.isLoading.set(true);
    this.availabilityService.getDoctorAvailability(this.doctor()!.doctorId).subscribe({
      next: (data) => {
        this.processAvailability(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la disponibilidad del médico.');
        this.isLoading.set(false);
      }
    });
  }

  private processAvailability(rawSlots: any[]) {
    const today = new Date();
    const columns = [];

    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateKey = targetDate.toISOString().split('T')[0];
      
      const formattedLabel = this.datePipe.transform(targetDate, "EEEE, dd/MM", '', 'es-ES') || '';
      
      const daySlots = rawSlots
        .filter(s => s.startTime.startsWith(dateKey) && s.available)
        .map(s => ({
          id: s.availabilityId,
          start: s.startTime,
          end: s.endTime,
          date: formattedLabel,
          label: `${this.formatTime(s.startTime)} - ${this.formatTime(s.endTime)}`
        }));

      columns.push({
        label: formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1),
        slots: daySlots
      });
    }

    this.availability.set(columns);
  }

  private formatTime(isoStr: string): string {
    return isoStr.split('T')[1].substring(0, 5);
  }

  formatSpecialty(val: string) {
    return SPECIALTIES.find(s => s.value === val)?.label || val;
  }

  selectSlot(slot: BookingSlot) {
    this.selectedSlot.set(slot);
    this.errorMessage.set(null);
  }

  private formatErrorMessage(err: any, fallback: string): string {
    let msg = fallback;
    
    // Technical message filtering
    const rawError = typeof err.error === 'string' ? err.error : (err.error?.message || err.message || '');
    
    if (rawError.includes('Doctor already has an appointment')) {
      return 'El médico ya tiene una cita a la hora seleccionada';
    }

    if (typeof err.error === 'string') {
      try {
        const parsed = JSON.parse(err.error);
        msg = parsed.message || msg;
      } catch (e) {
        msg = err.error || msg;
      }
    } else if (err.error?.message) {
      msg = err.error.message;
    } else if (err.message) {
      msg = err.message.replace(/Http failure response for .*?: /i, '');
      if (msg.includes('0 Unknown Error')) msg = 'Error de conexión con el servidor';
    }

    return msg;
  }

  confirmBooking() {
    const user = this.authService.currentUser();
    const slot = this.selectedSlot();
    
    if (user?.profileId && slot) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      this.appointmentService.scheduleAppointment({
        patientId: user.profileId,  
        doctorId: this.doctor()!.doctorId,
        scheduledDate: slot.start,
        paymentAmount: this.doctor()!.consultationFee
      }).subscribe({
        next: () => {
          alert('¡Cita agendada exitosamente!');
          this.router.navigate(['/patient/appointments']);
        },
        error: (err) => {
          this.errorMessage.set(this.formatErrorMessage(err, 'Error al agendar la cita. Por favor intenta de nuevo.'));
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
