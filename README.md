# NeurolinkX Frontend Platform

> Enterprise-grade SaaS dashboard for logistics and analytics. Built for performance, scalability, and strict typography/design systems.

## Project Overview

This repository contains the frontend implementation for NeurolinkX's white-label analytics and logistics tracking platform. It mirrors a real-world enterprise Next.js App Router structure, leveraging strict TypeScript, a custom UI component library powered by Class Variance Authority (CVA), and optimistic server-state mutations.

## 🚀 Quick Start (One-Command Setup)

Ensure you have [Node.js](https://nodejs.org/) (v20+) and [pnpm](https://pnpm.io/) installed.

As requested by the assignment requirements, here is the singular command to install all dependencies and start the mock API / dev server simultaneously:

```bash
pnpm install && pnpm dev
```
*(If you are evaluating this on a system with standard npm, use `npm run setup` or `npm install && npm run dev`)*

The application will be available at `http://localhost:3000`.

## 🛠️ Testing

**Unit / Component Tests (Vitest & Testing Library)**
```bash
pnpm test
```

**End-to-End Tests (Playwright)**
```bash
pnpm test:e2e
```

## 🏗️ Technical Decisions Explained

- **Framework:** React 19 / TypeScript 5 (Strict Mode). Set up heavily to replicate a high-performance feature-based frontend architecture.
- **Styling & Design System:** Tailwind CSS v4 coupled with CSS variables (`globals.css`) ensures strict design token adherence without sacrificing developer experience. Components are structured with `class-variance-authority` (cva) for type-safe variants.
- **Data Fetching & Server State:** `TanStack Query (v5)` handles server state, caching, and optimistic updates. The shipment table specifically features an optimistic status update with automatic rollback on network failure.
- **Global UI State:** `Zustand` is utilized over React Context for lightweight, non-blocking state (e.g., sidebar toggling, dark mode, toast notifications) to prevent unnecessary top-down re-renders.
- **Data Grids:** `TanStack Table` handles complex client-side sorting and pagination headlessly, allowing for complete styling control and excellent rendering performance.

## 📚 Architecture Documentation

Detailed architectural decisions regarding Rendering Strategies, State Management at Scale (2M+ MAU), Component Boundaries, and Security can be found in our comprehensive architecture brief:

👉 **[Read the Architecture Brief](./docs/architecture.md)**

## ⚠️ Known Limitations

- **Mock API Data:** Currently, the API is simulated within `src/api/shipments.ts` utilizing artificial latency to demonstrate loading and error handling.
- **Authentication:** The login flow is currently covered via E2E test interception. A full NextAuth/Auth.js implementation using a credentials provider is mocked out for the SPA dashboard demonstration.
- **Responsiveness:** The complex datatable is optimized primarily for tablet and desktop viewports, with a simplified card-based view pending for mobile screens.

## 🔮 What I'd Improve (Next Steps)

1. **Real-time WebSockets/SSE:** Migrate the shipment tracking from standard polling/refetching to Server-Sent Events (SSE) for sub-second status deliveries.
2. **Advanced CI/CD Pipeline:** Implement GitHub Actions to enforce coverage thresholds >80%, automate Chromatic visual regression testing for the UI library, and trigger Vercel Preview Deployments.
3. **Advanced Accessibility Validation:** Incorporate `jest-axe` directly into our Vitest suite to prevent developers from merging PRs with critical WCAG 2.1 AA violations.
4. **React Server Components (RSC):** Shift read-heavy datatable queries completely to the server side using the Next.js App Router, serving zero-JS skeletons during initial load.
