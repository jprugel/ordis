import { NavLink } from "@remix-run/react";

export default function Sidebar() {
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
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reaction-roles"
              className={({ isActive }) =>
                `block p-2 rounded ${
                  isActive ? "bg-gray-700" : "hover:bg-gray-700"
                }`
              }
            >
              Reaction Roles
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reaction-roles-view"
              className={({ isActive }) =>
                `block p-2 rounded ${
                  isActive ? "bg-gray-700" : "hover:bg-gray-700"
                }`
              }
            >
              Reaction Roles View
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
