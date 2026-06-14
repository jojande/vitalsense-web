import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-container">
        <!-- Left Side: Form -->
        <div class="auth-form-section">
          <header class="auth-header">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0892d0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span class="app-name">VitalSense</span>
            </div>
            <p class="welcome-text">
              ¡Bienvenido a VitalSense! Regístrate o Inicia Sesión para comenzar tu camino hacia una mejor salud.
            </p>
          </header>

          <div class="auth-tabs">
            <button 
              [class.active]="activeTab() === 'signin'" 
              (click)="activeTab.set('signin')">
              Sign In
            </button>
            <button 
              [class.active]="activeTab() === 'signup'" 
              (click)="activeTab.set('signup')">
              Sign Up
            </button>
          </div>

          <div class="social-login">
            <p>O inicia sesión con tus redes sociales:</p>
            <div class="social-buttons">
              <button class="social-btn google">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                Continuar con Google
              </button>
            </div>
          </div>

          <div class="separator">
            <span>o</span>
          </div>

          <!-- Login Form -->
          <form *ngIf="activeTab() === 'signin'" [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
            <div class="form-group">
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input type="email" formControlName="email" placeholder="Correo electrónico">
              </div>
            </div>
            <div class="form-group">
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input type="password" formControlName="password" placeholder="Contraseña">
              </div>
            </div>
            <a href="#" class="forgot-password">¿Olvidé mi contraseña?</a>
            <button type="submit" class="primary-btn" [disabled]="loginForm.invalid">Iniciar Sesión</button>
          </form>

          <!-- Register Form -->
          <form *ngIf="activeTab() === 'signup'" [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
            <div class="form-section-title">Información de Cuenta</div>
            <div class="form-row">
              <div class="form-group">
                <div class="input-with-icon">
                  <input type="text" formControlName="firstName" placeholder="Nombre">
                </div>
              </div>
              <div class="form-group">
                <div class="input-with-icon">
                  <input type="text" formControlName="lastName" placeholder="Apellido">
                </div>
              </div>
            </div>
            <div class="form-group">
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input type="email" formControlName="email" placeholder="Correo electrónico">
              </div>
            </div>
            <div class="form-group">
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input type="password" formControlName="password" placeholder="Contraseña">
              </div>
            </div>
            
            <div class="role-selection">
              <label>Registrarme como:</label>
              <div class="radio-group">
                <label>
                  <input type="radio" formControlName="role" value="PATIENT"> Paciente
                </label>
                <label>
                  <input type="radio" formControlName="role" value="DOCTOR"> Doctor
                </label>
              </div>
            </div>

            <!-- Role Specific Fields -->
            <div class="dynamic-fields-section" *ngIf="registerForm.get('role')?.value === 'PATIENT'">
              <div class="form-section-title">Información de Paciente</div>
              <div class="form-row">
                <div class="form-group">
                  <div class="input-with-icon">
                    <input type="number" formControlName="age" placeholder="Edad">
                  </div>
                </div>
                <div class="form-group">
                  <div class="input-with-icon">
                    <select formControlName="gender">
                      <option value="" disabled selected>Género</option>
                      <option value="MALE">Masculino</option>
                      <option value="FEMALE">Femenino</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="input-with-icon">
                  <input type="text" formControlName="emergencyContact" placeholder="Contacto de emergencia">
                </div>
              </div>
            </div>

            <div class="dynamic-fields-section" *ngIf="registerForm.get('role')?.value === 'DOCTOR'">
              <div class="form-section-title">Información Profesional</div>
              <div class="form-row">
                <div class="form-group">
                  <div class="input-with-icon">
                    <input type="text" formControlName="specialty" placeholder="Especialidad">
                  </div>
                </div>
                <div class="form-group">
                  <div class="input-with-icon">
                    <input type="number" formControlName="yearsOfExperience" placeholder="Años de experiencia">
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="input-with-icon">
                  <input type="number" formControlName="consultationFee" placeholder="Precio de consulta ($)">
                </div>
              </div>
              <div class="form-group">
                <div class="input-with-icon">
                  <textarea formControlName="biography" placeholder="Biografía corta" rows="2"></textarea>
                </div>
              </div>
            </div>

            <button type="submit" class="primary-btn" [disabled]="registerForm.invalid">Registrarse</button>
          </form>

          <footer class="auth-footer">
            <p *ngIf="activeTab() === 'signin'">
              ¿No tienes una cuenta? <a href="javascript:void(0)" (click)="activeTab.set('signup')">Regístrate gratis</a>
            </p>
            <p *ngIf="activeTab() === 'signup'">
              ¿Ya tienes una cuenta? <a href="javascript:void(0)" (click)="activeTab.set('signin')">Inicia sesión</a>
            </p>
          </footer>
        </div>

        <!-- Right Side: Illustration (Desktop Only) -->
        <div class="auth-illustration-section">
          <div class="illustration-container">
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/online-doctor-appointment-2112276-1779233.png" alt="Medical Illustration">
            <div class="background-blobs"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      --primary-color: #0892d0;
      --bg-color: #f8fafc;
      --text-color: #1e293b;
      --border-color: #e2e8f0;
      --placeholder-color: #94a3b8;
    }

    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--bg-color);
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 20px;
    }

    .auth-container {
      width: 100%;
      max-width: 1000px;
      display: flex;
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .auth-form-section {
      flex: 1;
      padding: 40px;
      display: flex;
      flex-direction: column;
    }

    .auth-illustration-section {
      flex: 1;
      background-color: #f0f9ff;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
    }

    @media (max-width: 850px) {
      .auth-illustration-section {
        display: none;
      }
      .auth-container {
        max-width: 500px;
      }
    }

    .auth-header {
      margin-bottom: 30px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .heart-icon {
      width: 32px;
      height: 32px;
    }

    .app-name {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .welcome-text {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
    }

    .auth-tabs {
      display: flex;
      border-bottom: 2px solid var(--border-color);
      margin-bottom: 25px;
    }

    .auth-tabs button {
      flex: 1;
      padding: 12px;
      background: none;
      border: none;
      font-size: 16px;
      font-weight: 600;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.3s;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
    }

    .auth-tabs button.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .social-login p {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 15px;
    }

    .social-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s;
    }

    .social-btn:hover {
      background: #f1f5f9;
    }

    .social-btn img, .social-btn svg {
      width: 20px;
      height: 20px;
    }

    .separator {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 20px 0;
      color: #cbd5e1;
    }

    .separator::before, .separator::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #e2e8f0;
    }

    .separator span {
      padding: 0 10px;
      font-size: 14px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .dynamic-fields-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }


    .form-section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-color);
      margin-top: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid var(--border-color);
    }

    .form-group {
      position: relative;
    }

    .input-with-icon {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0 15px;
      transition: border-color 0.3s;
    }

    .input-with-icon:focus-within {
      border-color: var(--primary-color);
    }

    .input-icon {
      width: 18px;
      height: 18px;
      color: #94a3b8;
      margin-right: 10px;
    }

    .input-with-icon input, 
    .input-with-icon select, 
    .input-with-icon textarea {
      flex: 1;
      padding: 12px 0;
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      color: var(--text-color);
      font-family: inherit;
    }

    .input-with-icon select {
      padding: 12px 0;
      cursor: pointer;
    }

    .input-with-icon textarea {
      padding: 10px 0;
      resize: none;
    }

    .form-row {
      display: flex;
      gap: 10px;
    }

    .form-row .form-group {
      flex: 1;
    }

    .forgot-password {
      font-size: 13px;
      color: var(--primary-color);
      text-decoration: none;
      align-self: flex-end;
    }

    .primary-btn {
      background-color: var(--primary-color);
      color: white;
      padding: 14px;
      border: none;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.3s;
      margin-top: 10px;
    }

    .primary-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-footer {
      margin-top: 25px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
    }

    .auth-footer a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
    }

    .role-selection {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 5px;
    }

    .radio-group {
      display: flex;
      gap: 20px;
      margin-top: 5px;
    }

    .radio-group label {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
    }

    .illustration-container {
      position: relative;
      z-index: 1;
      width: 80%;
    }

    .illustration-container img {
      width: 100%;
      height: auto;
    }

    .background-blobs {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120%;
      height: 120%;
      background: radial-gradient(circle, #e0f2fe 0%, transparent 70%);
      z-index: -1;
    }
  `
})
export class AuthPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab = signal<'signin' | 'signup'>('signin');

  constructor() {
    const url = this.router.url;
    if (url.includes('register')) {
      this.activeTab.set('signup');
    } else {
      this.activeTab.set('signin');
    }
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['PATIENT', [Validators.required]],
    // Patient fields
    age: [null as number | null],
    gender: [''],
    emergencyContact: [''],
    // Doctor fields
    specialty: [''],
    yearsOfExperience: [null as number | null],
    consultationFee: [null as number | null],
    biography: ['']
  });

  onLogin() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue() as any;
      this.authService.login(credentials).subscribe({
        next: () => {
          this.authService.getMe().subscribe({
            next: (user: any) => {
              this.router.navigate(['/']);
            },
            error: (err: any) => console.error('Failed to fetch user info', err)
          });
        },
        error: (err: any) => alert('Login failed: ' + (err.error?.message || 'Unknown error'))
      });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      const data = this.registerForm.getRawValue() as any;
      const username = data.email.split('@')[0];
      const baseRequest = {
        username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      };

      const obs = data.role === 'PATIENT' 
        ? this.authService.registerPatient({
            ...baseRequest,
            age: data.age || 0,
            gender: data.gender || 'OTHER',
            emergencyContact: data.emergencyContact || ''
          }) 
        : this.authService.registerDoctor({
            ...baseRequest,
            specialty: data.specialty || 'General',
            yearsOfExperience: data.yearsOfExperience || 0,
            consultationFee: data.consultationFee || 50.0,
            biography: data.biography || ''
          });

      obs.subscribe({
        next: () => {
          alert('Registration successful! Please login.');
          this.activeTab.set('signin');
        },
        error: (err: any) => alert('Registration failed: ' + (err.error?.message || 'Unknown error'))
      });
    }
  }
}
