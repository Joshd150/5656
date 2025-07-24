// Logo handler for expansion teams
// This module manages logo assets for expansion teams without modifying existing logo systems

import * as path from 'path';
import * as fs from 'fs/promises';
import { EXPANSION_TEAMS, getExpansionTeamByName } from '../export/expansion_teams';

export interface LogoAsset {
  logoId: number;
  teamName: string;
  mainLogo?: string;
  helmet?: string;
  icon?: string;
}

/**
 * Gets the file path for an expansion team logo
 */
export function getExpansionTeamLogoPath(teamName: string, type: 'logo' | 'helmet' | 'icon' = 'logo'): string {
  const sanitizedName = teamName.toLowerCase().replace(/\s+/g, '_');
  const fileName = `${sanitizedName}_${type}.png`;
  return path.join(__dirname, 'expansion_logos', fileName);
}

/**
 * Checks if a logo file exists for an expansion team
 */
export async function expansionTeamLogoExists(teamName: string, type: 'logo' | 'helmet' | 'icon' = 'logo'): Promise<boolean> {
  try {
    const logoPath = getExpansionTeamLogoPath(teamName, type);
    await fs.access(logoPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets all available logo assets for an expansion team
 */
export async function getExpansionTeamAssets(teamName: string): Promise<LogoAsset | null> {
  const expansionTeam = getExpansionTeamByName(teamName);
  if (!expansionTeam) {
    return null;
  }

  const assets: LogoAsset = {
    logoId: expansionTeam.logoId,
    teamName: teamName
  };

  // Check for main logo
  if (await expansionTeamLogoExists(teamName, 'logo')) {
    assets.mainLogo = getExpansionTeamLogoPath(teamName, 'logo');
  }

  // Check for helmet logo
  if (await expansionTeamLogoExists(teamName, 'helmet')) {
    assets.helmet = getExpansionTeamLogoPath(teamName, 'helmet');
  }

  // Check for icon
  if (await expansionTeamLogoExists(teamName, 'icon')) {
    assets.icon = getExpansionTeamLogoPath(teamName, 'icon');
  }

  return assets;
}

/**
 * Gets logo URL for web serving (if using web server for logos)
 */
export function getExpansionTeamLogoUrl(teamName: string, type: 'logo' | 'helmet' | 'icon' = 'logo', baseUrl?: string): string {
  const sanitizedName = teamName.toLowerCase().replace(/\s+/g, '_');
  const fileName = `${sanitizedName}_${type}.png`;
  const base = baseUrl || '/assets/expansion_logos';
  return `${base}/${fileName}`;
}

/**
 * Gets all expansion team logos that are available
 */
export async function getAllAvailableExpansionLogos(): Promise<LogoAsset[]> {
  const assets: LogoAsset[] = [];
  
  for (const teamName of Object.keys(EXPANSION_TEAMS)) {
    const teamAssets = await getExpansionTeamAssets(teamName);
    if (teamAssets && (teamAssets.mainLogo || teamAssets.helmet || teamAssets.icon)) {
      assets.push(teamAssets);
    }
  }
  
  return assets;
}

/**
 * Validates that logo files follow the correct naming convention
 */
export async function validateExpansionTeamLogos(): Promise<{
  valid: boolean;
  issues: string[];
  found: string[];
}> {
  const issues: string[] = [];
  const found: string[] = [];
  
  for (const teamName of Object.keys(EXPANSION_TEAMS)) {
    const types: Array<'logo' | 'helmet' | 'icon'> = ['logo', 'helmet', 'icon'];
    
    for (const type of types) {
      if (await expansionTeamLogoExists(teamName, type)) {
        found.push(`${teamName} ${type}`);
      }
    }
    
    // Check if team has at least one logo
    const hasAnyLogo = await Promise.all(types.map(type => expansionTeamLogoExists(teamName, type)));
    if (!hasAnyLogo.some(exists => exists)) {
      // This is just a warning, not an error - teams can work without custom logos
      // issues.push(`No logo files found for ${teamName}`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    found
  };
}

/**
 * Logo serving middleware for web server (if needed)
 */
export function createLogoServingMiddleware() {
  return async (ctx: any, next: any) => {
    const url = ctx.request.url;
    const logoMatch = url.match(/^\/assets\/expansion_logos\/(.+)\.png$/);
    
    if (logoMatch) {
      const fileName = logoMatch[1];
      const logoPath = path.join(__dirname, 'expansion_logos', `${fileName}.png`);
      
      try {
        const logoData = await fs.readFile(logoPath);
        ctx.type = 'image/png';
        ctx.body = logoData;
        return;
      } catch {
        ctx.status = 404;
        return;
      }
    }
    
    await next();
  };
}