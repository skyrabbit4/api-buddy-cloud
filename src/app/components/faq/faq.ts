import { Component, ChangeDetectionStrategy } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: false,
  templateUrl: './faq.html',
  styleUrl: './faq.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  faqs: FaqItem[] = [
    {
      question: 'What is MockAPI?',
      answer:
        'MockAPI is a free online tool that lets you create mock HTTP endpoints instantly. You can define custom JSON responses, HTTP status codes, response delays, and supported methods (GET, POST, PUT, PATCH, DELETE) — all without writing any backend code.',
      open: false,
    },
    {
      question: 'Is MockAPI free?',
      answer:
        'Yes. MockAPI has a free plan that includes 5 mock endpoints and 1,000 requests per month — forever. A Pro plan is available at $5/month for unlimited endpoints and 100,000 requests/month.',
      open: false,
    },
    {
      question: 'How do I create a mock API endpoint?',
      answer:
        "Sign in with Google or GitHub, click 'New Endpoint' on your dashboard, fill in the HTTP method, path, status code, optional delay, and JSON response body — your live endpoint URL is generated instantly.",
      open: false,
    },
    {
      question: 'What HTTP methods does MockAPI support?',
      answer:
        'MockAPI supports GET, POST, PUT, PATCH, and DELETE — the full range of REST API methods you need for realistic frontend mocking.',
      open: false,
    },
    {
      question: 'Does MockAPI support CORS?',
      answer:
        'Yes. All MockAPI endpoints include proper CORS headers so you can call them from any frontend origin — including localhost — without any additional configuration.',
      open: false,
    },
    {
      question: 'Can I simulate slow API responses?',
      answer:
        'Yes. When creating or editing an endpoint, you can set a delay in milliseconds. This lets you test loading states, spinners, and timeout handling in your frontend.',
      open: false,
    },
  ];

  toggle(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
