import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MockAuthService } from '../../services/auth.service.mock';
import { SupabaseService } from '../../services/supabase.service';

import { NavbarComponent } from './navbar';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [RouterModule.forRoot([])],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: SupabaseService, useValue: { getSupabase: () => null } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
