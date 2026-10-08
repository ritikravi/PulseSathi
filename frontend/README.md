# PulseLoop Frontend

React + TypeScript + Vite frontend application.

## Setup

```bash
npm install
npm run dev
```

## Tech Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **React Router**: Navigation
- **TanStack Query**: Data fetching
- **Zustand**: State management
- **Recharts**: Data visualization
- **Lucide React**: Icons

## Project Structure

```
src/
├── components/
│   └── Layout.tsx           # Main layout with navigation
├── pages/
│   ├── LoginPage.tsx        # Authentication
│   ├── DashboardPage.tsx    # Main dashboard
│   ├── PatternsPage.tsx     # Detected patterns
│   ├── ExperimentsPage.tsx  # Experiment list
│   ├── ExperimentDetailPage.tsx  # Experiment details & check-ins
│   ├── HistoryPage.tsx      # Data history
│   └── ProfilePage.tsx      # User profile
├── store/
│   └── authStore.ts         # Authentication state
├── lib/
│   └── api.ts               # API client
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## Pages

### Login
- Demo credentials pre-filled
- JWT token storage
- Role-based routing

### Dashboard
- Health summary cards
- Glucose trend chart
- Active patterns
- Active experiment
- Pattern discovery CTA

### Patterns
- List of detected patterns
- Confidence scores
- Statistical details
- Create experiment from pattern
- Dismiss patterns

### Experiments
- List of all experiments
- Status badges (active, completed, abandoned)
- Progress tracking

### Experiment Detail
- Hypothesis and intervention details
- Daily check-in form
- Check-in history
- Complete experiment
- Results visualization

## State Management

### Zustand Store (authStore)
- User data
- JWT token
- Authentication state
- Logout function

### TanStack Query
- API data fetching
- Caching
- Automatic refetching
- Query invalidation

## API Integration

All API calls through `lib/api.ts`:
- Automatic JWT header injection
- 401 handling (auto logout)
- Typed responses

## Styling

### TailwindCSS Custom Classes
- `.btn` - Base button
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.card` - Card container
- `.input` - Form input

### Color Palette
- Primary: Blue (health/trust)
- Success: Green (positive outcomes)
- Warning: Orange (active states)
- Danger: Red (alerts)

## Environment

Vite proxy configuration in `vite.config.ts`:
- `/api` → `http://localhost:5000`

## Build

```bash
npm run build
```

Output: `dist/` directory

## Preview Production Build

```bash
npm run preview
```
