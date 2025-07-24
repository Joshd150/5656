// Enhanced game channels functionality that supports expansion teams
// This works alongside existing game channel functionality

import { Team } from "../../export/madden_league_types";
import { getEnhancedLatestTeams } from "../../db/enhanced_madden_db";
import { generateEnhancedChannelName, getTeamEmoji } from "../enhanced_team_utils";
import { getFormattedTeamName } from "../../export/team_utils";
import { DiscordClient } from "../discord_utils";
import { CategoryId } from "../settings_db";

/**
 * Enhanced game channel creation that works with expansion teams
 */
export async function createEnhancedGameChannel(
  client: DiscordClient,
  guildId: string,
  awayTeam: Team,
  homeTeam: Team,
  category: CategoryId
): Promise<{ id: string; id_type: string }> {
  const channelName = generateEnhancedChannelName(awayTeam, homeTeam);
  return await client.createChannel(guildId, channelName, category);
}

/**
 * Enhanced game channel message that includes expansion team information
 */
export function createEnhancedGameChannelMessage(
  awayTeam: Team,
  homeTeam: Team,
  awayUser: string,
  homeUser: string,
  awayRecord: string,
  homeRecord: string,
  waitPing: number,
  adminRoleId: string
): string {
  const awayEmoji = getTeamEmoji(awayTeam);
  const homeEmoji = getTeamEmoji(homeTeam);
  const awayName = getFormattedTeamName(awayTeam);
  const homeName = getFormattedTeamName(homeTeam);
  
  const usersMessage = `${awayEmoji} ${awayUser} ${awayName} (${awayRecord}) at ${homeEmoji} ${homeUser} ${homeName} (${homeRecord})`;
  
  return (
    `**${usersMessage}**\n\n` +
    `:alarm_clock: **Time to schedule your game!**\n` +
    `Once your game is scheduled, hit the ⏰. Otherwise, you will be notified again every **${waitPing} hours**.\n\n` +
    `When you're done playing, let me know with 🏆 and I will delete the channel.\n` +
    `Need to sim this game? React with ⏭ **AND** select home/away to request a force win from <@&${adminRoleId}>. Choose both home and away for a fair sim! <@&${adminRoleId}> hit ⏭ to confirm!\n`
  );
}

/**
 * Enhanced scoreboard formatting that includes expansion teams
 */
export function formatEnhancedScoreboard(
  week: number,
  seasonIndex: number,
  games: any[],
  teamList: any,
  sims: any[],
  leagueId: string
): string {
  const gameToSim = new Map<number, any>();
  sims.filter(s => s.leagueId ? s.leagueId === leagueId : true)
    .forEach(sim => gameToSim.set(sim.scheduleId, sim));

  const scoreboardGames = games
    .sort((g1, g2) => g1.scheduleId - g2.scheduleId)
    .map(game => {
      const simMessage = gameToSim.has(game.scheduleId) ? 
        ` (${createSimMessage(gameToSim.get(game.scheduleId)!)})` : "";
      
      const awayTeam = teamList.getEnhancedTeamForId(game.awayTeamId);
      const homeTeam = teamList.getEnhancedTeamForId(game.homeTeamId);
      
      const awayTeamName = getFormattedTeamName(awayTeam);
      const homeTeamName = getFormattedTeamName(homeTeam);
      
      const awayEmoji = getTeamEmoji(awayTeam);
      const homeEmoji = getTeamEmoji(homeTeam);
      
      // Unplayed
      if (game.awayScore == 0 && game.homeScore == 0) {
        return `• ${awayEmoji} ${awayTeamName} vs ${homeEmoji} ${homeTeamName}${simMessage}`;
      }
      // Away win
      if (game.awayScore > game.homeScore) {
        return `• **${awayEmoji} ${awayTeamName} ${game.awayScore}** vs ${game.homeScore} ${homeEmoji} ${homeTeamName}${simMessage}`;
      }
      // Home win
      if (game.homeScore > game.awayScore) {
        return `• ${awayEmoji} ${awayTeamName} ${game.awayScore} vs **${game.homeScore} ${homeEmoji} ${homeTeamName}**${simMessage}`;
      }
      // Tie
      return `• ${awayEmoji} ${awayTeamName} ${game.awayScore} vs ${game.homeScore} ${homeEmoji} ${homeTeamName}${simMessage}`;
    })
    .join("\n");

  return `## ${seasonIndex + 2024} Season – Week ${week} Scoreboard\n${scoreboardGames}`;
}

function createSimMessage(sim: any): string {
  if (sim.result === "FAIR_SIM") return "Fair Sim";
  if (sim.result === "FORCE_WIN_AWAY") return "Force Win Away";
  if (sim.result === "FORCE_WIN_HOME") return "Force Win Home";
  throw new Error("Should not have gotten here! from createSimMessage");
}

/**
 * Enhanced team assignment validation for game channels
 */
export async function validateEnhancedTeamAssignments(
  leagueId: string,
  assignments: any
): Promise<{ valid: boolean; issues: string[] }> {
  const teamList = await getEnhancedLatestTeams(leagueId);
  const teams = teamList.getEnhancedLatestTeams();
  const issues: string[] = [];
  
  // Validate division structure
  if (!teamList.validateDivisionStructure()) {
    issues.push("Division structure is compromised - some divisions may not have 4 teams");
  }
  
  // Validate team count
  if (teams.length !== 32) {
    issues.push(`Expected 32 teams, found ${teams.length}`);
  }
  
  // Validate assignments reference valid teams
  Object.keys(assignments || {}).forEach(teamId => {
    try {
      teamList.getEnhancedTeamForId(Number(teamId));
    } catch (e) {
      issues.push(`Team assignment references invalid team ID: ${teamId}`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}