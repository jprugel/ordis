// plugins.$pluginName.tsx
import { useLoaderData, useParams } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { IPlugin, loadPlugins } from "common";
import path from "path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { pluginName } = params;
  const directory = path.join(__dirname, "../../../plugins");
  const plugins = await loadPlugins(directory);
  const plugin = plugins.find((plugin) => plugin.id === pluginName);
  const data = plugin?.getUiData?.();
  return Response.json({ plugin, data, directory });
}

export default async function PluginPage() {
  // Need to figure out how im going to get this bit working.
}
