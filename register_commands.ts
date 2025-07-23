process.env.PUBLIC_KEY = "e6a1b0559decf576d01c5700e56feec05a4c917e24ef3db1d0c152173e50ffc1";
process.env.DISCORD_TOKEN = "MTM5NDcwMTEyMDA5NzYyMDExMg.GywXfl.1WII0qHCGauYgUBMFTy4sdS2mfmzg7GeHZxZuM";
process.env.APP_ID = "1394701120097620112";

const GUILD_ID = "1396330332894003290";

import { commandsInstaller } from './src/discord/commands_handler';
import { createClient, CommandMode } from './src/discord/discord_utils';

const client = createClient({
  botToken: process.env.DISCORD_TOKEN!,
  appId: process.env.APP_ID!,
  publicKey: process.env.PUBLIC_KEY!,
});

async function main() {
  console.log("Registering all slash commands...");
  await commandsInstaller(client, [], CommandMode.INSTALL, GUILD_ID);
  console.log("✅ Slash commands registered successfully for guild:", GUILD_ID);
}

main().catch((err) => {
  console.error("Failed to register slash commands:", err);
  process.exit(1);
});
