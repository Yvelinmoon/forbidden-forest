#!/usr/bin/env node
/**
 * 禁林深处场景图生成脚本
 * 根据结局生成禁林场景图片prompt
 */

const endings = {
  victory: {
    scene: 'standing victorious over the defeated Aragog Queen in the Dark Heart',
    mood: 'triumphant and heroic',
    bubble: 'The forest is safe... for now.',
    visual: 'giant spider carcass in background, ancient treasure glowing, moonlight through twisted trees'
  },
  victory_seeker: {
    scene: 'discovering an ancient spellbook in a hidden glade',
    mood: 'awestruck by forbidden knowledge',
    bubble: 'The secrets of the forest...',
    visual: 'glowing grimoire floating before them, fireflies, ethereal mist'
  },
  victory_pacifist: {
    scene: 'surrounded by friendly centaurs and forest creatures',
    mood: 'peaceful and accepted',
    bubble: 'We are all part of the forest.',
    visual: 'centaurs bowing respectfully, unicorns nearby, warm golden light filtering through trees'
  },
  defeat_death: {
    scene: 'fallen in battle against dark forest creatures',
    mood: 'tragic final moments',
    bubble: 'I... failed...',
    visual: 'broken wand at their side, shadowy beasts looming, cold moonlight on still body'
  },
  defeat_turned: {
    scene: 'transformed into a dark guardian of the forest',
    mood: 'corrupted and ominous',
    bubble: 'The forest... claims all...',
    visual: 'shadowy aura surrounding them, red eyes, twisted roots wrapping around legs'
  },
  defeat_escape: {
    scene: 'fleeing from the forest in terror',
    mood: 'humiliated and terrified',
    bubble: 'I can\'t do this!',
    visual: 'running toward the tree line, giant spider chasing, dark woods behind'
  },
  defeat_trapped: {
    scene: 'trapped in ancient magical vines forever',
    mood: 'desperate and doomed',
    bubble: 'Someone... help...',
    visual: 'glowing magical thorns binding them to an ancient tree, eerie green light'
  },
  mystery_ascended: {
    scene: 'ascending into magical light within the forest depths',
    mood: 'transcendent and mythical',
    bubble: 'I understand now...',
    visual: 'body dissolving into stardust and forest spirits, celestial beams breaking through canopy'
  }
};

function generatePrompt(characterName, endingId) {
  const data = endings[endingId] || endings.defeat_death;
  
  const prompt = `${characterName} in the Forbidden Forest, ` +
    `${data.scene}, ${data.mood}, ` +
    `speech bubble showing "${data.bubble}", ` +
    `${data.visual}, ` +
    `dark fantasy atmosphere, dramatic cinematic lighting, ` +
    `detailed fantasy art style, Harry Potter universe aesthetic`;
  
  const promptCN = `${characterName}在禁林中，` +
    `${data.scene}，表情${data.mood}，` +
    `头顶的对话气泡写着"${data.bubble}"，` +
    `${data.visual}，` +
    `黑暗奇幻氛围，戏剧化的电影级光影，` +
    `精细奇幻插画风格，哈利波特世界观`;
  
  return { prompt, promptCN };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('用法: node generate_scene.js "<character_name>" <ending_id>');
    console.log('可选结局: victory, victory_seeker, victory_pacifist, defeat_death, defeat_turned, defeat_escape, defeat_trapped, mystery_ascended');
    process.exit(1);
  }
  
  const characterName = args[0];
  const endingId = args[1];
  
  if (!endings[endingId]) {
    console.error(`错误: 无效的结局类型 ${endingId}`);
    process.exit(1);
  }
  
  const { prompt, promptCN } = generatePrompt(characterName, endingId);
  
  const output = {
    character: characterName,
    ending: endingId,
    prompt: prompt,
    prompt_cn: promptCN
  };
  
  console.log(JSON.stringify(output, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { generatePrompt, endings };
