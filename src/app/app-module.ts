import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';
import { IndexComponent } from './pages/index/index';
import { NotFoundComponent } from './pages/not-found/not-found';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback';
import { NavLinkComponent } from './components/nav-link/nav-link';
import { NavbarComponent } from './components/navbar/navbar';
import { HeroComponent } from './components/hero/hero';
import { FeaturesComponent } from './components/features/features';
import { HowItWorksComponent } from './components/how-it-works/how-it-works';
import { PricingComponent } from './components/pricing/pricing';
import { FooterComponent } from './components/footer/footer';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    NotFoundComponent,
    AuthCallbackComponent,
    NavLinkComponent,
    NavbarComponent,
    HeroComponent,
    FeaturesComponent,
    HowItWorksComponent,
    PricingComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    SharedModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
