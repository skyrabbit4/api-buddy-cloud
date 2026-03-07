import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { IndexComponent } from './pages/index/index';
import { NotFoundComponent } from './pages/not-found/not-found';
import { LoginComponent } from './pages/login/login';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback';
import { NavLinkComponent } from './components/nav-link/nav-link';
import { NavbarComponent } from './components/navbar/navbar';
import { HeroComponent } from './components/hero/hero';
import { FeaturesComponent } from './components/features/features';
import { HowItWorksComponent } from './components/how-it-works/how-it-works';
import { PricingComponent } from './components/pricing/pricing';
import { FooterComponent } from './components/footer/footer';
import { EndpointCardComponent } from './components/endpoint-card/endpoint-card';
import { CreateEndpointDialogComponent } from './components/create-endpoint-dialog/create-endpoint-dialog';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    IndexComponent,
    NotFoundComponent,
    LoginComponent,
    AuthCallbackComponent,
    NavLinkComponent,
    NavbarComponent,
    HeroComponent,
    FeaturesComponent,
    HowItWorksComponent,
    PricingComponent,
    FooterComponent,
    EndpointCardComponent,
    CreateEndpointDialogComponent,
    ProfileMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
