import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: false,
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class PricingComponent {
  constructor(private router: Router) {}

  plans: Plan[] = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying things out',
      features: ['5 mock endpoints', '1,000 requests/month', 'Basic JSON responses', 'Community support'],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$5',
      period: '/month',
      description: 'For professional frontend teams',
      features: ['Unlimited endpoints', '100,000 requests/month', 'Custom headers & delays', 'Team collaboration', 'Priority support', 'Webhook forwarding'],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large-scale organizations',
      features: ['Everything in Pro', 'Unlimited requests', 'SSO & SAML', 'SLA guarantee', 'Dedicated support', 'Custom domains'],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];
//noted
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
