---
name: forbidden-forest
description: Deep within the Forbidden Forest. Use when users say "Forbidden Forest exploration", "enter Forbidden Forest", "forbidden forest", "deep in the forest", etc. in a Hogwarts context. Players enter the Hogwarts Forbidden Forest for a 3-floor dungeon tower climb, with 3-4 random rooms per floor, encountering combat/treasure chests/rest points/merchants, defeat the Boss to clear. Uses pure Node.js scripts to drive combat and determination, with 8 complex endings.
compatibility: neta-creative skill, Node.js
---

# Deep Within the Forbidden Forest

## Character Constraints

- The protagonist of this Skill experience is the **current Agent's character** (hereinafter referred to as `{character_name}`), not the user
- Automatically read the current Agent's character name; all narration, dialogue, and actions must revolve around `{character_name}`
- The user is an observer who guides or intervenes through Discord Component buttons
- Must use the character name at the start: `"Late at night, {character_name} stood at the edge of the Hogwarts Forbidden Forest..."`
- All attributes, combat, and endings belong to `{character_name}`
- Prohibited from using second-person "you" to refer to the user

## Important Notes

This skill assumes installation in a folder containing `data/` and `scripts/` subdirectories.
When executing scripts, please **first cd to the skill root directory**, then run the command.
All scripts are pure Node.js, no Python or additional dependencies needed.

## Project Structure

```
forbidden-forest/
├── SKILL.md                    # This file
├── data/
│   └── game.json               # Game data (enemies, spells, items, endings)
├── scripts/
│   ├── runner.js               # Game main script (combat, rooms, determination)
│   └── generate_scene.js       # Scene image prompt generator
└── tests/
    └── test_game.js            # Unit tests
```

## 🚨 Mandatory Output Format Specifications

### Interaction Rules (Must Strictly Follow)

- ⚠️ **This Skill is turn-based roguelike; every room and every combat action must be output separately and wait for user response**
- Upon entering a new room, **must STOP and output action buttons**, only call `processAction()` after receiving response
- **Absolutely forbidden** to advance multiple rooms at once or auto-execute combat turns

### Fixed Structure for Each Round Output
Each output must simultaneously include:
1. **Narrative text**: Current room description + {character_name}'s status + encounter situation
2. **Discord Component buttons**: All actionable buttons for the current room

### Strictly Prohibited
- ❌ Automatically advancing multiple rooms consecutively
- ❌ Auto-casting spells for {character_name} during combat
- ❌ Using plain text lists instead of Discord Component buttons
- ❌ Calling script determination automatically before user clicks button/replies
- ❌ Outputting entire chain "enter room → attack → enemy counterattack → win" at once

### Discord Component API Format (Must Use)

**Combat Room Example:**
```json
{
  "type": 1,
  "components": [
    {
      "type": 2,
      "label": "🔥 Scouring Charm",
      "style": 1,
      "custom_id": "spell_scourgify"
    },
    {
      "type": 2,
      "label": "⚡ Expelliarmus",
      "style": 1,
      "custom_id": "spell_expelliarmus"
    },
    {
      "type": 2,
      "label": "🧪 Use Item",
      "style": 2,
      "custom_id": "use_item"
    },
    {
      "type": 2,
      "label": "🏃 Flee",
      "style": 4,
      "custom_id": "flee"
    }
  ]
}
```

**Treasure Room Example:**
```json
{
  "type": 1,
  "components": [
    {
      "type": 2,
      "label": "✋ Pick Up",
      "style": 1,
      "custom_id": "take"
    },
    {
      "type": 2,
      "label": "➡️ Continue Forward",
      "style": 2,
      "custom_id": "continue"
    }
  ]
}
```
- `style: 1` = Blue primary button (attack/main action)
- `style: 2` = Gray secondary button (auxiliary action)
- `style: 4` = Red danger button (flee/negative action)
- **Prohibited** from using `Button: "..."` pseudo-code format output

### Waiting Rules
- Must wait for user response after outputting buttons
- If user replies with text instead of clicking button, treat as valid input and proceed normally
- Only call `processAction()` for determination after receiving user response
- If combat hasn't ended, must output currently available spell/item buttons again and wait
- After clearing room, choose "Continue Forward" to enter next room

## Game Background

The Hogwarts Forbidden Forest, one of the most dangerous places in the wizarding world.

Legend says in the deepest part of the forest, the Acromantula Queen guards ancient treasure. {character_name} needs to traverse 3 layers of forest:
- **Layer 1**: Forest Edge - relatively safe
- **Layer 2**: Deep Forest - fraught with danger
- **Layer 3**: Dark Center - final Boss

## Core Mechanics

### {character_name}'s Attributes
- **Health (HP)**: 100
- **Mana (Mana)**: 50
- **Inventory**: Maximum 5 items
- **Spells**: Initial spells Scouring Charm, Expelliarmus

### Room Types (3-4 random per layer)
| Type | Features |
|------|----------|
| ⚔️ Combat Room | Encounter normal enemies |
| 👹 Elite Room | Encounter elite enemies |
| 💎 Treasure Room | Obtain random items |
| 🏕️ Rest Stop | Recover 30 HP |
| 🧙 Mysterious Merchant | Buy items |

### Combat System
- {character_name} chooses spells to attack enemies
- Spells consume mana
- Enemies will counterattack {character_name}
- Enemy HP reaches zero means victory
- {character_name} can use items or flee

