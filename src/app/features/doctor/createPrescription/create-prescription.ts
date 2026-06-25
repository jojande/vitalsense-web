import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { AppointmentResponseDTO } from '../../../core/models/appointment.models';

@Component({
  selector: 'app-create-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  template: `
    <!-- Backdrop -->
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-panel" (click)="$event.stopPropagation()">

        <button class="close-btn" (click)="onClose()" aria-label="Cerrar">&#x2715;</button>

        <div class="modal-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <h2>Registrar Receta Médica</h2>
            <p>Paciente: <strong>{{ appointment.patientName }}</strong> &mdash; {{ formatDate(appointment.scheduledDate) }}</p>
          </div>
        </div>

        <div class="notepad">

          <div class="notepad-section">
            <label class="notepad-label" for="medications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
              </svg>
              Medicamentos
            </label>
            <textarea
              id="medications"
              class="notepad-textarea"
              [(ngModel)]="medications"
              placeholder="Ej: Amoxicilina 500mg — 1 cápsula cada 8 horas por 7 días&#10;Ibuprofeno 400mg — 1 tableta cada 12 horas si hay dolor"
              rows="5"
              [disabled]="isSubmitting()"
            ></textarea>
          </div>

          <div class="notepad-divider"></div>

          <div class="notepad-section">
            <label class="notepad-label" for="instructions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Indicaciones y recomendaciones
            </label>
            <textarea
              id="instructions"
              class="notepad-textarea"
              [(ngModel)]="instructions"
              placeholder="Ej: Reposo relativo por 48 horas. Hidratación constante. Evitar alimentos grasos. Regresar a control en 1 semana si los síntomas persisten."
              rows="5"
              [disabled]="isSubmitting()"
            ></textarea>
          </div>

        </div>

        <div class="char-hints">
          <span>{{ medications.length }} caracteres en medicamentos</span>
          <span>{{ instructions.length }} caracteres en indicaciones</span>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" (click)="onClose()" [disabled]="isSubmitting()">Cancelar</button>
          <button
            class="confirm-btn"
            [disabled]="!canSubmit() || isSubmitting()"
            (click)="submit()"
          >
            {{ isSubmitting() ? 'Guardando...' : 'Guardar Receta' }}
          </button>
        </div>

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
      max-width: 620px;
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

    /* Notepad */
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

    .notepad-textarea {
      width: 100%;
      border: none;
      background: transparent;
      resize: none;
      font-size: 14px;
      color: #1e293b;
      line-height: 1.7;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
    }
    .notepad-textarea::placeholder { color: #94a3b8; }
    .notepad-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

    .notepad-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0 20px;
    }

    /* Char hints */
    .char-hints {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #94a3b8;
      padding: 0 4px;
    }

    /* Footer */
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
    .cancel-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
    .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

    @media (max-width: 600px) {
      .modal-panel { padding: 24px 16px; }
      .modal-footer { flex-direction: column-reverse; }
      .cancel-btn, .confirm-btn { width: 100%; text-align: center; }
      .char-hints { flex-direction: column; gap: 4px; }
    }
  `
})
export class CreatePrescriptionComponent {

  @Input() appointment!: AppointmentResponseDTO;
  @Output() closed      = new EventEmitter<void>();
  @Output() saved       = new EventEmitter<void>();

  private prescriptionService = inject(PrescriptionService);
  private snackBar            = inject(MatSnackBar);

  medications  = '';
  instructions = '';
  isSubmitting = signal(false);

  canSubmit(): boolean {
    return this.medications.trim().length > 0 && this.instructions.trim().length > 0;
  }

  submit() {
    if (!this.canSubmit()) return;
    this.isSubmitting.set(true);

    this.prescriptionService.createPrescription({
      appointmentId: this.appointment.appointmentId,
      medications:   this.medications.trim(),
      instructions:  this.instructions.trim(),
    }).subscribe({
      next: () => {
        this.snackBar.open('Receta guardada correctamente.', 'Cerrar', { duration: 3000 });
        this.saved.emit();
        this.closed.emit();
      },
      error: () => {
        this.snackBar.open('No se pudo guardar la receta.', 'Cerrar', { duration: 3000 });
        this.isSubmitting.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  onClose() { this.closed.emit(); }
}