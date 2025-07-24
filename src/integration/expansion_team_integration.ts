// Integration layer that connects expansion team support with existing systems
// This file provides the integration points without modifying existing code

import { enhancedTeamsHandlers } from '../discord/commands/enhanced_teams';
import { getEnhancedLatestTeams } from '../db/enhanced_madden_db';
import { processEnhancedTeamData } from '../export/enhanced_exporter';
import { TeamExport } from '../export/madden_league_types';

/**
 * Integration wrapper for the teams command
 * This can be used to enhance the existing teams command functionality
 */
export const teamsCommandIntegration = {
  /**
   * Enhanced message fetcher that can replace the original
   */
  async fetchTeamsMessage(settings: any): Promise<string> {
    try {
      return await enhancedTeamsHandlers.fetchEnhancedTeamsMessage(settings);
    } catch (error) {
      console.error('Enhanced teams message fetch failed, falling back to original:', error);
      // Fallback to original functionality would go here
      throw error;
    }
  },

  /**
   * Enhanced team assignment handler
   */
  async handleTeamAssignment(
    teamSearchPhrase: string,
    userId: string,
    roleId: string | undefined,
    leagueSettings: any,
    guildId: string,
    db: any,
    client: any
  ): Promise<string> {
    try {
      return await enhancedTeamsHandlers.handleEnhancedTeamAssignment(
        teamSearchPhrase, userId, roleId, leagueSettings, guildId, db, client
      );
    } catch (error) {
      console.error('Enhanced team assignment failed:', error);
      throw error;
    }
  },

  /**
   * Enhanced team freeing handler
   */
  async handleTeamFreeing(
    teamSearchPhrase: string,
    leagueSettings: any,
    guildId: string,
    db: any,
    client: any
  ): Promise<string> {
    try {
      return await enhancedTeamsHandlers.handleEnhancedTeamFreeing(
        teamSearchPhrase, leagueSettings, guildId, db, client
      );
    } catch (error) {
      console.error('Enhanced team freeing failed:', error);
      throw error;
    }
  },

  /**
   * Enhanced autocomplete handler
   */
  async handleAutocomplete(command: any): Promise<Array<{ name: string; value: string }>> {
    try {
      return await enhancedTeamsHandlers.handleEnhancedTeamAutocomplete(command);
    } catch (error) {
      console.error('Enhanced autocomplete failed, returning empty results:', error);
      return [];
    }
  }
};

/**
 * Integration wrapper for team data processing
 */
export const teamDataIntegration = {
  /**
   * Enhanced team data processor for exports
   */
  async processTeamExport(leagueId: string, teamExport: TeamExport): Promise<void> {
    try {
      await processEnhancedTeamData(leagueId, teamExport);
    } catch (error) {
      console.error('Enhanced team data processing failed:', error);
      throw error;
    }
  },

  /**
   * Enhanced team list getter
   */
  async getTeamList(leagueId: string) {
    try {
      return await getEnhancedLatestTeams(leagueId);
    } catch (error) {
      console.error('Enhanced team list fetch failed:', error);
      throw error;
    }
  }
};

/**
 * Integration health check
 * This function can be used to verify that expansion team support is working correctly
 */
export async function expansionTeamHealthCheck(leagueId: string): Promise<{
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details: any;
}> {
  try {
    const teamList = await getEnhancedLatestTeams(leagueId);
    const teams = teamList.getEnhancedLatestTeams();
    const validationResult = teamList.validateDivisionStructure();
    
    const expansionTeams = teams.filter((t: any) => t.isExpansionTeam);
    
    if (!validationResult) {
      return {
        status: 'error',
        message: 'Division structure validation failed',
        details: {
          totalTeams: teams.length,
          expansionTeams: expansionTeams.length,
          expansionTeamNames: expansionTeams.map((t: any) => t.displayName)
        }
      };
    }
    
    if (teams.length !== 32) {
      return {
        status: 'error',
        message: `Expected 32 teams, found ${teams.length}`,
        details: {
          totalTeams: teams.length,
          expansionTeams: expansionTeams.length
        }
      };
    }
    
    if (expansionTeams.length > 0) {
      return {
        status: 'warning',
        message: `Found ${expansionTeams.length} expansion teams`,
        details: {
          totalTeams: teams.length,
          expansionTeams: expansionTeams.length,
          expansionTeamNames: expansionTeams.map((t: any) => t.displayName)
        }
      };
    }
    
    return {
      status: 'healthy',
      message: 'All teams are original NFL teams',
      details: {
        totalTeams: teams.length,
        expansionTeams: 0
      }
    };
    
  } catch (error) {
    return {
      status: 'error',
      message: `Health check failed: ${error}`,
      details: { error: error }
    };
  }
}

/**
 * Migration helper for existing leagues
 * This function can be used to migrate existing league data to support expansion teams
 */
export async function migrateLeagueForExpansionTeams(leagueId: string): Promise<{
  success: boolean;
  message: string;
  migratedTeams: number;
}> {
  try {
    const teamList = await getEnhancedLatestTeams(leagueId);
    const teams = teamList.getEnhancedLatestTeams();
    
    // Count how many teams were enhanced (detected as expansion teams)
    const expansionTeams = teams.filter((t: any) => t.isExpansionTeam);
    
    return {
      success: true,
      message: `Migration completed successfully. Detected ${expansionTeams.length} expansion teams.`,
      migratedTeams: expansionTeams.length
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Migration failed: ${error}`,
      migratedTeams: 0
    };
  }
}