import { Component, ChangeDetectionStrategy } from '@angular/core';

interface Step {
  step: string;
  title: string;
  description: string;
  code: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: false,
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorksComponent {
  steps: Step[] = [
    {
      step: '01',
      title: 'Define your endpoint',
      description: 'Choose a method, set the path, and configure your response.',
      code: 'POST /api/v1/users\nStatus: 201\nDelay: 200ms',
    },
    {
      step: '02',
      title: 'Write your response',
      description: 'Craft the exact JSON your frontend expects to receive.',
      code: '{\n  "id": 1,\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}',
    },
    {
      step: '03',
      title: 'Use your live URL',
      description: 'Copy the endpoint URL and start fetching in your app immediately.',
      code: 'const res = await fetch(\n  "https://mockapi.dev/m/abc123"\n);',
    },
  ];
}
