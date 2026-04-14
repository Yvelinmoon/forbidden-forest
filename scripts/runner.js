#!/usr/bin/env node
/**
 * 禁林深处 - 游戏主脚本
 * 肉鸽地牢爬塔游戏
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const PROJECT_DIR = path.resolve(SCRIPT_DIR, '..');
const DATA_DIR = path.join(PROJECT_DIR, 'data');

function loadData() {
  const dataPath = path.join(DATA_DIR, 'game.json');
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function initGame() {
  const data = loadData();
  return {
    floor: 1,
    currentRoom: 0,
    player: JSON.parse(JSON.stringify(data.player)),
    floors: [],
    currentEnemy: null,
    gameOver: false,
    ending: null,
    history: [],
    turnInRoom: 0,
    rooms: []
  };
}

function generateFloor(game, floorNum) {
  const data = loadData();
  const floor = data.floors.find(f => f.id === floorNum);
  if (!floor) return null;
  
  const roomCount = floor.room_count_min + Math.floor(Math.random() * (floor.room_count_max - floor.room_count_min + 1));
  const rooms = [];
  
  for (let i = 0; i < roomCount; i++) {
    const roomTypeRoll = Math.random() * 100;
    let cumulative = 0;
    let selectedType = 'combat';
    
    for (const type of data.room_types) {
      cumulative += type.weight;
      if (roomTypeRoll < cumulative) {
        selectedType = type.id;
        break;
      }
    }
    
    const room = {
      id: i,
      type: selectedType,
      cleared: false,
      visited: false
    };
    
    if (selectedType === 'combat') {
      room.enemy = floor.enemies[Math.floor(Math.random() * floor.enemies.length)];
    } else if (selectedType === 'elite') {
      room.enemy = floor.elites[Math.floor(Math.random() * floor.elites.length)];
    } else if (selectedType === 'treasure') {
      room.item = floor.items[Math.floor(Math.random() * floor.items.length)];
    } else if (selectedType === 'merchant') {
      room.shop = floor.items.slice(0, 3).sort(() => Math.random() - 0.5);
    }
    
    rooms.push(room);
  }
  
  // 最后房间是Boss房（第3层）
  if (floorNum === 3 && floor.boss) {
    rooms.push({
      id: roomCount,
      type: 'boss',
      enemy: floor.boss,
      boss: true,
      cleared: false,
      visited: false
    });
  }
  
  return {
    ...floor,
    rooms
  };
}

function getCurrentFloorData(game) {
  return game.floors.find(f => f.id === game.floor);
}

function getCurrentRoom(game) {
  const floorData = getCurrentFloorData(game);
  if (!floorData) return null;
  return floorData.rooms[game.currentRoom];
}

function getPlayerState(game) {
  return {
    hp: game.player.hp,
    maxHp: game.player.max_hp,
    mana: game.player.mana,
    maxMana: game.player.max_mana,
    spells: game.player.spells,
    inventory: game.player.inventory,
    floor: game.floor,
    room: game.currentRoom,
    totalRooms: getCurrentFloorData(game)?.rooms.length || 0
  };
}

function getRoomInfo(game) {
  const floorData = getCurrentFloorData(game);
  const room = getCurrentRoom(game);
  if (!floorData || !room) return null;
  
  const data = loadData();
  const enemyData = room.enemy ? data.enemies[room.enemy] : null;
  
  return {
    floor: game.floor,
    floorName: floorData.name,
    roomId: room.id,
    roomType: room.type,
    description: floorData.description,
    enemy: enemyData ? {
      name: room.enemy,
      hp: room.enemyHp || enemyData.hp,
      maxHp: enemyData.hp,
      damage: enemyData.damage,
      isBoss: enemyData.is_boss
    } : null,
    item: room.item,
    shop: room.shop,
    cleared: room.cleared,
    visited: room.visited
  };
}

function getAvailableActions(game) {
  const room = getCurrentRoom(game);
  const actions = [];
  
  if (!room) return actions;
  
  if (room.type === 'combat' || room.type === 'elite' || room.type === 'boss') {
    if (!room.cleared) {
      // 战斗相关行动
      const data = loadData();
      for (const spellName of game.player.spells) {
        const spell = data.spells[spellName];
        if (spell) {
          actions.push({
            id: `spell_${spellName}`,
            type: 'spell',
            name: spellName,
            description: spell.description,
            manaCost: spell.mana_cost,
            damage: spell.damage
          });
        }
      }
      
      // 使用道具
      if (game.player.inventory.length > 0) {
        for (const item of game.player.inventory) {
          const itemData = data.items[item];
          if (itemData) {
            actions.push({
              id: `item_${item}`,
              type: 'item',
              name: item,
              description: itemData.description
            });
          }
        }
      }
      
      // 逃跑选项（仅非Boss战）
      if (!room.boss) {
        actions.push({
          id: 'flee',
          type: 'flee',
          name: '逃跑',
          description: '尝试逃离战斗'
        });
      }
    } else {
      actions.push({
        id: 'continue',
        type: 'continue',
        name: '继续前进',
        description: '前往下一个房间'
      });
    }
  } else if (room.type === 'treasure') {
    if (!room.cleared && room.item) {
      actions.push({
        id: 'take',
        type: 'take',
        name: '拾取',
        description: `获得 ${room.item}`
      });
    }
    actions.push({
      id: 'continue',
      type: 'continue',
      name: '继续前进',
      description: '前往下一个房间'
    });
  } else if (room.type === 'rest') {
    if (!room.cleared) {
      actions.push({
        id: 'rest',
        type: 'rest',
        name: '休息',
        description: '恢复30点生命值'
      });
    }
    actions.push({
        id: 'continue',
        type: 'continue',
        name: '继续前进',
        description: '前往下一个房间'
    });
  } else if (room.type === 'merchant') {
    if (game.player.inventory.length < 5) {
      actions.push({
        id: 'buy',
        type: 'buy',
        name: '购买道具',
        description: '从商人处购买'
      });
    }
    actions.push({
      id: 'continue',
      type: 'continue',
      name: '继续前进',
      description: '前往下一个房间'
    });
  } else {
    actions.push({
      id: 'continue',
      type: 'continue',
      name: '继续前进',
      description: '前往下一个房间'
    });
  }
  
  return actions;
}

function processAction(game, actionId) {
  const data = loadData();
  const room = getCurrentRoom(game);
  if (!room) return { error: '没有当前房间' };
  
  // 处理战斗/攻击
  if (actionId.startsWith('spell_')) {
    const spellName = actionId.replace('spell_', '');
    const spell = data.spells[spellName];
    
    if (!spell) return { error: '无效的咒语' };
    if (game.player.mana < spell.mana_cost) return { error: '魔力不足' };
    
    game.player.mana -= spell.mana_cost;
    
    // 敌人受伤
    const enemyData = data.enemies[room.enemy];
    const enemyMaxHp = enemyData.hp;
    const currentEnemyHp = room.enemyHp || enemyMaxHp;
    const newEnemyHp = Math.max(0, currentEnemyHp - (spell.damage || 0));
    
    if (spell.type === 'heal') {
      game.player.hp = Math.min(game.player.max_hp, game.player.hp + spell.damage);
      return {
        message: `你使用了${spellName}，恢复了${spell.damage}点生命！`,
        playerState: getPlayerState(game)
      };
    }
    
    room.enemyHp = newEnemyHp;
    
    if (newEnemyHp <= 0) {
      room.cleared = true;
      // 记录击杀
      if (!game.player.defeated_enemies.includes(room.enemy)) {
        game.player.defeated_enemies.push(room.enemy);
      }
      return {
        message: `你用${spellName}击败了${room.enemy}！`,
        enemyDefeated: true,
        loot: room.type === 'elite' || room.type === 'boss' ? room.item : null,
        playerState: getPlayerState(game)
      };
    }
    
    // 敌人反击
    const playerDamage = enemyData.damage;
    game.player.hp -= playerDamage;
    
    if (game.player.hp <= 0) {
      game.gameOver = true;
      game.ending = 'defeat_death';
      return {
        message: `你被${room.enemy}击中，生命值降至0！`,
        gameOver: true,
        ending: data.endings.defeat_death,
        playerState: getPlayerState(game)
      };
    }
    
    return {
      message: `你使用${spellName}对${room.enemy}造成了${spell.damage}点伤害！\n${room.enemy}反击对你造成了${playerDamage}点伤害！`,
      playerState: getPlayerState(game),
      enemyHp: newEnemyHp
    };
  }
  
  // 使用道具
  if (actionId.startsWith('item_')) {
    const itemName = actionId.replace('item_', '');
    const itemData = data.items[itemName];
    const idx = game.player.inventory.indexOf(itemName);
    
    if (idx === -1) return { error: '没有这个道具' };
    if (!itemData) return { error: '无效的道具' };
    
    game.player.inventory.splice(idx, 1);
    
    if (itemData.effect === 'heal') {
      game.player.hp = Math.min(game.player.max_hp, game.player.hp + itemData.value);
      return {
        message: `你使用了${itemName}，恢复了${itemData.value}点生命！`,
        playerState: getPlayerState(game)
      };
    } else if (itemData.effect === 'mana') {
      game.player.mana = Math.min(game.player.max_mana, game.player.mana + itemData.value);
      return {
        message: `你使用了${itemName}，恢复了${itemData.value}点魔力！`,
        playerState: getPlayerState(game)
      };
    }
    
    return {
      message: `你使用了${itemName}！`,
      playerState: getPlayerState(game)
    };
  }
  
  // 逃跑
  if (actionId === 'flee') {
    const roomData = getCurrentFloorData(game);
    if (!roomData) return { error: '错误' };
    
    const fleeSuccess = Math.random() > 0.5;
    if (fleeSuccess) {
      game.currentRoom++;
      return {
        message: '逃跑成功！',
        moved: true,
        playerState: getPlayerState(game)
      };
    } else {
      const enemyData = data.enemies[room.enemy];
      game.player.hp -= enemyData.damage;
      
      if (game.player.hp <= 0) {
        game.gameOver = true;
        game.ending = 'defeat_death';
        return {
          message: '逃跑失败！你被击中！',
          gameOver: true,
          ending: data.endings.defeat_death,
          playerState: getPlayerState(game)
        };
      }
      
      return {
        message: `逃跑失败！${room.enemy}对你造成了${enemyData.damage}点伤害！`,
        playerState: getPlayerState(game)
      };
    }
  }
  
  // 继续/移动
  if (actionId === 'continue') {
    const floorData = getCurrentFloorData(game);
    room.visited = true;
    
    if (game.currentRoom < floorData.rooms.length - 1) {
      game.currentRoom++;
      const newRoom = getCurrentRoom(game);
      return {
        message: `你来到了第${game.floor}层 - 第${game.currentRoom + 1}个房间\n${newRoom.type === 'combat' ? `遭遇 ${newRoom.enemy}！` : ''}`,
        moved: true,
        playerState: getPlayerState(game)
      };
    } else {
      // 到达Boss房或下一层
      if (floorData.id < 3) {
        game.floor++;
        game.currentRoom = 0;
        game.floors.push(generateFloor(game, game.floor));
        return {
          message: `你进入了禁林第${game.floor}层！`,
          moved: true,
          floorChange: true,
          playerState: getPlayerState(game)
        };
      } else {
        // 通关Boss
        game.gameOver = true;
        game.ending = 'victory';
        return {
          message: '你击败了八眼巨蛛女王！禁林被征服了！',
          gameOver: true,
          ending: data.endings.victory,
          playerState: getPlayerState(game)
        };
      }
    }
  }
  
  // 拾取
  if (actionId === 'take') {
    if (room.item && !room.cleared) {
      if (game.player.inventory.length < 5) {
        game.player.inventory.push(room.item);
        room.cleared = true;
        return {
          message: `你获得了${room.item}！`,
          playerState: getPlayerState(game)
        };
      } else {
        return {
          message: '背包已满！',
          error: '背包已满',
          playerState: getPlayerState(game)
        };
      }
    }
  }
  
  // 休息
  if (actionId === 'rest') {
    const healAmount = 30;
    game.player.hp = Math.min(game.player.max_hp, game.player.hp + healAmount);
    room.cleared = true;
    return {
      message: `你休息了一下恢复了${healAmount}点生命！`,
      playerState: getPlayerState(game)
    };
  }
  
  return { error: '无效的行动' };
}

function checkSpecialEndings(game, data) {
  // 检查特殊结局
  if (game.player.defeated_enemies.length === 0) {
    game.ending = 'victory_pacifist';
    return data.endings.victory_pacifist;
  }
  
  if (game.ending === 'victory') {
    return data.endings.victory;
  }
  
  return null;
}

function main() {
  const args = process.argv.slice(2);
  const data = loadData();
  
  if (args.includes('--test')) {
    const game = initGame();
    game.floors.push(generateFloor(game, 1));
    console.log('游戏初始化成功！');
    console.log('第1层:', game.floors[0].name);
    console.log('房间数:', game.floors[0].rooms.length);
    console.log('玩家HP:', game.player.hp);
    console.log('玩家咒语:', game.player.spells.join(', '));
    return;
  }
  
  if (args.includes('--info')) {
    console.log('='.repeat(50));
    console.log('📖 禁林深处 - 游戏信息');
    console.log('='.repeat(50));
    console.log('层数:', data.max_floor);
    console.log('初始HP:', data.player.hp);
    console.log('初始魔力:', data.player.mana);
    console.log('初始咒语:', data.player.spells.join(', '));
    console.log('\n可用咒语:');
    for (const [name, spell] of Object.entries(data.spells)) {
      console.log(`  - ${name}: ${spell.description}`);
    }
    console.log('\n道具:');
    for (const [name, item] of Object.entries(data.items)) {
      console.log(`  - ${name}: ${item.description}`);
    }
    console.log('\n结局:');
    for (const [id, ending] of Object.entries(data.endings)) {
      console.log(`  ${ending.emoji} ${id}: ${ending.name}`);
    }
    return;
  }
  
  console.log('禁林深处 - Forbidden Forest');
  console.log('使用 --test 测试初始化');
  console.log('使用 --info 查看游戏信息');
}

if (require.main === module) {
  main();
}

module.exports = {
  loadData,
  initGame,
  generateFloor,
  getPlayerState,
  getRoomInfo,
  getAvailableActions,
  processAction,
  getCurrentFloorData,
  getCurrentRoom
};
