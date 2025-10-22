# 🎭 Enhanced Mafia Game

A stunning web-based single-screen Virtual Mafia Game with a modern dark theme, supporting 4+ players with fully customizable roles. Everyone gathers around one screen to play together!

## Features

### Dynamic Player Support
- Supports 4 or more players (no maximum limit)
- Easy player management with add/remove buttons
- **Players persist across page refreshes** (localStorage)
- One-click "Clear All Players" for new games

### Customizable Roles
Configure the number of each role before starting:
- **Godfathers** - Mafia leaders who appear innocent to detectives initially
- **Mafia** - Work with godfathers to eliminate other players
- **Detectives** - Investigate players each night to identify mafia
- **Healers** - Can save one player from death each night
- **Civilians** - Remaining players (auto-calculated)

### Game Mechanics
- **Multiple Special Roles**: Support for multiple detectives, healers, mafias, and godfathers
- **Godfather Protection**: Godfathers appear innocent for the first 2 detective checks
- **Voice Narration**: Built-in text-to-speech for game phases
- **Real-time Tracking**: Active players, dead players, and role distribution
- **Comprehensive Validations**: Prevents invalid configurations and duplicate players
- **Smart Name Handling**: Automatic Title Case capitalization and case-insensitive matching
- **Win Conditions**:
  - Civilians win if all mafia team members are eliminated
  - Mafia wins if they equal or outnumber other players

### How to Play

1. **Open `index.html` on a large screen** (computer, laptop, or TV)
2. **Add all player names** using the "➕ Add Player" button
   - Type each player's name and press Enter or click Add
   - Names are automatically capitalized
3. **Everyone gathers around to watch this ONE screen**
4. **Configure roles:**
   - Set number of Godfathers, Mafia, Detectives, and Healers
   - Remaining players will be Civilians
   - Must have at least 4 players total
5. **Click "🎲 Start New Game"** to randomly assign roles
   - Each player will see their role displayed on screen
   - Remember your role when it's shown!
6. **Click "🌙 Begin Night Cycle"** to start playing
   - Follow the on-screen prompts
   - Click on players to select them during night phases
   - Manually mark eliminated players during day phase
7. **Continue until one team wins!**
   - Civilians win if all mafia are eliminated
   - Mafia wins if they equal or outnumber others

## Game Flow
1. **Night Phase**:
   - Mafia team wakes → selects victim
   - Each detective wakes → investigates one player
   - Each healer wakes → protects one player
2. **Day Phase**:
   - Reveal who died (unless saved by healer)
   - Players discuss and vote someone out
3. Repeat until win condition is met

## 🎨 UI Features
- **Dark Theme**: Beautiful gradient background with dark blues
- **Glassmorphism**: Modern frosted glass effect on panels
- **Premium Input Fields**: 
  - Gradient backgrounds with smooth transitions
  - Context-specific glow colors (green for add, orange for remove, red for eliminate)
  - Lift-on-hover and scale-on-focus animations
  - Animated placeholders with pulsing effect
  - Left border indicator when typing
  - Inset shadow for depth perception
- **Smooth Animations**: Hover effects, transitions, and glowing text
- **Gradient Buttons**: Color-coded buttons with shadow effects
- **Responsive Design**: Works great on desktop and mobile
- **Visual Feedback**: Player buttons change color when eliminated
- **Icons & Emojis**: Visual indicators for all actions and roles
- **Keyboard Support**: Press Enter to quickly add/remove players

## 🛡️ Validations
- **Player Names**: 2-20 characters, letters only, no duplicates (case-insensitive)
- **Auto-Capitalization**: All names converted to Title Case (e.g., "john doe" → "John Doe")
- **Role Limits**: Cannot assign more special roles than total players
- **Game Balance**: Prevents unbalanced mafia-to-civilian ratios
- **Real-time Feedback**: Live validation messages as you configure roles
- **Smart Search**: Find/remove players using any case variation

For detailed validation rules, see [VALIDATIONS.md](VALIDATIONS.md)
For UI improvements details, see [INPUT_IMPROVEMENTS.md](INPUT_IMPROVEMENTS.md)

## 🔧 Technical Details
- Pure HTML/CSS/JavaScript (no dependencies)
- Fixed critical randomization bug for fair role distribution
- Balanced role validation prevents unwinnable scenarios
- Modern CSS with animations, gradients, and backdrop filters
