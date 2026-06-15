import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router";
import * as Sentry from "@sentry/react";

import type { Route } from "./+types/root";
import "./app.css";
import { getAppUrl } from "./config/urls";
import { useEffect } from "react";
import { SENTRY_DSN } from "./config/constants";

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 1.0,
});

export function Layout({ children }: { children: React.ReactNode }) {
  const baseUrl = getAppUrl();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta
          name="fc:miniapp"
          content={`{"version":"1","imageUrl":"${baseUrl}/hero.png","button":{"title":"join pet rock life","action":{"type":"launch_miniapp","url":"${baseUrl}","name":"Pet Rock Life","splashImageUrl":"${baseUrl}/splash.png","splashBackgroundColor":"#FEC3A6"}}}`}
        />
        <meta
          name="fc:frame"
          content={`{"version":"1","imageUrl":"${baseUrl}/hero.png","button":{"title":"join pet rock life","action":{"type":"launch_frame","url":"${baseUrl}","name":"Pet Rock Life","splashImageUrl":"${baseUrl}/splash.png","splashBackgroundColor":"#FEC3A6"}}}`}
        />
        <link rel="icon" type="image/png" href="/icon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  Sentry.captureException(error);

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
