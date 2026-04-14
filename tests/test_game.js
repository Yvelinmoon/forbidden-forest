#!/usr/bin/env node
/**
 * 禁林深处单元测试
 */

const { loadData, initGame, generateFloor, getPlayerState, getCurrentRoom } = require('../scripts/runner.js');

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    console.log(`     期望: ${expectedStr}`);
    console.log(`     实际: ${actualStr}`);
    failed++;
  }
}

function testLoadData() {
  console.log('\n🧪 测试：加载数据');
  const data = loadData();
  assertEqual(data.max_floor, 3, '有3层');
  assertEqual(data.player.hp, 100, '玩家初始HP正确');
  assertEqual(data.player.mana, 50, '玩家初始魔力正确');
  assertEqual(Object.keys(data.spells).length >= 5, true, '咒语数量足够');
  assertEqual(Object.keys(data.items).length >= 5, true, '道具数量足够');
  assertEqual(Object.keys(data.endings).length, 8, '8种结局');
}

function testInitGame() {
  console.log('\n🧪 测试：初始化游戏');
  const game = initGame();
  assertEqual(game.floor, 1, '初始楼层为1');
  assertEqual(game.currentRoom, 0, '初始房间为0');
  assertEqual(game.player.hp, 100, '初始HP为100');
  assertEqual(game.player.mana, 50, '初始魔力为50');
  assertEqual(game.player.spells.length >= 2, true, '初始咒语>=2');
  assertEqual(game.gameOver, false, '游戏未结束');
}

function testGenerateFloor() {
  console.log('\n🧪 测试：生成楼层');
  const game = initGame();
  const floor = generateFloor(game, 1);
  assertEqual(!!floor, true, '成功生成楼层');
  assertEqual(floor.id, 1, '楼层ID正确');
  assertEqual(floor.rooms.length >= 3, true, '房间数>=3');
  const validTypes = ['combat', 'elite', 'treasure', 'rest', 'merchant'];
  assertEqual(validTypes.includes(floor.rooms[0].type), true, '房间类型有效');
}

function testPlayerState() {
  console.log('\n🧪 测试：玩家状态');
  const game = initGame();
  game.floors.push(generateFloor(game, 1));
  const state = getPlayerState(game);
  assertEqual(state.hp, 100, 'HP正确');
  assertEqual(state.mana, 50, '魔力正确');
  assertEqual(state.floor, 1, '楼层正确');
}

function main() {
  console.log('🕷️ 禁林深处 - 单元测试');
  console.log('='.repeat(50));
  
  try {
    testLoadData();
    testInitGame();
    testGenerateFloor();
    testPlayerState();
  } catch (e) {
    console.error('测试执行出错:', e.message);
    failed++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

main();
