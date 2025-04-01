import { Outlet } from "@remix-run/react";

export default function PluginsLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
