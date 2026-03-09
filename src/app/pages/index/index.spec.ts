import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from '../../components/navbar/navbar';
import { HeroComponent } from '../../components/hero/hero';
import { FeaturesComponent } from '../../components/features/features';
import { HowItWorksComponent } from '../../components/how-it-works/how-it-works';
import { PricingComponent } from '../../components/pricing/pricing';
import { FooterComponent } from '../../components/footer/footer';
import { AuthService } from '../../services/auth.service';
import { MockAuthService } from '../../services/auth.service.mock';
import { RouterTestingModule } from '@angular/router/testing';

import { IndexComponent } from './index';

describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        IndexComponent,
        NavbarComponent,
        HeroComponent,
        FeaturesComponent,
        HowItWorksComponent,
        PricingComponent,
        FooterComponent,
      ],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