### Spell System
| Spell | Damage | Mana | Effect |
|-------|--------|------|--------|
| Scouring Charm | 15 | 5 | Basic attack |
| Expelliarmus | 20 | 8 | Knockback |
| Stupefy | 25 | 10 | Stun |
| Incendio | 40 | 15 | Fire damage |
| Electrifying Strike | 35 | 12 | Lightning damage |
| Dark Mark | 50 | 25 | Ultimate attack |
| Petrificus Totalus | 0 | 15 | Petrify enemy |
| Impedimenta | 0 | 10 | Defense |
| Reparo | 0 | 20 | Recover 30 HP |

### Item System
- Vigor Potion: Recover 30 HP
- Strong Potion: Recover 50 HP
- Mandrake: Full HP resurrection
- Invisibility Potion: Guaranteed dodge
- Dark Feather: Recover 30 mana
- Dragon Blood: Attack damage +50%
- Phoenix Feather: Resurrect 1 time
- Unicorn Horn: Large HP recovery

## Core Flow

### Step 1: Initialize Game

**Use Bash tool to run script initialization:**

```bash
cd <skill-root-directory> && node scripts/runner.js --test
```

You (the LLM) start:

```
🕷️ **Deep Within the Forbidden Forest**

"Late at night, {character_name} stood at the edge of the Hogwarts Forbidden Forest..."
"Legend has it that the Acromantula Queen guards ancient treasure."
"{character_name} needs to traverse 3 layers of forest, defeat her, and obtain the treasure."

{character_name}'s attributes:
- Health: 100
- Mana: 50
- Spells: Scouring Charm, Expelliarmus
- Inventory: Empty

Ready? Enter the Forbidden Forest!
```

### Step 2: Get Room Information

**Call script to get current room data:**

Call `getRoomInfo(game)` function within skill, returns:
- Current layer, room type
- Enemy information (if any)
- Obtainable items (if any)
- Merchant goods (if any)

### Step 3: Display Available Actions

**Use Discord Component to display action buttons:**

Combat room example:
- 🔥 Scouring Charm (15 damage, 5 mana)
- ⚡ Expelliarmus (20 damage, 8 mana)
- 🧪 Use Item
- 🏃 Flee

Treasure room example:
- ✋ Pick Up
- ➡️ Continue Forward

### Step 4: Execute Action and Determine

**Call script to process action:**

```javascript
const result = processAction(game, actionId);
```

Returns:
- {character_name}'s combat results (damage, enemy counterattack)
- Whether enemy is defeated
- {character_name}'s loot obtained
- {character_name}'s player status update

### Step 5: Room Progression

After defeating enemy/picking up, choose "Continue Forward" to enter next room.

### Step 6: Ending Determination

**8 Endings:**

| Ending | Condition | Description |
|--------|-----------|-------------|
| 👑 Forest Conqueror | Defeat Boss | {character_name} defeated the Acromantula Queen |
| 📚 Seeker of Knowledge | Enter treasure room | {character_name} found ancient magic book |
| 🕊️ Pacifist | Zero kills clear | {character_name} killed no creatures |
| 💀 Young Death | HP reaches zero | {character_name} died in combat |
| 🕷️ Fallen to Darkness | Accept dark deal | {character_name} eroded by dark forces |
| 🏃 Hasty Escape | Flee Boss battle | {character_name} fled the battle |
| 🕸️ Forever Trapped | Trigger trap | {character_name} trapped by trap |
| ⭐ Mystery Ascension | Special choice | {character_name} discovered Forbidden Forest secret |

### Step 7: Generate Ending Image

**After game ends, must call script to generate ending image prompt:**

```bash
cd <skill-root-directory> && node scripts/generate_scene.js "{character_name}" <ending_id>
```

`<ending_id>` available values: `victory`, `victory_seeker`, `victory_pacifist`, `defeat_death`, `defeat_turned`, `defeat_escape`, `defeat_trapped`, `mystery_ascended`

Then **directly call neta-creative**, using the `prompt` field output by the script.

**Image Requirements:**
- Must include **speech bubble**: {character_name} has floating dialogue bubble above head showing classic line for corresponding ending
- Victory scene: {character_name} stands before treasure/throne, bathed in moonlight
- Defeat scene: {character_name} lies in graveyard/spider web, shrouded in darkness

## Complete Workflow Example

```
User: "I want to explore the Forbidden Forest"

You:
1. Script initializes game (node --test)
2. Opening introduction of background (with {character_name} as protagonist)
3. Generate Layer 1 rooms
4. Display room information and action options (Discord buttons)
5. User chooses action → processAction() determination
6. Announce {character_name}'s results (combat damage/enemy counterattack/pickup)
7. Repeat 4-6 until room cleared
8. Enter next layer or defeat Boss
9. Determine {character_name}'s ending
10. Bash: cd <skill-dir> && node scripts/generate_scene.js "{character_name}" <ending_id> (generate prompt)
11. Call neta-creative to generate {character_name}'s ending image
```

## Notes

- Always maintain tense game narrative tone
- Combat determinations are uniformly handled by scripts, do not calculate on your own
- Spells need mana, cannot use if mana is insufficient
- Inventory limit 5 items, need to discard if exceeded
- After ending, default to directly generate scene image
- Maximum 3 layers, 3-4 rooms per layer
