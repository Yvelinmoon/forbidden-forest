# Deep Within the Forbidden Forest

🕷️ **Hogwarts Forbidden Forest Roguelike Adventure**

A 3-floor dungeon tower climb where you explore the Forbidden Forest and defeat the Acromantula Queen!

## 📁 Project Structure

```
forbidden-forest/
├── SKILL.md                    # OpenCode/Claude Code Skill definition
├── README.md                   # This file
├── data/
│   └── game.json               # Game data
├── scripts/
│   └── runner.js               # Game main script
└── tests/
    └── test_game.js           # Unit tests
```

## 🎮 Game Mechanics

### Player Attributes
- **Health (HP)**: 100
- **Mana**: 50
- **Inventory**: Maximum 5 items
- **Spells**: Initial spells Scouring Charm, Expelliarmus

### 3 Layers of Forest
1. **Forest Edge** - Entry-level difficulty
2. **Deep Forest** - Intermediate difficulty
3. **Dark Center** - Final Boss

### Room Types
- ⚔️ Combat Room
- 👹 Elite Enemy
- 💎 Treasure Chest
- 🏕️ Rest Stop
- 🧙 Mysterious Merchant

## 🏆 8 Endings

| Ending | Condition |
|--------|-----------|
| 👑 Forest Conqueror | Defeat the Boss |
| 📚 Seeker of Knowledge | Find the magic book |
| 🕊️ Pacifist | Zero kills |
| 💀 Young Death | HP reaches zero |
| 🕷️ Fallen to Darkness | Dark deal |
| 🏃 Hasty Escape | Flee from Boss |
| 🕸️ Forever Trapped | Trigger trap |
| ⭐ Mystery Ascension | Special choice |

## 🎯 Usage

```bash
mv forbidden-forest ~/.config/opencode/skills/

# Test
node scripts/runner.js --test

# View info
node scripts/runner.js --info
```

## 📜 MIT License

Inspired by J.K. Rowling's *Harry Potter* series
