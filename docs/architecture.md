# NeurolinkX Architecture Brief

## Rendering Strategy

NeurolinkX's frontend strategy strictly utilizes Next.js 15 with the App Router to optimize our rendering paradigms. Due to the diverse nature of our analytical dashboard, a hybrid rendering approach is strictly preferred for optimal perceived performance, scale, and Search Engine Optimization (SEO).

1. **Static Site Generation (SSG) / ISR (Incremental Static Regeneration)**
   - **Routes:** Marketing pages, Login, Signup, Docs.
   - **Why:** These pages don't rely heavily on user-specific personalized data. We ship highly optimized static assets from edge CDNs resulting in a Time to First Byte (TTFB) well under 200ms. SEO is maximized here since web crawlers receive immediate HTML.

2. **Server-Side Rendering (SSR) / React Server Components (RSC)**
   - **Routes:** Core Dashboard Home, Analytical Summaries.
   - **Why:** To prevent heavy client-side JavaScript execution, we leverage Server Components. Server-side data fetching reduces bundle sizes significantly. HTML is streamed into the UI enabling progressive rendering. By preventing "waterfall" API queries seen in generic CSR, we lower Largest Contentful Paint (LCP) times on authenticated pages.

3. **Client-Side Rendering (CSR)**
   - **Routes:** Shipment Data Tables, Interactive Maps, Settings Forms.
   - **Why:** Highly interactive components like TanStack React Tables with sorting, filtering, and real-time polling require rich client-side lifecycle management and Zustand store interaction. We rely on SSR for the shell and let CSR handle interactive segments (`"use client"`).

## Component Architecture

A frontend monorepo supporting 50+ engineers demands rigid boundaries to avoid spaghetti code, prop-drilling, and cyclic dependencies. The structure leans heavily toward a **Feature-Based (Vertical Slices)** approach over purely Layer-Based (Horizontal Slices).

**Repository Structure:**
```
/apps
  /dashboard         # Core SaaS Application
  /marketing         # Landing Pages
/packages
  /ui                # Shared Design System (Buttons, Modals, Inputs)
  /store             # Global Zustand stores
  /api               # Fetchers, schemas (zod), and React Query hooks
```

**Why Feature-Based?**
In a Layer-Based structure, a single feature (e.g., `Shipments`) has code scattered across `/components`, `/hooks`, and `/services`. In our Feature-Based approach, we co-locate domains:
`/src/features/shipments` contains its own API hooks, utility functions, and complex components.

**Component Boundaries:**
- **Atomic Components:** Strict UI presentational components (found in `/packages/ui` or `/src/components/ui`). They accept props and emit events. No data-fetching logic allowed.
- **Smart/Feature Components:** Tied to distinct domains (e.g., `ShipmentTable`). They directly import React Query hooks and Zustand stores to hydrate Atomic Components.
- **Page/Layout Components:** Responsible configuring layout suspense boundaries and error boundaries.

## State Management at Scale

Handling UI state and server state differently is crucial for maintaining an application of this scale.

**Server State -> TanStack Query:**
Instead of caching server data in a global UI store, React Query serves as our asynchronous state manager. It handles background fetching, caching, and stale-time logic out-of-the-box. This resolves 80% of what used to be a "God Store" like Redux.

**UI State -> Zustand:**
At 100+ components, Zustand is lightweight, avoids the boilerplate of Redux, and crucially prevents unnecessary re-renders when selectively subscribing to state slices.
- *When does Zustand break down?* When developers misuse it by stuffing large JSON datasets, forms, or server responses into it.
- *Solution:* We slice our Zustand stores per domain (e.g., `useSidebarStore`, `useNotificationStore`). For cross-feature state communication, we avoid "God Stores" by utilizing specific selector-based subscriptions or passing derived data down to tightly bound feature components.

**Forms:** We explicitly avoid global stores for form state, utilizing **React Hook Form** to handle deeply nested and complex validations (with Zod) seamlessly without triggering whole-app lifecycle re-renders.

## Performance at 2M MAU

Serving 2 million Monthly Active Users (MAU) dynamically requires offloading computational weight.

