# Expansion Team Logo Integration Guide

## Fixed Issues

### 1. Force Sim Logic Fixed
The force sim logic in `src/discord/notifier.ts` was incorrectly determining sim results. The logic has been corrected:

**Before (Incorrect):**
```typescript
if (homeUsers.length > 0 && awayUsers.length > 0) {
  return SimResult.FAIR_SIM
}
if (homeUsers.length > 0) {
  return SimResult.FORCE_WIN_HOME
}
```

**After (Correct):**
```typescript
if (homeUsers.length > 0 && awayUsers.length === 0) {
  return SimResult.FORCE_WIN_HOME
}
if (awayUsers.length > 0 && homeUsers.length === 0) {
  return SimResult.FORCE_WIN_AWAY
}
if (homeUsers.length > 0 && awayUsers.length > 0) {
  return SimResult.FAIR_SIM
}
```

Now the sim results will be:
- **Force Win Home**: Only home reactions, no away reactions
- **Force Win Away**: Only away reactions, no home reactions  
- **Fair Sim**: Both home AND away reactions

## Logo Integration System

### 2. Where to Add Expansion Team Logos

#### Directory Structure
```
src/assets/
├── expansion_logos/           # New directory for expansion team logos
│   ├── README.md             # Logo documentation
│   ├── antlers_logo.png      # Main logo files
│   ├── antlers_helmet.png    # Helmet logos (optional)
│   ├── antlers_icon.png      # Small icons (optional)
│   ├── armadillos_logo.png
│   ├── aviators_logo.png
│   └── ... (all 31 teams)
└── logo_handler.ts           # Logo management system
```

#### Logo ID System
- **NFL Teams**: Use existing logo IDs (1-32)
- **Expansion Teams**: Use logo IDs 1001-1031 (no conflicts)
- **Automatic Detection**: System automatically uses correct logo based on team type

### 3. Adding Your Logo Files

#### Step 1: Create the Directory
```bash
mkdir -p src/assets/expansion_logos
```

#### Step 2: Add Logo Files
Follow this naming convention:
```
{team_name_lowercase_with_underscores}_{type}.png

Examples:
- antlers_logo.png
- black_knights_logo.png  
- golden_eagles_logo.png
- night_hawks_helmet.png
- river_hogs_icon.png
```

#### Step 3: File Requirements
- **Format**: PNG (supports transparency)
- **Size**: 256x256px recommended
- **Background**: Transparent preferred
- **Quality**: High resolution for scalability

### 4. Logo Integration Points

#### In Team Data Processing
```typescript
// The system automatically enhances team data with correct logo IDs
const enhancedTeams = enhanceTeamData(originalTeams);
// Each expansion team gets its custom logo ID (1001-1031)
```

#### In Web Serving
```typescript
// Logos are automatically served at these URLs:
// /assets/expansion_logos/antlers_logo.png
// /assets/expansion_logos/dragons_helmet.png
// etc.
```

#### In Discord Messages
```typescript
// The system automatically uses the correct logo for each team
const logoUrl = getTeamLogoUrl(team.teamId, team.logoId, baseUrl);
// Returns expansion logo URL for expansion teams
// Returns NFL logo URL for original teams
```

### 5. Logo Validation

#### Check Logo Status
```typescript
import { validateExpansionTeamLogos } from '../assets/logo_handler';

const validation = await validateExpansionTeamLogos();
console.log(`Found logos: ${validation.found.length}`);
console.log(`Issues: ${validation.issues.length}`);
```

#### Get Available Logos
```typescript
import { getAllAvailableExpansionLogos } from '../assets/logo_handler';

const availableLogos = await getAllAvailableExpansionLogos();
// Returns array of teams that have logo files
```

### 6. Web Server Integration

The logo serving middleware has been added to your server automatically. Logos will be served at:
```
https://your-domain.com/assets/expansion_logos/{team_name}_logo.png
```

### 7. Fallback System

If expansion team logos are not found:
- System falls back to original NFL team logo
- No errors or broken images
- Seamless user experience maintained

## Quick Start

1. **Create the logo directory:**
   ```bash
   mkdir -p src/assets/expansion_logos
   ```

2. **Add your first logo:**
   ```bash
   # Example: Add Dragons logo
   cp your_dragons_logo.png src/assets/expansion_logos/dragons_logo.png
   ```

3. **Test the system:**
   ```typescript
   // The logo will automatically appear when a team relocates to "Dragons"
   // No additional configuration needed
   ```

## Logo File Examples

Here are the exact file names you need for each expansion team:

```
antlers_logo.png          armadillos_logo.png       aviators_logo.png
bisons_logo.png           black_knights_logo.png    blues_logo.png
bulls_logo.png            caps_logo.png             condors_logo.png
desperados_logo.png       dragons_logo.png          dreadnoughts_logo.png
elks_logo.png             golden_eagles_logo.png    huskies_logo.png
lumberjacks_logo.png      monarchs_logo.png         mounties_logo.png
night_hawks_logo.png      orbits_logo.png           pioneers_logo.png
redwoods_logo.png         river_hogs_logo.png       sentinels_logo.png
shamrocks_logo.png        snowhawks_logo.png        steamers_logo.png
thunderbirds_logo.png     tigers_logo.png           voyagers_logo.png
wizards_logo.png
```

The system is now ready to handle expansion team logos automatically once you add the logo files to the `src/assets/expansion_logos/` directory!