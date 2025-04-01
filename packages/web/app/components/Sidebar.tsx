import { NavLink, useRouteLoaderData } from "@remix-run/react";
import { useState } from "react";

interface Plugin {
  name: string;
  version: string;
  id: string;
  enabled: boolean;
}

export default function Sidebar() {
  const [pluginsIsOpen, setPluginsIsOpen] = useState(false);
  const data = useRouteLoaderData("root") as { plugins: Plugin[] };

  const renderPluginList = () => {
    if (!data || !data.plugins) {
      return <li className="p-2 text-gray-400">Loading plugins...</li>;
    }

    if (data.plugins.length === 0) {
      return <li className="p-2 text-gray-400">No plugins available</li>;
    }

    return data.plugins.map((plugin) => (
      <li key={plugin.name}>
        <NavLink
          to={`/plugins/${plugin.id}`}
          className={({ isActive }) =>
            `block p-2 rounded ${
              isActive ? "bg-gray-700" : "hover:bg-gray-700"
            } flex items-center justify-between`
          }
        >
          <span>{plugin.name}</span>
          {!plugin.enabled && (
            <span className="text-xs bg-gray-600 px-2 py-1 rounded">
              Disabled
            </span>
          )}
        </NavLink>
      </li>
    ));
  };

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Menu</h2>
      <nav>
        <ul className="flex flex-col gap-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block p-2 rounded ${
                  isActive ? "bg-gray-700" : "hover:bg-gray-700"
                }`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <button
              onClick={() => setPluginsIsOpen(!pluginsIsOpen)}
              className="w-full p-2 rounded hover:bg-gray-700 text-left flex items-center justify-between"
            >
              <span>Plugins</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  pluginsIsOpen ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {pluginsIsOpen && (
              <ul className="ml-4 mt-2 space-y-2">{renderPluginList()}</ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}
