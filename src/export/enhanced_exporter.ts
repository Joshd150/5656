// Enhanced exporter that handles expansion teams in data export
// This ensures expansion team data is properly exported while maintaining compatibility

import { Team, TeamExport } from './madden_league_types';
import { enhanceTeamData } from './team_utils';
import { SnallabotEvent } from '../db/events_db';
import MaddenDB from '../db/madden_db';

/**
 * Enhanced team export that includes expansion team data
 * This function processes team exports to include expansion team information
 */
export function enhanceTeamExport(teamExport: TeamExport): TeamExport {
  if (!teamExport.success || !teamExport.leagueTeamInfoList) {
    return teamExport;
  }
  
  // Enhance the team data with expansion team information
  const enhancedTeams = enhanceTeamData(teamExport.leagueTeamInfoList);
  
  return {
    ...teamExport,
    leagueTeamInfoList: enhancedTeams
  };
}

/**
 * Enhanced team event processing for database storage
 * This ensures expansion team data is properly stored in the database
 */
export function enhanceTeamEvents(teams: Team[]): Array<SnallabotEvent<Team>> {
  const enhancedTeams = enhanceTeamData(teams);
  
  return enhancedTeams.map(team => ({
    key: team.teamId.toString(), // Use team ID as key for consistency
    event_type: "MADDEN_TEAM",
    platform: team.platform || "unknown",
    ...team
  }));
}

/**
 * Enhanced team data validation for exports
 * This ensures data integrity when expansion teams are involved
 */
export function validateEnhancedTeamExport(teamExport: TeamExport): {
  valid: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  if (!teamExport.success) {
    issues.push("Team export marked as unsuccessful");
    return { valid: false, issues, warnings };
  }
  
  if (!teamExport.leagueTeamInfoList || teamExport.leagueTeamInfoList.length === 0) {
    issues.push("No team data in export");
    return { valid: false, issues, warnings };
  }
  
  const teams = teamExport.leagueTeamInfoList;
  
  // Check team count
  if (teams.length !== 32) {
    issues.push(`Expected 32 teams, found ${teams.length}`);
  }
  
  // Check for duplicate team IDs
  const teamIds = teams.map(t => t.teamId);
  const uniqueTeamIds = new Set(teamIds);
  if (teamIds.length !== uniqueTeamIds.size) {
    issues.push("Duplicate team IDs found in export");
  }
  
  // Check division structure
  const divisionCounts = new Map<string, number>();
  teams.forEach(team => {
    const divName = team.divName;
    divisionCounts.set(divName, (divisionCounts.get(divName) || 0) + 1);
  });
  
  // Validate division counts
  for (const [division, count] of divisionCounts) {
    if (count !== 4) {
      issues.push(`Division ${division} has ${count} teams instead of 4`);
    }
  }
  
  // Check for expansion teams and add warnings
  const enhancedTeams = enhanceTeamData(teams);
  const expansionTeams = enhancedTeams.filter(t => (t as any).isExpansionTeam);
  
  if (expansionTeams.length > 0) {
    warnings.push(`Found ${expansionTeams.length} expansion teams: ${expansionTeams.map(t => t.displayName).join(', ')}`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * Enhanced team data processor for incoming exports
 * This function should be called when processing team data from EA
 */
export async function processEnhancedTeamData(
  leagueId: string,
  teamExport: TeamExport
): Promise<void> {
  // Validate the export first
  const validation = validateEnhancedTeamExport(teamExport);
  
  if (!validation.valid) {
    console.error(`Team export validation failed for league ${leagueId}:`, validation.issues);
    throw new Error(`Team export validation failed: ${validation.issues.join(', ')}`);
  }
  
  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn(`Team export warnings for league ${leagueId}:`, validation.warnings);
  }
  
  // Enhance the team export
  const enhancedExport = enhanceTeamExport(teamExport);
  
  // Process the enhanced teams for database storage
  const teamEvents = enhanceTeamEvents(enhancedExport.leagueTeamInfoList);
  
  // Store in database using existing functionality
  await MaddenDB.appendEvents(teamEvents, (team: Team) => `${team.teamId}`);
}

/**
 * Enhanced team lookup that works with both original and expansion teams
 */
export function findTeamByName(
  teams: Team[],
  searchName: string
): Team | undefined {
  const enhancedTeams = enhanceTeamData(teams);
  const searchLower = searchName.toLowerCase();
  
  // Try exact matches first
  let match = enhancedTeams.find(team => 
    team.displayName.toLowerCase() === searchLower ||
    team.nickName.toLowerCase() === searchLower ||
    team.abbrName.toLowerCase() === searchLower
  );
  
  if (match) return match;
  
  // Try partial matches
  match = enhancedTeams.find(team =>
    team.displayName.toLowerCase().includes(searchLower) ||
    team.nickName.toLowerCase().includes(searchLower) ||
    team.cityName.toLowerCase().includes(searchLower)
  );
  
  return match;
}

/**
 * Enhanced team comparison for detecting changes
 * This helps identify when teams have been relocated to expansion teams
 */
export function compareTeamData(
  oldTeams: Team[],
  newTeams: Team[]
): {
  relocated: Array<{ oldTeam: Team; newTeam: Team }>;
  unchanged: Team[];
  issues: string[];
} {
  const relocated: Array<{ oldTeam: Team; newTeam: Team }> = [];
  const unchanged: Team[] = [];
  const issues: string[] = [];
  
  // Create maps for efficient lookup
  const oldTeamMap = new Map(oldTeams.map(t => [t.teamId, t]));
  const newTeamMap = new Map(newTeams.map(t => [t.teamId, t]));
  
  // Check each team for changes
  newTeams.forEach(newTeam => {
    const oldTeam = oldTeamMap.get(newTeam.teamId);
    
    if (!oldTeam) {
      issues.push(`New team found with ID ${newTeam.teamId}: ${newTeam.displayName}`);
      return;
    }
    
    // Check if team has been relocated (name changed)
    if (oldTeam.displayName !== newTeam.displayName || 
        oldTeam.nickName !== newTeam.nickName ||
        oldTeam.cityName !== newTeam.cityName) {
      relocated.push({ oldTeam, newTeam });
    } else {
      unchanged.push(newTeam);
    }
  });
  
  // Check for missing teams
  oldTeams.forEach(oldTeam => {
    if (!newTeamMap.has(oldTeam.teamId)) {
      issues.push(`Team missing in new data: ${oldTeam.displayName} (ID: ${oldTeam.teamId})`);
    }
  });
  
  return { relocated, unchanged, issues };
}