import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { PrescriptionResponseDTO } from '../../../core/models/prescription.models';
import { AppointmentResponseDTO } from '../../../core/models/appointment.models';

@Component({
  selector: 'app-view-prescription',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  providers: [DatePipe],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-panel" (click)="$event.stopPropagation()">

        <button class="close-btn" (click)="onClose()" aria-label="Cerrar">&#x2715;</button>

        <!-- Loading -->
        <div class="loading-state" *ngIf="isLoading()">
          Cargando receta...
        </div>

        <!-- Error / sin receta -->
        <div class="empty-state" *ngIf="!isLoading() && !prescription()">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3>Sin receta registrada</h3>
          <p>El médico aún no ha registrado una receta para esta consulta.</p>
          <button class="close-action-btn" (click)="onClose()">Cerrar</button>
        </div>

        <!-- Receta -->
        <ng-container *ngIf="!isLoading() && prescription()">

          <div class="modal-header">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h2>Receta Médica</h2>
              <p>
                {{ appointment.doctorName }} &mdash; {{ formatDate(appointment.scheduledDate) }}
              </p>
            </div>
          </div>

          <div class="notepad">

            <div class="notepad-section">
              <div class="notepad-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
                Medicamentos
              </div>
              <p class="notepad-content">{{ prescription()!.medications }}</p>
            </div>

            <div class="notepad-divider"></div>

            <div class="notepad-section">
              <div class="notepad-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Indicaciones y recomendaciones
              </div>
              <p class="notepad-content">{{ prescription()!.instructions }}</p>
            </div>

          </div>

          <div class="meta-footer">
            Emitida el {{ formatDateTime(prescription()!.createdAt) }}
          </div>

          <div class="modal-footer">
            <button class="close-action-btn" (click)="onClose()">Cerrar</button>
          </div>

        </ng-container>

      </div>
    </div>
  `,
  styles: `
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
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-panel {
      background: white;
      border-radius: 24px;
      padding: 32px;
      width: 100%;
      max-width: 580px;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 22px;
      position: relative;
      box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(16px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 20px;
      background: none;
      border: none;
      font-size: 18px;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      transition: color 0.15s, background 0.15s;
    }
    .close-btn:hover { color: #1e293b; background: #f1f5f9; }

    /* States */
    .loading-state {
      text-align: center;
      padding: 60px 0;
      color: #64748b;
      font-size: 14px;
    }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .empty-icon { color: #cbd5e1; }
    .empty-state h3 { margin: 0; font-size: 18px; color: #1e293b; }
    .empty-state p  { margin: 0; font-size: 14px; color: #64748b; }

    /* Header */
    .modal-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .header-icon {
      width: 44px;
      height: 44px;
      background: #f0f9ff;
      border: 1px solid #e0f2fe;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0892d0;
      flex-shrink: 0;
    }
    .modal-header h2 { margin: 0; font-size: 20px; color: #1e293b; }
    .modal-header p  { margin: 4px 0 0; font-size: 13px; color: #64748b; }

    /* Notepad (read-only) */
    .notepad {
      background: #fafafa;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
    }
    .notepad-section { padding: 18px 20px; }
    .notepad-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 10px;
    }
    .notepad-content {
      margin: 0;
      font-size: 14px;
      color: #1e293b;
      line-height: 1.7;
      white-space: pre-wrap; /* respeta los saltos de línea del doctor */
    }
    .notepad-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0 20px;
    }

    /* Meta */
    .meta-footer {
      font-size: 11px;
      color: #94a3b8;
      text-align: right;
    }

    /* Footer */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
    }

    .close-action-btn {
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
    .close-action-btn:hover { background: #0369a1; transform: translateY(-1px); }

    @media (max-width: 600px) {
      .modal-panel { padding: 24px 16px; }
      .close-action-btn { width: 100%; }
    }
  `
})
export class ViewPrescriptionComponent implements OnInit {

  @Input() appointment!: AppointmentResponseDTO;
  @Output() closed = new EventEmitter<void>();

  private prescriptionService = inject(PrescriptionService);
  private snackBar            = inject(MatSnackBar);
  private datePipe            = inject(DatePipe);

  isLoading    = signal(true);
  prescription = signal<PrescriptionResponseDTO | null>(null);

  ngOnInit() {
    this.prescriptionService.getPrescriptionByAppointmentId(this.appointment.appointmentId).subscribe({
      next: (data) => {
        this.prescription.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // 404 = sin receta aún; se muestra el empty state
        this.prescription.set(null);
        this.isLoading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const f = this.datePipe.transform(d, "EEEE, dd/MM/yyyy", '', 'es-ES') || '';
    return f.charAt(0).toUpperCase() + f.slice(1);
  }

  formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return this.datePipe.transform(d, "dd/MM/yyyy HH:mm", '', 'es-ES') || '';
  }

  onClose() { this.closed.emit(); }
}