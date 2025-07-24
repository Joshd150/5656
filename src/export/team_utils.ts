// Team utility functions that enhance existing functionality without modification
// These functions work alongside the existing team system

import { Team } from './madden_league_types';
import { 
  isExpansionTeam, 
  getExpansionTeamMapping, 
  getTeamDisplayName, 
  getTeamLogoId,
  autoDetectExpansionTeams,
  EXPANSION_TEAMS
} from './expansion_teams';

/**
 * Enhanced team processing that maintains compatibility with existing systems
 * This function can be called after team data is loaded to enhance it with expansion team support
 */
export function enhanceTeamData(teams: Team[]): Team[] {
  // Auto-detect expansion teams first
  autoDetectExpansionTeams(teams);
  
  // Enhance each team with expansion team data if applicable
  return teams.map(team => {
    const mapping = getExpansionTeamMapping(team.teamId);
    if (mapping) {
      // Create enhanced team object that maintains all original properties
      // but updates display information for expansion teams
      return {
        ...team,
        displayName: getTeamDisplayName(team.teamId, team.displayName),
        nickName: mapping.expansionName,
        // Preserve original data for system compatibility
        originalDisplayName: team.displayName,
        originalNickName: team.nickName,
        // Update logo if expansion team has custom logo
        logoId: getTeamLogoId(team.teamId, team.logoId),
        // Mark as expansion team for identification
        isExpansionTeam: true
      };
    }
    
    // Return original team data unchanged for non-expansion teams
    return {
      ...team,
      isExpansionTeam: false
    };
  });
}

/**
 * Gets team name for channel creation - handles expansion teams
 * This ensures channels are created correctly for both original and expansion teams
 */
export function getTeamNameForChannel(team: Team): string {
  const mapping = getExpansionTeamMapping(team.teamId);
  if (mapping) {
    return mapping.expansionName.toLowerCase().replace(/\s+/g, '-');
  }
  return team.displayName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Gets team abbreviation for display - handles expansion teams
 */
export function getTeamAbbreviation(team: Team): string {
  const mapping = getExpansionTeamMapping(team.teamId);
  if (mapping) {
    // Generate abbreviation from expansion team name
    const words = mapping.expansionName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    return words.map(word => word.charAt(0)).join('').toUpperCase().substring(0, 3);
  }
  return team.abbrName;
}

/**
 * Validates division integrity - ensures 32 teams are maintained
 * This function can be used to verify that team relocations don't break division structure
 */
export function validateDivisionIntegrity(teams: Team[]): boolean {
  // Count teams per division
  const divisionCounts = new Map<string, number>();
  
  teams.forEach(team => {
    const divName = team.divName;
    divisionCounts.set(divName, (divisionCounts.get(divName) || 0) + 1);
  });
  
  // Each division should have exactly 4 teams
  for (const [division, count] of divisionCounts) {
    if (count !== 4) {
      console.warn(`Division ${division} has ${count} teams instead of 4`);
      return false;
    }
  }
  
  // Total should be 32 teams
  return teams.length === 32;
}

/**
 * Gets formatted team message name that works with expansion teams
 * This maintains compatibility with existing message formatting
 */
export function getFormattedTeamName(team: Team, includeRecord?: boolean): string {
  const displayName = getTeamDisplayName(team.teamId, team.displayName);
  
  if (includeRecord && team.totalWins !== undefined && team.totalLosses !== undefined) {
    const record = team.totalTies && team.totalTies > 0 
      ? `${team.totalWins}-${team.totalLosses}-${team.totalTies}`
      : `${team.totalWins}-${team.totalLosses}`;
    return `${displayName} (${record})`;
  }
  
  return displayName;
}

/**
 * Creates a team search index that includes expansion teams
 * This enhances the existing search functionality without modifying it
 */
export function createEnhancedTeamSearchIndex(teams: Team[]): Record<string, any> {
  const searchIndex: Record<string, any> = {};
  
  teams.forEach(team => {
    const mapping = getExpansionTeamMapping(team.teamId);
    
    searchIndex[team.teamId] = {
      cityName: team.cityName,
      abbrName: getTeamAbbreviation(team),
      nickName: mapping ? mapping.expansionName : team.nickName,
      displayName: getTeamDisplayName(team.teamId, team.displayName),
      id: team.teamId,
      // Include original names for backward compatibility
      originalNickName: team.nickName,
      originalDisplayName: team.displayName,
      isExpansionTeam: !!mapping
    };
  });
  
  return searchIndex;
}

/**
 * Sorts teams for division display, maintaining proper order with expansion teams
 */
export function sortTeamsForDivisionDisplay(teams: Team[]): Team[] {
  return teams.sort((a, b) => {
    // First sort by division
    if (a.divName !== b.divName) {
      return a.divName.localeCompare(b.divName);
    }
    
    // Then by display name (which includes expansion team names)
    const aName = getTeamDisplayName(a.teamId, a.displayName);
    const bName = getTeamDisplayName(b.teamId, b.displayName);
    return aName.localeCompare(bName);
  });
}

/**
 * Gets team colors for expansion teams or defaults to original
 */
export function getTeamColors(team: Team): { primary: string; secondary: string; tertiary?: string } {
  const mapping = getExpansionTeamMapping(team.teamId);
  if (mapping) {
    const expansionTeam = EXPANSION_TEAMS[mapping.expansionName];
    if (expansionTeam) {
      return expansionTeam.colors;
    }
  }
  
  // Return default colors based on original team data
  return {
    primary: `#${team.primaryColor?.toString(16).padStart(6, '0') || '000000'}`,
    secondary: `#${team.secondaryColor?.toString(16).padStart(6, '0') || 'FFFFFF'}`
  };
}