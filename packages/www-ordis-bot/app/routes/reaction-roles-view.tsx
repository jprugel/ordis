// biome-ignore lint/style/useImportType: <explanation>
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type ReactionRole = {
  id: number;
  messageId: string;
  emojiId: string;
  roleId: string;
};

export const loader: LoaderFunction = async () => {
  const apiUrl = "http://api:33252/reaction-roles";

  const response = await fetch(apiUrl);

  if (response.ok) {
    const data = await response.json();

    const formattedData = data.map((item: any) => ({
      id: item.id, // Keep ID if it exists
      messageId: item.messageid, // Fix lowercase
      emojiId: item.emojiid, // Fix lowercase
      roleId: item.roleid, // Fix lowercase
    }));

    return Response.json(formattedData);
  }

  // If there's an error fetching the data, handle it gracefully
  return Response.json([]);
};

export default function ReactionRolesView() {
  const reactionRoles = useLoaderData() as ReactionRole[];

  return (
    <div className="p-8 bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-6 text-gray-100">Reaction Roles</h2>

      <table className="min-w-full table-auto border-collapse border border-gray-700 bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Message ID
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Emoji ID
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Role ID
            </th>
          </tr>
        </thead>
        <tbody>
          {reactionRoles.length > 0 ? (
            reactionRoles.map((reaction) => (
              <tr
                key={reaction.id}
                className="hover:bg-gray-600 transition-colors duration-200"
              >
                <td className="px-6 py-4 text-sm">{reaction.messageId}</td>
                <td className="px-6 py-4 text-sm">{reaction.emojiId}</td>
                <td className="px-6 py-4 text-sm">{reaction.roleId}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-4 text-center text-sm text-gray-400"
              >
                No reaction roles available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
