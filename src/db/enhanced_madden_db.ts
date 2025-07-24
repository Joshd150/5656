// Enhanced Madden DB functions that work alongside existing functionality
// These functions provide expansion team support without modifying core database operations

import MaddenDB, { TeamList } from './madden_db';
import { Team } from '../export/madden_league_types';
import { enhanceTeamData, validateDivisionIntegrity, sortTeamsForDivisionDisplay } from '../export/team_utils';
import { TeamAssignments } from '../discord/settings_db';

/**
 * Enhanced team list that provides expansion team support
 * This wraps the existing TeamList functionality
 */
export interface EnhancedTeamList extends TeamList {
  getEnhancedTeamForId(id: number): Team;
  getEnhancedLatestTeams(): Team[];
  validateDivisionStructure(): boolean;
}

/**
 * Creates an enhanced team list that supports expansion teams
 * This function wraps the existing team list functionality
 */
export function createEnhancedTeamList(originalTeamList: TeamList): EnhancedTeamList {
  // Get the original teams and enhance them
  const originalTeams = originalTeamList.getLatestTeams();
  const enhancedTeams = enhanceTeamData(originalTeams);
  
  // Create lookup maps for performance
  const teamMap = new Map<number, Team>();
  enhancedTeams.forEach(team => {
    teamMap.set(team.teamId, team);
  });

  return {
    // Preserve all original functionality
    getTeamForId: originalTeamList.getTeamForId.bind(originalTeamList),
    getLatestTeams: originalTeamList.getLatestTeams.bind(originalTeamList),
    getLatestTeamAssignments: originalTeamList.getLatestTeamAssignments.bind(originalTeamList),
    
    // Enhanced functionality
    getEnhancedTeamForId(id: number): Team {
      const team = teamMap.get(id);
      if (team) {
        return team;
      }
      // Fallback to original functionality
      return originalTeamList.getTeamForId(id);
    },
    
    getEnhancedLatestTeams(): Team[] {
      return sortTeamsForDivisionDisplay(enhancedTeams);
    },
    
    validateDivisionStructure(): boolean {
      return validateDivisionIntegrity(enhancedTeams);
    }
  };
}

/**
 * Enhanced version of getLatestTeams that includes expansion team support
 * This can be used as a drop-in replacement for the original function
 */
export async function getEnhancedLatestTeams(leagueId: string): Promise<EnhancedTeamList> {
  const originalTeamList = await MaddenDB.getLatestTeams(leagueId);
  return createEnhancedTeamList(originalTeamList);
}

/**
 * Enhanced team assignments that work with expansion teams
 * This ensures team assignments work correctly even when teams are relocated
 */
export function getEnhancedTeamAssignments(
  teamList: EnhancedTeamList, 
  assignments: TeamAssignments
): TeamAssignments {
  const enhancedAssignments: TeamAssignments = {};
  
  // Process each assignment
  Object.entries(assignments).forEach(([teamId, assignment]) => {
    const team = teamList.getEnhancedTeamForId(Number(teamId));
    if (team) {
      // Use the team's current ID (which remains the same even for expansion teams)
      enhancedAssignments[teamId] = assignment;
    }
  });
  
  return enhancedAssignments;
}

/**
 * Validates that all teams in assignments exist and have proper structure
 */
export function validateTeamAssignments(
  teamList: EnhancedTeamList,
  assignments: TeamAssignments
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const teams = teamList.getEnhancedLatestTeams();
  
  // Check that all assigned teams exist
  Object.keys(assignments).forEach(teamId => {
    const team = teamList.getEnhancedTeamForId(Number(teamId));
    if (!team) {
      issues.push(`Team ID ${teamId} in assignments does not exist`);
    }
  });
  
  // Check division integrity
  if (!teamList.validateDivisionStructure()) {
    issues.push('Division structure is invalid - not all divisions have 4 teams');
  }
  
  // Check total team count
  if (teams.length !== 32) {
    issues.push(`Expected 32 teams, found ${teams.length}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}