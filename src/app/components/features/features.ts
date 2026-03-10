import { Component, ChangeDetectionStrategy } from '@angular/core';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  standalone: false,
  templateUrl: './features.html',
  styleUrl: './features.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      icon: 'zap',
      title: 'Instant Endpoints',
      description: 'Create a working API endpoint in under 10 seconds. No config, no setup.',
    },
    {
      icon: 'code',
      title: 'Custom Responses',
      description:
        'Define JSON responses, status codes, headers, and delays for realistic mocking.',
    },
    {
      icon: 'globe',
      title: 'Cloud Hosted',
      description:
        'Your mock endpoints are live and accessible from anywhere. Share with your team.',
    },
    {
      icon: 'clock',
      title: 'Simulated Latency',
      description:
        'Add realistic delays to test loading states and error handling in your frontend.',
    },
    {
      icon: 'shield',
      title: 'CORS Ready',
      description: 'All endpoints come with proper CORS headers. Works seamlessly from any origin.',
    },
    {
      icon: 'layers',
      title: 'Multiple Methods',
      description: 'Support for GET, POST, PUT, PATCH, DELETE. Mock your entire API surface.',
    },
  ];
}