1. **CDN Strategy & Edge Caching:**
   - Static assets (JS, CSS, Images) are deployed directly to a global edge network (e.g., Vercel Edge Network or Cloudflare).
   - We utilize `Cache-Control: s-maxage=31536000, immutable` for hashed assets.
   - Edge Middleware dynamically routes unauthenticated users away from app internals, preventing unnecessary hits to Origin servers.

2. **Image Optimization Pipeline:**
   - `next/image` is utilized to serve WebP/AVIF formats conditionally based on the `Accept` header of the user's browser.
   - Images are lazy-loaded by default, ensuring LCP targets metrics < 2.0s.

3. **Handling 10x Traffic Spikes:**
   - **Graceful Degradation:** When the backend API begins to slow, React Query gracefully continues serving cached stale data while background queries silently fail.
   - **Streaming & Suspense:** Under heavy load, our Next.js architecture streams UI shells immediately, ensuring the user sees interactivity while backend queries are resolved sequentially.

## Security Considerations

Enterprise FinTech and Logistics platforms have a zero-tolerance policy for data leaks.

1. **XSS (Cross-Site Scripting) Prevention:**
   - React inherently escapes string variables passed to the DOM, shielding us from basic DOM-based XSS. We enforce ESLint rules preventing the usage of `dangerouslySetInnerHTML` outside of tightly controlled, sanitized (e.g., using DOMPurify) rich-text rendering environments.
2. **CSRF (Cross-Site Request Forgery) Protection:**
   - Using NextAuth/Auth.js handles CSRF tokens naturally. All mutation requests to our API require standard CSRF validation.
3. **JWT and Identity Handling:**
   - JWTs are **never** stored in `localStorage` or `sessionStorage` where they remain vulnerable to XSS.
   - Access tokens are stored as `HttpOnly`, `Secure`, and `SameSite=Strict` cookies, completely inaccessible to JavaScript.
4. **Content Security Policy (CSP):**
   - We enforce strict CSP headers (`default-src 'self'`) blocking inline scripts and unauthorized external script execution to mitigate injection attempts.

## Trade-off Analysis

**Decision 1: React Query & Zustand vs. Redux Toolkit**
- **Alternative Considered:** Redux Toolkit (RTK) with RTK Query.
- **Why we chose our approach:** Zustand provides a fraction of the boilerplate, and its selective hook-based subscriptions integrate cleanly with concurrent React 19 features. React Query has superior integration for optimistic updates right out of the box compared to standard RTK implementations.
- **At 10x scale:** If our cross-slice dependencies become highly relational and complex, debugging Zustand could become difficult. At 10x scale with strict event-sourcing requirements, migrating back to Redux for its robust DevTools and strict immutability pipeline might be reconsidered.

**Decision 2: Feature-Based Architecture vs. Pure Micro-frontends**
- **Alternative Considered:** Module Federation (Micro-frontends) splitting the application into distinct independently deployed React apps.
- **Why we chose our approach:** Micro-frontends introduce massive pipeline complexity and shared-dependency version mismatches. A tightly regulated feature-based Monorepo utilizing Turborepo ensures maximum build-time caching and unified design system typings without the deployment overhead.
- **At 10x scale:** If the engineering team scales beyond 300+, forcing all pipelines through a single Monorepo choke point might drastically slow CI/CD. At that massive scale, exploring federated applications for independent Domain Driven Teams would be a logical pivot.

---

## Architecture Diagram (Mermaid)

```mermaid
architecture-beta
    group frontend(cloud)[Frontend Monorepo]
    group feature(cloud)[Features]
    group shared(cloud)[Packages]

    service nextapp(internet)[Next.js 15 App Router] in frontend
    
    service dashboard(server)[Dashboard] in feature
    service auth(server)[Auth System] in feature
    service shipments(server)[Shipments] in feature
    
    service state(database)[Zustand / TanStack] in shared
    service ui(disk)[UI Design System] in shared
    
    nextapp:R --> L:dashboard
    nextapp:R --> L:auth
    nextapp:R --> L:shipments
    
    dashboard:B --> T:state
    shipments:B --> T:state
    auth:B --> T:ui
    dashboard:B --> T:ui
```
