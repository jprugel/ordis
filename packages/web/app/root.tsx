import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Sidebar from "./components/Sidebar";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";

import "./tailwind.css";
import path from "path";
import fs from "fs/promises";
import { IPlugin } from "common";

export type RootLoaderData = {
  plugins: IPlugin[];
};

export const loader: LoaderFunction = async () => {
  try {
    // Adjust this path to point to your plugins directory
    const pluginsPath = path.join(__dirname, "../../../plugins");
    const folders = await fs.readdir(pluginsPath, { withFileTypes: true });

    // I need to import entries and then work on that
    const plugins = [];
    for (const folder of folders) {
      const pluginPath = path.join(pluginsPath, folder.name);
      const module = await import(`${pluginPath}/index.ts`);
      const PluginClass = module.default || Object.values(module)[0];
      if (PluginClass?.prototype?.getUi) {
        const plugin = new PluginClass() as IPlugin;
        plugins.push(plugin);
      } else {
        console.warn(`⚠ ${module} doesn't implement the Plugin interface`);
      }
    }

    return Response.json({ plugins });
  } catch (error) {
    console.error("Error reading plugins directory:", error);
    return Response.json({ plugins: [] });
  }
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-screen">
        <Sidebar />
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
