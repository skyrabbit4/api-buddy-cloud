import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../../guards/auth.guard';
import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent } from './dashboard';
import { CreateEndpointDialogComponent } from '../../components/create-endpoint-dialog/create-endpoint-dialog';
import { EndpointCardComponent } from '../../components/endpoint-card/endpoint-card';

@NgModule({
  declarations: [
    DashboardComponent,
    CreateEndpointDialogComponent,
    EndpointCardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: DashboardComponent, canActivate: [AuthGuard] }
    ])
  ]
})
export class DashboardModule { }
