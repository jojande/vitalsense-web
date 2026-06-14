import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="title" routerLink="/">VitalSense</span>
      <span class="spacer"></span>
      
      <ng-container *ngIf="authService.currentUser() as user; else guest">
        <span class="user-info">Welcome, {{ user.firstName }} ({{ user.role }})</span>
        <button mat-button routerLink="/patient" routerLinkActive="active" *ngIf="user.role === 'PATIENT'">Dashboard</button>
        <button mat-button routerLink="/doctor" routerLinkActive="active" *ngIf="user.role === 'DOCTOR'">Dashboard</button>
        <button mat-icon-button (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </ng-container>

      <ng-template #guest>
        <button mat-button routerLink="/auth/login">Login</button>
        <button mat-raised-button color="accent" routerLink="/auth/register">Register</button>
      </ng-template>
    </mat-toolbar>
  `,
  styles: `
    .spacer {
      flex: 1 1 auto;
    }
    .title {
      cursor: pointer;
    }
    .user-info {
      margin-right: 15px;
      font-size: 0.9rem;
    }
    .active {
      background: rgba(255, 255, 255, 0.2);
    }
  `
})
export class NavigationComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
