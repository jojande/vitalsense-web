import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AvailabilityService } from '../../../core/services/availability.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AppointmentResponseDTO } from '../../../core/models/appointment.models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface RescheduleSlot {
  availabilityId: number;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-reschedule-appointment',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  providers: [DatePipe],
  template: `
    <!-- Backdrop -->
    <div class="modal-backdrop" (click)="onClose()">
      <!-- Modal panel — stopPropagation prevents backdrop click from closing when clicking inside -->
      <div class="modal-panel" (click)="$event.stopPropagation()">

        <button class="close-btn" (click)="onClose()" aria-label="Cerrar">&#x2715;</button>

        <div class="modal-header">
          <h2>Reprogramar cita</h2>
          <p>Selecciona un nuevo horario disponible con <strong>{{ appointment.doctorName }}</strong>.</p>
        </div>

        <!-- Loading state -->
        <div class="loading-state" *ngIf="isLoadingSlots()">
          Cargando horarios disponibles...
        </div>

        <!-- Empty state -->
        <div class="empty-slots" *ngIf="!isLoadingSlots() && groupedSlots().length === 0">
          <p>No hay horarios disponibles para este médico en los próximos días.</p>
        </div>

        <!-- Slots grid (grouped by date, same logic as appointment-booking) -->
        <div class="slots-grid" *ngIf="!isLoadingSlots() && groupedSlots().length > 0">
          <div class="date-column" *ngFor="let day of groupedSlots()">
            <div class="date-header">{{ day.label }}</div>
            <div class="slots-list">
              <button
                *ngFor="let slot of day.slots"
                class="slot-chip"
                [class.selected]="selectedSlot()?.availabilityId === slot.availabilityId"
                (click)="selectedSlot.set(slot)"
              >
                {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
              </button>
              <div class="no-slots" *ngIf="day.slots.length === 0">Sin horarios</div>
            </div>
          </div>
        </div>

        <!-- Confirmation summary -->
        <div class="confirmation-box" *ngIf="selectedSlot()">
          <div class="conf-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p>
            Nueva fecha: <strong>{{ formatDate(selectedSlot()!.startTime) }}</strong>
            a las <strong>{{ formatTime(selectedSlot()!.startTime) }}</strong>.
          </p>
        </div>

        <!-- Footer actions -->
        <div class="modal-footer">
          <button class="cancel-btn" (click)="onClose()">Cancelar</button>
          <button
            class="confirm-btn"
            [disabled]="!selectedSlot() || isSubmitting()"
            (click)="confirmReschedule()"
          >
            {{ isSubmitting() ? 'Guardando...' : 'Confirmar nueva fecha' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: `
    /* ── Backdrop ── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ── Panel ── */
    .modal-panel {
      background: white;
      border-radius: 24px;
      padding: 32px;
      width: 100%;
      max-width: 680px;
      max-height: 85vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
      position: relative;
      box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(16px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    /* ── Close button ── */
    .close-btn {
      position: absolute;
      top: 16px;
      right: 20px;
      background: none;
      border: none;
      font-size: 18px;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
      padding: 4px 8px;
      border-radius: 8px;
      transition: color 0.15s, background 0.15s;
    }
    .close-btn:hover { color: #1e293b; background: #f1f5f9; }

    /* ── Header ── */
    .modal-header h2 { margin: 0; font-size: 22px; color: #1e293b; }
    .modal-header p  { margin: 6px 0 0; color: #64748b; font-size: 14px; }

    /* ── States ── */
    .loading-state {
      text-align: center;
      padding: 40px 0;
      color: #64748b;
      font-size: 14px;
    }

    .empty-slots {
      text-align: center;
      padding: 32px 20px;
      background: #f8fafc;
      border-radius: 16px;
      color: #64748b;
      font-size: 14px;
      border: 2px dashed #e2e8f0;
    }

    /* ── Slots grid (mirrors appointment-booking layout) ── */
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .date-column { display: flex; flex-direction: column; gap: 10px; }

    .date-header {
      text-align: center;
      font-weight: 700;
      font-size: 13px;
      color: #64748b;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
      text-transform: capitalize;
    }

    .slots-list { display: flex; flex-direction: column; gap: 8px; }

    .slot-chip {
      background: white;
      border: 1px solid #cbd5e1;
      padding: 9px;
      border-radius: 12px;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      transition: all 0.2s;
    }
    .slot-chip:hover  { border-color: #0892d0; background: #f0f9ff; }
    .slot-chip.selected {
      background: #0892d0;
      border-color: #0892d0;
      color: white;
      box-shadow: 0 4px 6px -1px rgba(8, 146, 208, 0.3);
    }

    .no-slots { font-size: 12px; color: #94a3b8; text-align: center; font-style: italic; }

    /* ── Confirmation box ── */
    .confirmation-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f0f9ff;
      border: 1px solid #0892d0;
      border-radius: 14px;
      padding: 14px 18px;
    }
    .conf-icon { color: #0892d0; flex-shrink: 0; }
    .confirmation-box p { margin: 0; color: #1e293b; font-size: 14px; line-height: 1.5; }

    /* ── Footer ── */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
    }

    .cancel-btn {
      background: none;
      border: 1px solid #e2e8f0;
      color: #64748b;
      padding: 11px 24px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cancel-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

    .confirm-btn {
      background: #0892d0;
      color: white;
      border: none;
      padding: 11px 28px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(8, 146, 208, 0.3);
      transition: all 0.2s;
    }
    .confirm-btn:hover:not(:disabled) { background: #0369a1; transform: translateY(-1px); }
    .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .modal-panel  { padding: 24px 16px; }
      .slots-grid   { grid-template-columns: 1fr; }
      .modal-footer { flex-direction: column-reverse; }
      .cancel-btn, .confirm-btn { width: 100%; text-align: center; }
    }
  `
})
export class RescheduleAppointmentComponent implements OnInit {

  // Receives the appointment to reschedule from the parent (appointment-list)
  @Input() appointment!: AppointmentResponseDTO;

  // Emits when the modal should close (cancelled or completed successfully)
  @Output() closed = new EventEmitter<void>();

  // Emits after a successful reschedule so the parent can refresh its list
  @Output() rescheduled = new EventEmitter<void>();

  private availabilityService = inject(AvailabilityService);
  private appointmentService  = inject(AppointmentService);
  private datePipe            = inject(DatePipe);
  private snackBar            = inject(MatSnackBar);

  isLoadingSlots = signal(true);
  isSubmitting   = signal(false);
  selectedSlot   = signal<RescheduleSlot | null>(null);

  // Slots grouped by date — mirrors the structure used in appointment-booking
  groupedSlots = signal<{ label: string; slots: RescheduleSlot[] }[]>([]);

  ngOnInit() {
    this.loadSlots();
  }

  private loadSlots() {
    this.isLoadingSlots.set(true);

    this.availabilityService.getDoctorAvailability(this.appointment.doctorId).subscribe({
      next: (rawSlots: any[]) => {
        this.groupedSlots.set(this.buildColumns(rawSlots));
        this.isLoadingSlots.set(false);
      },
      error: () => {
        this.snackBar.open('No se pudo cargar la disponibilidad del médico.', 'Cerrar', { duration: 3000 });
        this.isLoadingSlots.set(false);
      }
    });
  }

  // Groups available slots into day-columns (next 3 days), same approach as appointment-booking
  private buildColumns(rawSlots: any[]): { label: string; slots: RescheduleSlot[] }[] {
    const today = new Date();
    const columns = [];

    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateKey = targetDate.toISOString().split('T')[0];

      const label = this.datePipe.transform(targetDate, "EEEE, dd/MM", '', 'es-ES') || '';

      const daySlots: RescheduleSlot[] = rawSlots
        .filter(s => s.startTime.startsWith(dateKey) && s.available === true)
        .map(s => ({
          availabilityId: s.availabilityId,
          startTime:      s.startTime,
          endTime:        s.endTime,
        }));

      columns.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        slots: daySlots,
      });
    }

    return columns;
  }

  confirmReschedule() {
    const slot = this.selectedSlot();
    if (!slot) return;

    this.isSubmitting.set(true);

    this.appointmentService
      .rescheduleAppointment(this.appointment.appointmentId, slot.startTime)
      .subscribe({
        next: () => {
          this.snackBar.open('Cita reprogramada correctamente.', 'Cerrar', { duration: 3000 });
          this.rescheduled.emit(); // parent refreshes the list
          this.closed.emit();
        },
        error: () => {
          this.snackBar.open('No se pudo reprogramar la cita.', 'Cerrar', { duration: 3000 });
          this.isSubmitting.set(false);
        }
      });
  }

  onClose() {
    this.closed.emit();
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const formatted = this.datePipe.transform(d, "EEEE, dd/MM/yyyy", '', 'es-ES') || '';
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  formatTime(isoStr: string): string {
    return isoStr.split('T')[1]?.substring(0, 5) ?? '';
  }
}