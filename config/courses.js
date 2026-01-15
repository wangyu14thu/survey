// 精品课程配置
const courses = [
  {
    id: 1,
    title: '开演啦！中国古典四大名著',
    subtitle: '2天化身话剧创作人',
    cover: '/images/courses/famous-books.jpg',
    price: 1980,
    originalPrice: 2980,
    quota: 48,
    enrolled: 0,
    tag: '热门推荐',
    highlights: [
      '专业导师指导',
      '2天沉浸式学习',
      '话剧创作与表演',
      '颁发结业证书'
    ],
    schedule: [
      {
        day: 1,
        title: '第一天：剧本创作',
        content: '上午：四大名著深度解读\n下午：分组剧本创作\n晚上：剧本排练'
      },
      {
        day: 2,
        title: '第二天：舞台表演',
        content: '上午：舞台表演技巧学习\n下午：正式演出与录制\n晚上：结业仪式'
      }
    ],
    images: [
      '/images/courses/detail1.jpg',
      '/images/courses/detail2.jpg',
      '/images/courses/detail3.jpg'
    ],
    description: '通过深度学习中国古典四大名著，让孩子们在2天时间内化身话剧创作人，从剧本创作到舞台表演，全方位体验戏剧艺术的魅力。',
    suitable: '适合8-15岁学生',
    location: '北京市朝阳区文化创意产业园',
    duration: '2天1夜',
    includes: [
      '专业导师授课',
      '全套道具服装',
      '午餐及晚餐',
      '住宿（如需要）',
      '保险',
      '结业证书'
    ]
  },
  {
    id: 2,
    title: '小小发明家',
    subtitle: '激发创新思维',
    cover: '/images/courses/inventor.jpg',
    price: 1580,
    originalPrice: 2280,
    quota: 30,
    enrolled: 0,
    tag: '即将开班',
    highlights: [
      '动手实践',
      '创新思维培养',
      '科学实验',
      '发明创造'
    ],
    description: '培养孩子的创新思维和动手能力，通过一系列科学实验和发明创造活动，让孩子体验发明家的乐趣。',
    suitable: '适合7-14岁学生',
    location: '北京市海淀区科技创新中心',
    duration: '3天'
  }
]

module.exports = {
  courses
}

