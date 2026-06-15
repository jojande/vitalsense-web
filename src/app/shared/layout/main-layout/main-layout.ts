import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="main-wrapper">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: `
    .main-wrapper {
      width: 100%;
      height: 100vh;
    }
  `
})
export class MainLayoutComponent {}
