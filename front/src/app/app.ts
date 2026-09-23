import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  template: `
    <div class="app-shell">
      @if (showChrome()) {
        <app-header />
      }

      <main class="app-main">
        <router-outlet />
      </main>

      @if (showChrome()) {
        <app-footer />
      }
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--fg-bg);
    }

    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `],
})
export class AppComponent {
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  // Header et footer publics sont masqués en zone admin (sidebar dédiée à venir)
  showChrome = computed(() => !this.currentUrl().startsWith('/admin'));
}
