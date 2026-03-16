import React from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme';

const MOTORCYCLE_ART = `                            ___
                          /~   ~\\
                         |_      |
                         |/     __-__
                          \\   /~     ~~-_
                           ~~ -~~\\       ~\\
                            /     |        \\
               ,           /     /          \\
             //   _ _---~~~    //-_          \\
           /  (/~~ )    _____/-__  ~-_       _-\\             _________
         /  _-~\\\\0) ~~~~         ~~-_ \\__--~~   \`\\  ___---~~~        /'
        /_-~                       _-/'          )~/               /'
        (___________/           _-~/'         _-~~/             _-~
     _ ----- _~-_\\\\\\\\        _-~ /'      __--~   (_ ______---~~~--_
  _-~         ~-_~\\\\\\\\      (   (     -_~          ~-_  |          ~-_
 /~~~~\\          \\ \\~~       ~-_ ~-_    ~\\            ~~--__-----_    \\
;    / \\ ______-----\\           ~-__~-~~~~~~--_             ~~--_ \\    .
|   | \\((*)~~~~~~~~~~|      __--~~             ~-_               ) |   |
|    \\  |~|~---------)__--~~                      \\_____________/ /    ,
 \\    ~-----~    /  /~                             )  \\    ~-----~    /
  ~-_         _-~ /_______________________________/    \`-_         _-~
     ~ ----- ~                                            ~ ----- ~`;

     
const COURIER_ART = ` ██████╗ ██████╗ ██╗   ██╗██████╗ ██╗███████╗██████╗
██╔════╝██╔═══██╗██║   ██║██╔══██╗██║██╔════╝██╔══██╗
██║     ██║   ██║██║   ██║██████╔╝██║█████╗  ██████╔╝
██║     ██║   ██║██║   ██║██╔══██╗██║██╔══╝  ██╔══██╗
╚██████╗╚██████╔╝╚██████╔╝██║  ██║██║███████╗██║  ██║
 ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝
              CLI Version 1.0.0`;

const OFFERS = [
  { code: 'OFR001', discount: 10, minDistance: 0, maxDistance: 200, minWeight: 70, maxWeight: 200 },
  { code: 'OFR002', discount: 7, minDistance: 50, maxDistance: 150, minWeight: 100, maxWeight: 250 },
  { code: 'OFR003', discount: 5, minDistance: 50, maxDistance: 250, minWeight: 10, maxWeight: 150 },
];

interface WelcomeScreenProps {
  mode: 'cost' | 'time';
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ mode }) => (
  <Box flexDirection="column">
    <Text color={colors.pink} bold>Welcome to Courier CLI!</Text>
    <Text color={colors.muted}>Calculate delivery costs and optimize delivery times with real time package tracking</Text>

    <Box marginTop={1} flexDirection="column">
      <Text color={colors.pink}>{MOTORCYCLE_ART}</Text>
    </Box>
    <Box marginTop={1} flexDirection="column">
      <Text color={colors.pink}>{COURIER_ART}</Text>
    </Box>

    <Box marginTop={1} flexDirection="column">
      <Text color={colors.cyan}>Available Offer Codes:</Text>
      <Text color={colors.muted}>─────────────────────────────────────────</Text>
      <Text color={colors.dimWhite}>{'Code     | Distance (km) | Weight (kg)'}</Text>
      <Text color={colors.muted}>─────────────────────────────────────────</Text>
      {OFFERS.map((o) => {
        const dist = o.minDistance === 0 ? `< ${o.maxDistance}` : `${o.minDistance} - ${o.maxDistance}`;
        return (
          <Text key={o.code} color={colors.dimWhite}>
            {`${o.code.padEnd(9)}| ${dist.padEnd(14)}| ${o.minWeight} - ${o.maxWeight}`}
          </Text>
        );
      })}
      <Text color={colors.muted}>─────────────────────────────────────────</Text>
    </Box>

    <Box marginTop={1} flexDirection="column">
      <Text color={colors.pink}>Input Format:</Text>
      <Text color={colors.dimWhite}>  Line 1: <Text color={colors.muted}>base_delivery_cost no_of_packages</Text></Text>
      <Text color={colors.dimWhite}>  Line 2+: <Text color={colors.muted}>pkg_id weight_kg distance_km offer_code</Text></Text>
      {mode === 'time' && (
        <Text color={colors.dimWhite}>  Last line: <Text color={colors.muted}>no_of_vehicles max_speed max_weight</Text></Text>
      )}
      <Box marginTop={1} flexDirection="column">
        <Text color={colors.amber}>
          {mode === 'time' ? 'Example (Time):' : 'Example (Cost):'}
        </Text>
        <Text color={colors.muted}>  Line 1: <Text color={colors.dimWhite}>100 3</Text></Text>
        <Text color={colors.muted}>  Line 2: <Text color={colors.dimWhite}>pkg1 50 70 ofr001</Text></Text>
        <Text color={colors.muted}>  Line 3: <Text color={colors.dimWhite}>pkg2 75 70 ofr003</Text></Text>
        <Text color={colors.muted}>  Line 4: <Text color={colors.dimWhite}>pkg3 100 200 ofr002</Text></Text>
        {mode === 'time' && (
          <Text color={colors.muted}>  Line 5: <Text color={colors.dimWhite}>2 70 250</Text></Text>
        )}
      </Box>
    </Box>

    <Box marginTop={1} flexDirection="column">
      <Text color={colors.muted}>─────────────────────────────────────────</Text>
    </Box>

    <Box marginTop={1} flexDirection="column">
      <Text color={colors.cyan}>Available Commands:</Text>
      <Text>  <Text color={colors.emerald}>/change mode</Text> <Text color={colors.muted}>cost | time</Text> <Text color={colors.muted}>- Switch calculation mode</Text></Text>
      <Text>  <Text color={colors.amber}>clear</Text> <Text color={colors.muted}>- Clear screen</Text></Text>
      <Text>  <Text color={colors.cyan}>/restart</Text> <Text color={colors.muted}>- Show welcome screen again</Text></Text>
      <Text>  <Text color={colors.cyan}>help</Text> <Text color={colors.muted}>- Show available commands</Text></Text>
      <Text>  <Text color={colors.red}>exit</Text> <Text color={colors.muted}>- Exit the CLI</Text></Text>
      <Text>  <Text color={colors.muted}>↑ / ↓</Text> <Text color={colors.muted}>- Navigate command history</Text></Text>
      <Text>  <Text color={colors.muted}>Ctrl+C</Text> <Text color={colors.muted}>- Cancel current input</Text></Text>
    </Box>

    <Box marginTop={1} flexDirection="column">
      <Text color={colors.muted}>─────────────────────────────────────────</Text>
    </Box>
  </Box>
);
