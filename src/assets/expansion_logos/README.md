# Expansion Team Logos

This directory contains the logo assets for Madden 25 expansion teams.

## Logo File Structure

Each expansion team should have logo files in the following format:
- `{team_name}_logo.png` - Main team logo
- `{team_name}_helmet.png` - Helmet logo (optional)
- `{team_name}_icon.png` - Small icon version (optional)

## Logo ID Mapping

The expansion teams use logo IDs 1001-1031 to avoid conflicts with NFL team logos:

| Team Name | Logo ID | File Prefix |
|-----------|---------|-------------|
| Antlers | 1001 | antlers |
| Armadillos | 1002 | armadillos |
| Aviators | 1003 | aviators |
| Bisons | 1004 | bisons |
| Black Knights | 1005 | black_knights |
| Blues | 1006 | blues |
| Bulls | 1007 | bulls |
| Caps | 1008 | caps |
| Condors | 1009 | condors |
| Desperados | 1010 | desperados |
| Dragons | 1011 | dragons |
| Dreadnoughts | 1012 | dreadnoughts |
| Elks | 1013 | elks |
| Golden Eagles | 1014 | golden_eagles |
| Huskies | 1015 | huskies |
| Lumberjacks | 1016 | lumberjacks |
| Monarchs | 1017 | monarchs |
| Mounties | 1018 | mounties |
| Night Hawks | 1019 | night_hawks |
| Orbits | 1020 | orbits |
| Pioneers | 1021 | pioneers |
| Redwoods | 1022 | redwoods |
| River Hogs | 1023 | river_hogs |
| Sentinels | 1024 | sentinels |
| Shamrocks | 1025 | shamrocks |
| Snowhawks | 1026 | snowhawks |
| Steamers | 1027 | steamers |
| Thunderbirds | 1028 | thunderbirds |
| Tigers | 1029 | tigers |
| Voyagers | 1030 | voyagers |
| Wizards | 1031 | wizards |

## Usage

Place your logo files in this directory following the naming convention above. The system will automatically map them based on the logo ID when expansion teams are detected.

## File Format Requirements

- **Format**: PNG preferred (supports transparency)
- **Size**: 256x256px recommended for main logos
- **Background**: Transparent preferred
- **Quality**: High resolution for scalability

## Integration

The logo system integrates with the existing bot functionality through:
- `getTeamLogoId()` function in `expansion_teams.ts`
- Enhanced team data processing in `team_utils.ts`
- Discord message formatting in `enhanced_team_utils.ts`

## Adding New Logos

1. Save logo file with correct naming convention
2. Verify logo ID mapping in `expansion_teams.ts`
3. Test with expansion team detection system
4. Logos will automatically appear when teams relocate