import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/cats.component').then((m) => m.CatsComponent),
  },
  { path: '**', redirectTo: '' },
];