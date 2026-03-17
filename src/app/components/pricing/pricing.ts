import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  key: 'free' | 'pro' | 'enterprise';
}

@Component({
  selector: 'app-pricing',
  standalone: false,
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class PricingComponent {
  isLoading = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  plans: Plan[] = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying things out',
      features: ['5 mock endpoints', '1,000 requests/month', 'Basic JSON responses', 'Community support'],
      cta: 'Get Started',
      highlighted: false,
      key: 'free',
    },
    {
      name: 'Pro',
      price: '$5',
      period: '/month',
      description: 'For professional frontend teams',
      features: ['Unlimited endpoints', '100,000 requests/month', 'Custom headers & delays', 'Team collaboration', 'Priority support', 'Webhook forwarding'],
      cta: 'Start Free Trial',
      highlighted: true,
      key: 'pro',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large-scale organizations',
      features: ['Everything in Pro', 'Unlimited requests', 'SSO & SAML', 'SLA guarantee', 'Dedicated support', 'Custom domains'],
      cta: 'Contact Sales',
      highlighted: false,
      key: 'enterprise',
    },
  ];

  handlePlanClick(plan: Plan): void {
    if (plan.key === 'free') {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (plan.key === 'enterprise') {
      window.location.href = 'mailto:hello@apibuddy.dev?subject=Enterprise Plan';
      return;
    }

    // Pro plan — start Dodo Payments checkout
    const session = this.authService.currentSession;
    if (!session) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    const user = session.user;

    this.http.post<{ checkoutUrl: string }>('/.netlify/functions/create-checkout', {
      plan: 'pro',
      userEmail: user.email,
      userName: user.user_metadata?.['full_name'] || user.email,
      userId: user.id,
    }).subscribe({
      next: ({ checkoutUrl }) => {
        window.location.href = checkoutUrl;
      },
      error: (err) => {
        console.error('Checkout error:', err);
        this.isLoading = false;
      },
    });
  }
}
