# 禁林深处 Forbidden Forest

🕷️ **霍格沃茨禁林探险肉鸽游戏**

3层地牢爬塔，探索禁林，击败八眼巨蛛女王！

## 📁 项目结构

```
forbidden-forest/
├── SKILL.md                    # OpenCode/Claude Code Skill 定义
├── README.md                   # 本文件
├── data/
│   └── game.json               # 游戏数据
├── scripts/
│   └── runner.js               # 游戏主脚本
└── tests/
    └── test_game.js           # 单元测试
```

## 🎮 游戏机制

### 玩家属性
- **生命值**：100
- **魔力值**：50
- **背包**：最多5个道具
- **咒语**：初始清理一新、缴械咒

### 3层禁林
1. **禁林边缘** - 入门级难度
2. **禁林深处** - 中级难度  
3. **黑暗中心** - 最终Boss

### 房间类型
- ⚔️ 战斗房
- 👹 精英怪
- 💎 宝箱
- 🏕️ 休息站
- 🧙 神秘商人

## 🏆 8种结局

| 结局 | 条件 |
|------|------|
| 👑 禁林征服者 | 击败Boss |
| 📚 知识渊博者 | 找到魔法书 |
| 🕊️ 和平主义者 | 零击杀 |
| 💀 英年早逝 | HP归零 |
| 🕷️ 堕落黑暗 | 黑暗交易 |
| 🏃 仓皇逃窜 | Boss逃跑 |
| 🕸️ 永远困住 | 陷阱 |
| ⭐ 神秘飞升 | 特殊选择 |

## 🎯 使用

```bash
mv forbidden-forest ~/.config/opencode/skills/

# 测试
node scripts/runner.js --test

# 查看信息
node scripts/runner.js --info
```

## 📜 MIT License

灵感来源：J.K. Rowling《哈利·波特》
