// Enhanced teams command that supports expansion teams
// This works alongside the existing teams command without modifying it

import { ParameterizedContext } from "koa";
import { CommandHandler, Command, AutocompleteHandler, Autocomplete } from "../commands_handler";
import { respond, createMessageResponse, DiscordClient } from "../discord_utils";
import { 
  APIApplicationCommandInteractionDataBooleanOption, 
  APIApplicationCommandInteractionDataChannelOption, 
  APIApplicationCommandInteractionDataRoleOption, 
  APIApplicationCommandInteractionDataStringOption, 
  APIApplicationCommandInteractionDataSubcommandOption, 
  APIApplicationCommandInteractionDataUserOption, 
  ApplicationCommandOptionType, 
  ChannelType, 
  RESTPostAPIApplicationCommandsJSONBody 
} from "discord-api-types/v10";
import { FieldValue, Firestore } from "firebase-admin/firestore";
import { ChannelId, DiscordIdType, LeagueSettings, MessageId, TeamAssignments } from "../settings_db";
import { getEnhancedLatestTeams } from "../../db/enhanced_madden_db";
import { formatEnhancedTeamMessage, validateEnhancedTeamReference, createEnhancedTeamSearchResults } from "../enhanced_team_utils";
import { discordLeagueView } from "../../db/view";

/**
 * Enhanced teams message fetcher that supports expansion teams
 */
export async function fetchEnhancedTeamsMessage(settings: LeagueSettings): Promise<string> {
  if (settings?.commands?.madden_league?.league_id) {
    const teamList = await getEnhancedLatestTeams(settings.commands.madden_league.league_id);
    const teams = teamList.getEnhancedLatestTeams();
    return formatEnhancedTeamMessage(teams, settings.commands.teams?.assignments || {});
  } else {
    return "# Teams\nNo Madden League connected. Connect Snallabot to your league and reconfigure";
  }
}

/**
 * Enhanced team assignment that works with expansion teams
 */
async function handleEnhancedTeamAssignment(
  teamSearchPhrase: string,
  userId: string,
  roleId: string | undefined,
  leagueSettings: LeagueSettings,
  guildId: string,
  db: Firestore,
  client: DiscordClient
): Promise<string> {
  if (!leagueSettings?.commands?.madden_league?.league_id) {
    throw new Error("No Madden league linked, setup the bot with your madden league first.");
  }
  
  if (!leagueSettings?.commands?.teams?.channel.id) {
    throw new Error("Teams not configured, run /teams configure first");
  }

  const leagueId = leagueSettings.commands.madden_league.league_id;
  const teamList = await getEnhancedLatestTeams(leagueId);
  
  // Validate team reference using enhanced validation
  const validation = validateEnhancedTeamReference(teamSearchPhrase, teamList);
  if (!validation.valid) {
    throw new Error(validation.error || "Team validation failed");
  }
  
  const assignedTeam = validation.team!;
  const roleAssignment = roleId ? { discord_role: { id: roleId, id_type: DiscordIdType.ROLE } } : {};
  
  const assignments = { 
    ...leagueSettings.commands.teams?.assignments, 
    [assignedTeam.teamId]: { 
      discord_user: { id: userId, id_type: DiscordIdType.USER }, 
      ...roleAssignment 
    } 
  };
  
  // Update settings
  leagueSettings.commands.teams.assignments = assignments;
  
  await db.collection("league_settings").doc(guildId).set({
    commands: {
      teams: {
        assignments: assignments
      }
    }
  }, { merge: true });

  // Update the teams message
  const message = formatEnhancedTeamMessage(teamList.getEnhancedLatestTeams(), assignments);
  
  try {
    await client.editMessage(
      leagueSettings.commands.teams.channel, 
      leagueSettings.commands.teams.messageId, 
      message, 
      []
    );
    return "Team Assigned";
  } catch (e) {
    return "Could not update teams message, this could be a permission issue. The assignment was saved, Error: " + e;
  }
}

/**
 * Enhanced team freeing that works with expansion teams
 */
async function handleEnhancedTeamFreeing(
  teamSearchPhrase: string,
  leagueSettings: LeagueSettings,
  guildId: string,
  db: Firestore,
  client: DiscordClient
): Promise<string> {
  if (!leagueSettings?.commands?.madden_league?.league_id) {
    throw new Error("No Madden league linked, setup the bot with your madden league first.");
  }
  
  if (!leagueSettings.commands.teams?.channel.id) {
    throw new Error("Teams not configured, run /teams configure first");
  }

  const leagueId = leagueSettings.commands.madden_league.league_id;
  const teamList = await getEnhancedLatestTeams(leagueId);
  
  // Validate team reference using enhanced validation
  const validation = validateEnhancedTeamReference(teamSearchPhrase, teamList);
  if (!validation.valid) {
    throw new Error(validation.error || "Team validation failed");
  }
  
  const teamToFree = validation.team!;
  const teamIdToDelete = teamToFree.teamId;
  
  const currentAssignments = { ...leagueSettings.commands.teams.assignments };
  delete currentAssignments[`${teamIdToDelete}`];
  
  leagueSettings.commands.teams.assignments = currentAssignments;
  
  await db.collection("league_settings").doc(guildId).update({
    [`commands.teams.assignments.${teamIdToDelete}`]: FieldValue.delete()
  });

  const message = formatEnhancedTeamMessage(teamList.getEnhancedLatestTeams(), currentAssignments);
  
  try {
    await client.editMessage(
      leagueSettings.commands.teams.channel, 
      leagueSettings.commands.teams.messageId, 
      message, 
      []
    );
    return "Team Freed";
  } catch (e) {
    return "Could not update teams message, this could be a permission issue. The assignment was freed, Error: " + e;
  }
}

/**
 * Enhanced autocomplete that includes expansion teams
 */
async function handleEnhancedTeamAutocomplete(command: Autocomplete): Promise<Array<{ name: string; value: string }>> {
  const { guild_id } = command;
  
  if (!command.data.options) {
    return [];
  }
  
  const options = command.data.options;
  const teamsCommand = options[0] as APIApplicationCommandInteractionDataSubcommandOption;
  
  const view = await discordLeagueView.createView(guild_id);
  const leagueId = view?.leagueId;
  
  if (leagueId && (teamsCommand?.options?.[0] as APIApplicationCommandInteractionDataStringOption)?.focused && teamsCommand?.options?.[0]?.value) {
    const teamSearchPhrase = teamsCommand.options[0].value as string;
    const teamList = await getEnhancedLatestTeams(leagueId);
    
    return createEnhancedTeamSearchResults(teamSearchPhrase, teamList, 25);
  }
  
  return [];
}

// Export the enhanced functionality for use in the existing teams command
export const enhancedTeamsHandlers = {
  fetchEnhancedTeamsMessage,
  handleEnhancedTeamAssignment,
  handleEnhancedTeamFreeing,
  handleEnhancedTeamAutocomplete
};