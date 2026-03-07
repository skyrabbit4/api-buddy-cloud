# API Buddy Cloud

A web application for creating and managing mock API endpoints, built with Angular 20 and Supabase.

## Features

- **Mock API Endpoints** – Create, edit, and manage mock API endpoints with custom responses
- **Dashboard** – Organize and view all your endpoints in one place
- **OAuth Authentication** – Sign in with Google or GitHub via Supabase Auth
- **Dark Theme** – Tailwind CSS dark-themed responsive UI

## Tech Stack

- **Frontend:** Angular 20, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, API)
- **Icons:** Angular Feather

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://angular.dev/tools/cli)
- A [Supabase](https://supabase.com/) project

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/skyrabbit4/api-buddy-cloud.git
   cd api-buddy-cloud
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Supabase credentials:**

   Update `src/environments/environment.ts` (and `environment.prod.ts` for production) with your Supabase project URL and anon key. You can find these in your [Supabase Dashboard](https://supabase.com/dashboard) under **Settings → API**.

4. **Start the development server:**

   ```bash
   ng serve
   ```

   Open your browser at `http://localhost:4200/`.

### Building

```bash
ng build
```

Build artifacts are stored in the `dist/` directory.

### Running Tests

```bash
ng test
```

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
