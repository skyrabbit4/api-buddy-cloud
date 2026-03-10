import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileMenuComponent } from '../components/profile-menu/profile-menu';

@NgModule({
  declarations: [ProfileMenuComponent],
  imports: [CommonModule, RouterModule],
  exports: [ProfileMenuComponent]
})
export class SharedModule { }
