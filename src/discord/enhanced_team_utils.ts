// Enhanced Discord team utilities that support expansion teams
// These functions work alongside existing Discord functionality

import { Team } from '../export/madden_league_types';
import { getTeamNameForChannel, getFormattedTeamName, createEnhancedTeamSearchIndex } from '../export/team_utils';
import { EnhancedTeamList } from '../db/enhanced_madden_db';
import { TeamAssignments } from './settings_db';

/**
 * Enhanced team message formatting that supports expansion teams
 * This maintains compatibility with existing message formatting
 */
export function formatEnhancedTeamMessage(teams: Team[], teamAssignments: TeamAssignments): string {
  const header = "# Teams";
  
  // Group teams by division and sort them properly
  const teamsByDivision = Object.entries(Object.groupBy(teams, team => team.divName))
    .sort((entry1, entry2) => entry1[0].localeCompare(entry2[0]));
  
  const teamsMessage = teamsByDivision.map(entry => {
    const divisionalTeams = entry[1] || [];
    const divisionName = entry[0];
    
    const divisionMessage = divisionalTeams
      .sort((t1, t2) => {
        const name1 = getFormattedTeamName(t1);
        const name2 = getFormattedTeamName(t2);
        return name1.localeCompare(name2);
      })
      .map(team => {
        const user = teamAssignments?.[`${team.teamId}`]?.discord_user?.id;
        const consoleUser = team.userName;
        const assignment = [
          user ? [`<@${user}>`] : [], 
          [consoleUser ? `\`${consoleUser}\`` : "`CPU`"]
        ].flat().join(", ");
        
        const teamName = getFormattedTeamName(team);
        return `${teamName}: ${assignment}`;
      }).join("\n");
    
    const divisionHeader = `__**${divisionName}**__`;
    return `${divisionHeader}\n${divisionMessage}`;
  }).join("\n");

  // Calculate open teams (those without Discord user assignments)
  const openTeams = teams
    .filter(t => !teamAssignments?.[`${t.teamId}`]?.discord_user?.id)
    .map(t => getFormattedTeamName(t))
    .join(", ");
  
  const openTeamsMessage = `OPEN TEAMS: ${openTeams}`;
  return `${header}\n${teamsMessage}\n\n${openTeamsMessage}`;
}

/**
 * Enhanced channel name generation that works with expansion teams
 * This ensures proper channel creation for both original and expansion teams
 */
export function generateEnhancedChannelName(awayTeam: Team, homeTeam: Team): string {
  const awayName = getTeamNameForChannel(awayTeam);
  const homeName = getTeamNameForChannel(homeTeam);
  return `${awayName}-at-${homeName}`;
}

/**
 * Enhanced team search that includes expansion teams
 * This works with the existing autocomplete functionality
 */
export function createEnhancedTeamSearchResults(
  searchPhrase: string, 
  teamList: EnhancedTeamList,
  limit: number = 25
): Array<{ name: string; value: string }> {
  const teams = teamList.getEnhancedLatestTeams();
  const searchIndex = createEnhancedTeamSearchIndex(teams);
  
  // Simple fuzzy search implementation
  const results = Object.values(searchIndex)
    .filter((team: any) => {
      const searchLower = searchPhrase.toLowerCase();
      return (
        team.displayName.toLowerCase().includes(searchLower) ||
        team.cityName.toLowerCase().includes(searchLower) ||
        team.nickName.toLowerCase().includes(searchLower) ||
        team.abbrName.toLowerCase().includes(searchLower) ||
        // Also search original names for backward compatibility
        team.originalDisplayName?.toLowerCase().includes(searchLower) ||
        team.originalNickName?.toLowerCase().includes(searchLower)
      );
    })
    .slice(0, limit)
    .map((team: any) => ({
      name: team.displayName,
      value: team.displayName
    }));
  
  return results;
}

/**
 * Enhanced team validation for Discord commands
 * This ensures team references work correctly with expansion teams
 */
export function validateEnhancedTeamReference(
  teamReference: string,
  teamList: EnhancedTeamList
): { valid: boolean; team?: Team; error?: string } {
  const teams = teamList.getEnhancedLatestTeams();
  const searchIndex = createEnhancedTeamSearchIndex(teams);
  
  // Try exact match first
  const exactMatch = Object.values(searchIndex).find((team: any) => 
    team.displayName.toLowerCase() === teamReference.toLowerCase() ||
    team.nickName.toLowerCase() === teamReference.toLowerCase() ||
    team.abbrName.toLowerCase() === teamReference.toLowerCase()
  );
  
  if (exactMatch) {
    const team = teamList.getEnhancedTeamForId(exactMatch.id);
    return { valid: true, team };
  }
  
  // Try partial match
  const partialMatches = Object.values(searchIndex).filter((team: any) => 
    team.displayName.toLowerCase().includes(teamReference.toLowerCase()) ||
    team.cityName.toLowerCase().includes(teamReference.toLowerCase()) ||
    team.nickName.toLowerCase().includes(teamReference.toLowerCase())
  );
  
  if (partialMatches.length === 1) {
    const team = teamList.getEnhancedTeamForId(partialMatches[0].id);
    return { valid: true, team };
  } else if (partialMatches.length > 1) {
    const teamNames = partialMatches.map((t: any) => t.displayName).join(", ");
    return { 
      valid: false, 
      error: `Multiple teams found for "${teamReference}": ${teamNames}. Please be more specific.`
    };
  }
  
  return { 
    valid: false, 
    error: `No team found for "${teamReference}". Please check the team name and try again.`
  };
}

/**
 * Gets team emoji or logo representation for Discord messages
 * This can be enhanced to support custom expansion team logos
 */
export function getTeamEmoji(team: Team): string {
  // For now, return a generic emoji based on team name
  // This can be enhanced with custom expansion team emojis
  const teamName = getFormattedTeamName(team).toLowerCase();
  
  // Simple emoji mapping for expansion teams
  if (teamName.includes('dragon')) return '🐉';
  if (teamName.includes('eagle')) return '🦅';
  if (teamName.includes('tiger')) return '🐅';
  if (teamName.includes('bull')) return '🐂';
  if (teamName.includes('wolf') || teamName.includes('husky')) return '🐺';
  if (teamName.includes('hawk')) return '🦅';
  if (teamName.includes('knight')) return '⚔️';
  if (teamName.includes('wizard')) return '🧙';
  if (teamName.includes('pioneer')) return '🤠';
  if (teamName.includes('shamrock')) return '🍀';
  
  // Default emoji for all teams
  return '🏈';
}