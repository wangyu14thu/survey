// 投票主题配置
const themes = [
  {
    id: 1,
    name: '绿色地球',
    icon: '🌱',
    cover: '/images/themes/green-earth.jpg',
    location: '通州国际都市农业科技园',
    description: '探索现代农业科技，体验绿色生态之美',
    activities: [
      '体验智能温室',
      '水培组装实践',
      '参观组培室',
      '农业美食制作'
    ],
    color: '#4CAF50'
  },
  {
    id: 2,
    name: '动植物保护',
    icon: '🐼',
    cover: '/images/themes/wildlife.jpg',
    location: '北京大兴野生动物园',
    description: '走进动物世界，学习保护生命',
    activities: [
      '丰容制作体验',
      '动物营养配餐',
      '模拟兽医工作',
      '动物行为观察'
    ],
    color: '#FF9800'
  },
  {
    id: 3,
    name: '科学发明',
    icon: '🔬',
    cover: '/images/themes/science.jpg',
    location: '北京艺云数字艺术中心',
    description: '感受科技魅力，启发创新思维',
    activities: [
      '超验之躯体验',
      '敦煌宇宙探索',
      '光与色实验',
      '敦煌花灯制作',
      '飞天星座观测',
      '时间机器体验',
      '出神入画创作'
    ],
    color: '#2196F3'
  },
  {
    id: 4,
    name: '传统文化',
    icon: '🏺',
    cover: '/images/themes/culture.jpg',
    location: '北京陶瓷艺术馆',
    description: '传承千年技艺，感受文化魅力',
    activities: [
      '指尖陶瓷制作',
      '泥塑成型实践',
      '釉下绘画体验',
      '拉坯技艺学习',
      '扎染技艺体验'
    ],
    color: '#795548'
  },
  {
    id: 5,
    name: '文化创意',
    icon: '🎬',
    cover: '/images/themes/creative.jpg',
    location: '国家中影数字制作基地',
    description: '探索影视制作，体验创意之旅',
    activities: [
      '拟音车间体验',
      '绿幕摄影棚拍摄',
      '特效化妆实践',
      '光影魔术学习'
    ],
    color: '#E91E63'
  },
  {
    id: 6,
    name: '野外生存',
    icon: '🏕️',
    cover: '/images/themes/survival.jpg',
    location: '北京国际青年营（顺义奥林匹克水上公园营地）',
    description: '挑战野外生存，培养独立能力',
    activities: [
      '安营扎寨实践',
      '生命之源探索',
      '荒野定位训练',
      '急救互助学习',
      '埋锅造饭体验'
    ],
    color: '#607D8B'
  }
]

// 根据主题ID获取职业角色名称
const getRoleByThemeId = (themeId) => {
  const roles = {
    1: '小小农业家',
    2: '动物保护使者',
    3: '未来科学家',
    4: '小小陶瓷家',
    5: '影视创作人',
    6: '野外生存专家'
  }
  return roles[themeId] || '实践达人'
}

module.exports = {
  themes,
  getRoleByThemeId
}

