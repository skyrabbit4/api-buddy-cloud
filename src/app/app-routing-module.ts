import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { IndexComponent } from './pages/index/index';
import { NotFoundComponent } from './pages/not-found/not-found';
import { LoginComponent } from './pages/login/login';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
