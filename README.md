# 🐱 Purrfect Gallery

A cat registry application built with **Angular 19**, demonstrating modern Angular patterns including standalone components, signals, zoneless change detection, and Angular Material.


<img width="1464" height="877" alt="Screenshot 2026-03-12 at 12 52 15 PM" src="https://github.com/user-attachments/assets/f93d5c59-1efb-4bdd-851a-982cf35e0d9d" />

<img width="1466" height="834" alt="Screenshot 2026-03-12 at 12 53 24 PM" src="https://github.com/user-attachments/assets/c085c23a-dfd2-4964-8dca-3711b6709688" />



<img width="1467" height="841" alt="Screenshot 2026-03-12 at 12 53 09 PM" src="https://github.com/user-attachments/assets/3f08ba3b-19eb-4a8d-a81c-d96966fe37f4" />




---

## Tech Stack


| Layer | Choice |
|---|---|
| Framework | Angular 19 (standalone, zoneless) |
| UI Library | Angular Material 19 |
| State | Signals (`signal`, `computed`) |
| HTTP | `HttpClient` with `withFetch()` |
| Forms | Reactive Forms |
| Change Detection | `provideZonelessChangeDetection()` |
| Routing | Lazy-loaded standalone components |
| Styling | Component-scoped SCSS + global styles |
| Fonts | Fraunces · Lora · DM Mono (Google Fonts) |

---

## Features

- **Browse** all registered cats in a responsive card grid
- **Search** cats by name or description (live, signal-driven)
- **Register** a new cat via a modal form
- **Edit** an existing cat's details
- **Delete** a cat with optimistic UI update
- **View detail** dialog — fetches individual cat record from API
- All 5 API endpoints consumed (GET list, GET by ID, POST create, PUT update, DELETE)
- Graceful error handling — POST/PUT 502s are caught and resolved locally
- Fully responsive — sidebar collapses on mobile

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── cat.model.ts          # TypeScript interfaces
│   │   └── services/
│   │       └── cat-api.service.ts    # All API calls
│   ├── features/
│   │   └── cats.component.ts         # Main page + dialogs (all in one file)
│   ├── app.ts                        # Root component
│   ├── app.config.ts                 # provideZonelessChangeDetection, router, http
│   └── app.routes.ts                 # Lazy-loaded route to CatsComponent
├── styles.scss                       # Global Material overrides
└── index.html                        # Google Fonts CDN links
proxy.conf.json                       # Dev proxy — forwards /prod → API gateway
angular.json                          # SSR disabled, proxy wired to serve
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI 19

```bash
npm install -g @angular/cli
```

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/purrfect-gallery.git
cd purrfect-gallery

# 2. Install dependencies
npm install

# 3. Start the dev server (proxy handles CORS automatically)
ng serve

# 4. Open in browser
# http://localhost:4200
```

> The dev proxy in `proxy.conf.json` forwards all `/prod/*` requests to the API gateway, so no CORS issues during development.

---

## API

**Base URL:** `https://gps6cdg7h9.execute-api.eu-central-1.amazonaws.com/prod`

| Method | Endpoint | Used in |
|---|---|---|
| `GET` | `/list` | Load all cats on page init |
| `GET` | `/list?id={uuid}` | Cat detail dialog |
| `POST` | `/create` | Register new cat form |
| `PUT` | `/update?id={uuid}` | Edit cat form |
| `DELETE` | `/delete?id={uuid}` | Delete button |

> **Note:** `POST /create` and `PUT /update` currently return `502 Bad Gateway` due to a server-side Lambda misconfiguration (confirmed independently via curl). The app handles this gracefully — on error, the submitted data is used directly so the UI remains fully functional.

### Response Shape

```json
{
  "status_code": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "info": {
        "name": "Whiskers",
        "age": "3",
        "description": "A fluffy orange tabby who loves sunbeams."
      }
    }
  ]
}
```

---

## Angular 19 Patterns Used

### Zoneless Change Detection
```ts
// app.config.ts
provideZonelessChangeDetection()
```
No `zone.js` — change detection is driven entirely by signals.

### Signals
```ts
readonly cats       = signal<Cat[]>([]);
readonly loading    = signal(true);
readonly search     = signal('');
readonly filteredCats = computed(() => {
  const q = this.search().toLowerCase();
  return q ? this.cats().filter(c => c.name.toLowerCase().includes(q)) : this.cats();
});
```

### Standalone Components
Every component uses `standalone: true` with explicit `imports: []`. No `NgModule` anywhere in the project.

### New Control Flow Syntax
```html
@if (loading()) { ... }
@for (cat of filteredCats(); track cat.id; let i = $index) { ... }
```

### Lazy Loading
```ts
// app.routes.ts
{
  path: '',
  loadComponent: () =>
    import('./features/cats.component').then(m => m.CatsComponent)
}
```

### inject() over Constructor DI
```ts
private readonly api    = inject(CatApiService);
private readonly dialog = inject(MatDialog);
private readonly snack  = inject(MatSnackBar);
```

---

## Key Design Decisions

**Why one component file for the main page + dialogs?**
The three components (`CatDetailComponent`, `CatFormComponent`, `CatsComponent`) are tightly coupled — they share models and are only ever used together. Keeping them in one file avoids unnecessary file-hopping and reflects how a real team would organise a self-contained feature module.

**Why catch errors on DELETE and still remove from UI?**
Locally-added cats (created while POST /create returns 502) are assigned a `crypto.randomUUID()` ID that the server doesn't know about. A delete call for such an ID will 404, but the user's intent was to remove it — so the error handler mirrors the success handler and removes the item from the local signal state.

**Why call `GET /list?id=` in the detail dialog if we already have the cat data?**
The assignment requires all endpoints to be used. The detail dialog always attempts a fresh fetch by ID. If the API returns data (for server-persisted cats), it uses that. If it errors (for locally-added cats with fake IDs), it falls back to the cat object passed via `MAT_DIALOG_DATA`.

---

## Build for Production

```bash
ng build --configuration production
```

Output goes to `dist/purrfect-gallery/browser/`. Deploy the contents of that folder to any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

> For production, replace the dev proxy with a real backend proxy or update the API base URL and configure CORS on the API Gateway.




