// Expansion team support system for Madden NFL teams
// This module provides mapping between expansion teams and their replaced NFL teams
// without modifying any existing core functionality

export interface ExpansionTeam {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary?: string;
  };
  logoId: number; // Maps to existing NFL team's logoId for compatibility
}

export interface ExpansionTeamMapping {
  expansionName: string;
  originalTeamId: number;
  originalTeamName: string;
  divisionId: number;
  conferenceId: number;
}

// All possible expansion teams from Madden 25
export const EXPANSION_TEAMS: Record<string, ExpansionTeam> = {
  "Antlers": {
    name: "Antlers",
    colors: { primary: "Green", secondary: "White", tertiary: "Brown" },
    logoId: 1001 // Custom expansion team logo ID
  },
  "Armadillos": {
    name: "Armadillos", 
    colors: { primary: "Red", secondary: "Gold", tertiary: "Black" },
    logoId: 1002
  },
  "Aviators": {
    name: "Aviators",
    colors: { primary: "Black", secondary: "Blue", tertiary: "White" },
    logoId: 1003
  },
  "Bisons": {
    name: "Bisons",
    colors: { primary: "Yellow", secondary: "Orange", tertiary: "Blue" },
    logoId: 1004
  },
  "Black Knights": {
    name: "Black Knights",
    colors: { primary: "Black", secondary: "White", tertiary: "Red" },
    logoId: 1005
  },
  "Blues": {
    name: "Blues",
    colors: { primary: "Blue", secondary: "White", tertiary: "Black" },
    logoId: 1006
  },
  "Bulls": {
    name: "Bulls",
    colors: { primary: "White", secondary: "Blue", tertiary: "Yellow" },
    logoId: 1007
  },
  "Caps": {
    name: "Caps",
    colors: { primary: "White", secondary: "Blue", tertiary: "Red" },
    logoId: 1008
  },
  "Condors": {
    name: "Condors",
    colors: { primary: "White", secondary: "Purple", tertiary: "Black" },
    logoId: 1009
  },
  "Desperados": {
    name: "Desperados",
    colors: { primary: "Black", secondary: "Grey", tertiary: "Red" },
    logoId: 1010
  },
  "Dragons": {
    name: "Dragons",
    colors: { primary: "Red", secondary: "Black", tertiary: "White" },
    logoId: 1011
  },
  "Dreadnoughts": {
    name: "Dreadnoughts",
    colors: { primary: "Blue", secondary: "Yellow", tertiary: "White" },
    logoId: 1012
  },
  "Elks": {
    name: "Elks",
    colors: { primary: "Blue", secondary: "Yellow", tertiary: "White" },
    logoId: 1013
  },
  "Golden Eagles": {
    name: "Golden Eagles",
    colors: { primary: "Red", secondary: "Green", tertiary: "White" },
    logoId: 1014
  },
  "Huskies": {
    name: "Huskies",
    colors: { primary: "Blue", secondary: "Black", tertiary: "White" },
    logoId: 1015
  },
  "Lumberjacks": {
    name: "Lumberjacks",
    colors: { primary: "Black", secondary: "Red", tertiary: "White" },
    logoId: 1016
  },
  "Monarchs": {
    name: "Monarchs",
    colors: { primary: "Blue", secondary: "White", tertiary: "Red" },
    logoId: 1017
  },
  "Mounties": {
    name: "Mounties",
    colors: { primary: "Navy", secondary: "Mustard", tertiary: "Red" },
    logoId: 1018
  },
  "Night Hawks": {
    name: "Night Hawks",
    colors: { primary: "Blue", secondary: "Grey", tertiary: "Black" },
    logoId: 1019
  },
  "Orbits": {
    name: "Orbits",
    colors: { primary: "Blue", secondary: "Grey", tertiary: "White" },
    logoId: 1020
  },
  "Pioneers": {
    name: "Pioneers",
    colors: { primary: "Brown", secondary: "Orange", tertiary: "White" },
    logoId: 1021
  },
  "Redwoods": {
    name: "Redwoods",
    colors: { primary: "Green", secondary: "White", tertiary: "Brown" },
    logoId: 1022
  },
  "River Hogs": {
    name: "River Hogs",
    colors: { primary: "Navy", secondary: "Blue", tertiary: "White" },
    logoId: 1023
  },
  "Sentinels": {
    name: "Sentinels",
    colors: { primary: "Blue", secondary: "Grey", tertiary: "Black" },
    logoId: 1024
  },
  "Shamrocks": {
    name: "Shamrocks",
    colors: { primary: "Green", secondary: "White" },
    logoId: 1025
  },
  "Snowhawks": {
    name: "Snowhawks",
    colors: { primary: "White", secondary: "Grey", tertiary: "Light Blue" },
    logoId: 1026
  },
  "Steamers": {
    name: "Steamers",
    colors: { primary: "Black", secondary: "Brown", tertiary: "White" },
    logoId: 1027
  },
  "Thunderbirds": {
    name: "Thunderbirds",
    colors: { primary: "Red", secondary: "White", tertiary: "Orange" },
    logoId: 1028
  },
  "Tigers": {
    name: "Tigers",
    colors: { primary: "Black", secondary: "Orange", tertiary: "White" },
    logoId: 1029
  },
  "Voyagers": {
    name: "Voyagers",
    colors: { primary: "Blue", secondary: "White", tertiary: "Yellow" },
    logoId: 1030
  },
  "Wizards": {
    name: "Wizards",
    colors: { primary: "Blue", secondary: "Yellow", tertiary: "White" },
    logoId: 1031
  }
};

