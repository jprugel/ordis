import { SQL, sql } from "bun";

type ReactionRole = {
  messageId: string,
  emojiId: string,
  roleId: string,
};

// Ensure tables exist
async function ensureTablesExist() {
  console.log("🔄 Checking database schema...");

  await sql`
    CREATE TABLE IF NOT EXISTS reactionRoles (
      id SERIAL PRIMARY KEY,
      messageId TEXT NOT NULL,
      emojiId TEXT NOT NULL,
      roleId TEXT NOT NULL
    );
  `;

  console.log("✅ Database tables verified!");
}


const server = Bun.serve({
  port: 33252,
  routes: {
    "/plugins": {
      GET: async req => {
        ensurePluginTableExist();
        const plugins = await sql`
          SELECT name, version, enabled
          FROM plugins
        `;

        return Response.json(plugins);
      },
      POST: async req => {
        ensurePluginTableExist();
        const { name, version, enabled } = await req.json() as PluginInfo;
        insertPlugin(name, version, enabled);

        return new Response("Success", { status: 200 });
      }
    },
    "/reaction-roles/:messageId": async req => {
        const emojiToRole = await sql`
          SELECT emojiId, roleId
          FROM reactionRoles
          WHERE messageId = ${req.params.messageId}
        `;

        return new Response(JSON.stringify(emojiToRole));
    },
    "/reaction-roles": {
      POST: async req => {
        ensureTablesExist()
        const { messageId, emojiId, roleId } = await req.json() as ReactionRole;
        insertReactionRole(messageId, emojiId, roleId);
        return new Response("Success", { status: 200 })
      },
      GET: async req => {
        ensureTablesExist()
        const emojiToRole = await sql`
          SELECT id, messageId, emojiId, roleId
          FROM reactionRoles
        `;
        return Response.json(emojiToRole);
      },
    },
    "/reaction-roles/:id": {
      PATCH: async req => {
        ensureTablesExist()
        const { messageId, emojiId, roleId } = await req.json() as ReactionRole;
        console.log(messageId, emojiId, roleId);
        const result = await sql`
          UPDATE reactionRoles
          SET messageId = ${messageId}, emojiId = ${emojiId}, roleId = ${roleId}
          WHERE id = ${req.params.id}
          RETURNING *;
        `;

        return new Response("Sucess", { status: 200 });
      }
    }
  },
  fetch(request) {
    return new Response("Not Found", { status: 404 });
  },
});

async function insertReactionRole(
  messageId: string,
  emojiId: string,
  roleId:string
) {
  await sql`
    INSERT INTO reactionRoles (messageId, emojiId, roleId)
    VALUES (${messageId}, ${emojiId}, ${roleId})
  `;
}

async function insertPlugin(
  name: string,
  version: string,
  enabled: boolean,
) {
  await sql`
    INSERT INTO plugins (name, version, enabled)
    VALUES (${name}, ${version}, ${enabled})
  `;
}

class PluginInfo {
  name: string;
  version: string;
  enabled: boolean = true;

  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }
}

async function ensurePluginTableExist() {
  console.log("🔄 Checking database schema...");

  await sql`
    CREATE TABLE IF NOT EXISTS plugins (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      enabled BOOLEAN
    );
  `;

  console.log("✅ Database tables verified!");
}

console.log(`Listening on ${server.url}`);
