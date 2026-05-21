import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/welcome/welcome.component').then((module) => module.WelcomeComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((module) => module.DashboardComponent)
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./components/quiz-engine/quiz-engine.component').then((module) => module.QuizEngineComponent)
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./components/leaderboard/leaderboard.component').then((module) => module.LeaderboardComponent)
  },
  {
    path: 'team',
    loadComponent: () =>
      import('./components/team/team.component').then((module) => module.TeamComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then((module) => module.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
