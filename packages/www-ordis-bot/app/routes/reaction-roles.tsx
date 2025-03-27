import { Form, useActionData } from "@remix-run/react";

import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const messageId = formData.get("messageId");
  const emojiId = formData.get("emojiId");
  const roleId = formData.get("roleId");

  if (!messageId || !emojiId || !roleId) {
    return { error: "All fields are required" };
  }

  // Send to API
  const response = await fetch("http://api:33252/reaction-roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId, emojiId, roleId }),
  });

  if (!response.ok) {
    return { error: "Failed to send data" };
  }

  return { message: "Reaction role added successfully!" };
};

export default function ReactionRoles() {
  const actionData = useActionData<typeof action>(); // Use the defined type

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Add Reaction Role</h1>
      <Form method="post" className="flex flex-col gap-2">
        <input
          type="text"
          name="messageId"
          placeholder="Message ID"
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="emojiId"
          placeholder="Emoji ID"
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="roleId"
          placeholder="Role ID"
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit
        </button>
      </Form>

      {actionData?.message && (
        <p className="text-green-500">{actionData.message}</p>
      )}
      {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
    </div>
  );
}