// Relocation cities with their market characteristics
export const RELOCATION_CITIES = [
  "St. Louis", "Virginia Beach", "Dublin", "Anchorage", "Vancouver", "Sacramento", 
  "San Diego", "Mexico City", "Buenos Aires", "Omaha", "Houston", "San Antonio", 
  "San Juan", "Toronto", "Oklahoma City", "London", "Tokyo", "Salt Lake City", 
  "Albuquerque", "Memphis", "Louisville", "Chicago", "Canton", "Brooklyn", 
  "Melbourne", "Honolulu", "Portland", "Rio De Janeiro", "Austin", "Orlando", 
  "Columbus", "Montreal", "Paris", "Oakland"
];

// In-memory storage for expansion team mappings
// This preserves the original team structure while allowing expansion teams
const expansionTeamMappings = new Map<number, ExpansionTeamMapping>();

/**
 * Registers an expansion team as replacing an existing NFL team
 * This maintains the original team's division and conference structure
 */
export function registerExpansionTeam(
  teamId: number,
  expansionName: string,
  originalTeamName: string,
  divisionId: number,
  conferenceId: number
): void {
  expansionTeamMappings.set(teamId, {
    expansionName,
    originalTeamId: teamId,
    originalTeamName,
    divisionId,
    conferenceId
  });
}

/**
 * Checks if a team is an expansion team
 */
export function isExpansionTeam(teamId: number): boolean {
  return expansionTeamMappings.has(teamId);
}

/**
 * Gets expansion team mapping for a given team ID
 */
export function getExpansionTeamMapping(teamId: number): ExpansionTeamMapping | undefined {
  return expansionTeamMappings.get(teamId);
}

/**
 * Gets the expansion team definition by name
 */
export function getExpansionTeamByName(name: string): ExpansionTeam | undefined {
  return EXPANSION_TEAMS[name];
}

/**
 * Checks if a team name is a valid expansion team
 */
export function isValidExpansionTeamName(name: string): boolean {
  return name in EXPANSION_TEAMS;
}

/**
 * Gets all registered expansion teams
 */
export function getAllExpansionTeamMappings(): ExpansionTeamMapping[] {
  return Array.from(expansionTeamMappings.values());
}

/**
 * Removes an expansion team mapping (for team relocation back to original)
 */
export function removeExpansionTeamMapping(teamId: number): void {
  expansionTeamMappings.delete(teamId);
}

/**
 * Gets the appropriate logo ID for a team (expansion or original)
 * This ensures compatibility with existing logo systems
 */
export function getTeamLogoId(teamId: number, originalLogoId: number): number {
  const mapping = getExpansionTeamMapping(teamId);
  if (mapping) {
    const expansionTeam = getExpansionTeamByName(mapping.expansionName);
    return expansionTeam?.logoId || originalLogoId;
  }
  return originalLogoId;
}

/**
 * Gets the display name for a team (expansion name or original name)
 */
export function getTeamDisplayName(teamId: number, originalName: string): string {
  const mapping = getExpansionTeamMapping(teamId);
  if (mapping) {
    return mapping.expansionName;
  }
  return originalName;
}

/**
 * Auto-detects and registers expansion teams based on team data
 * This runs behind the scenes to identify when teams have been relocated
 */
export function autoDetectExpansionTeams(teams: any[]): void {
  teams.forEach(team => {
    // Check if the team name matches any expansion team
    const teamName = team.displayName || team.nickName || team.teamName;
    if (teamName && isValidExpansionTeamName(teamName)) {
      // Only register if not already registered
      if (!isExpansionTeam(team.teamId)) {
        registerExpansionTeam(
          team.teamId,
          teamName,
          team.originalName || teamName, // Fallback if original name not available
          team.divisionId || 0,
          team.conferenceId || 0
        );
      }
    }
  });
}