# 研学活动小程序

一个基于微信小程序的研学活动管理系统,支持通过二维码扫描进入特定学校和活动。

## 功能特性

### 1. 二维码扫码进入
- 每个学校×年级×活动生成专属二维码
- 扫码自动携带 school_id 和 act_id
- 所有操作限定在当前活动范围内

### 2. 用户注册
- 学生姓名
- 家长手机号 + 短信验证码
- 年级和班级选择
- 自动绑定扫码进入的活动

### 3. 研学之旅(首页)
四站式地图路线设计:
- **第一站:目的地投票** - 选择研学目的地(最多2个)
- **第二站:任务预习** - 学习任务和答题解锁
- **第三站:研学过程** - 图文直播时间线
- **第四站:活动回顾** - 公众号文章展示

### 4. 相册
- 相册列表(可按年级筛选)
- 瀑布流照片展示
- 图片预览和保存

### 5. 研学圈
- 发布动态(文字+图片,最多6张)
- 动态列表(类微博形式)
- 点赞和评论功能
- 仅本班可见选项

### 6. 我的
- 个人信息展示
- 我的研学活动列表
- 活动切换功能
- 退出登录

## 技术架构

### 前端框架
- 微信小程序原生开发
- 组件化设计
- 响应式布局

### 数据管理
- 微信云开发
- 云函数处理业务逻辑
- 云存储管理图片

### 目录结构
```
survey/
├── pages/                      # 页面目录
│   ├── register/              # 注册页
│   ├── index/                 # 首页(研学之旅)
│   ├── vote/                  # 目的地投票
│   ├── preview/               # 任务预习
│   ├── process/               # 研学过程
│   ├── review/                # 活动回顾
│   ├── album/                 # 相册列表
│   ├── album-detail/          # 相册详情
│   ├── moment/                # 研学圈
│   ├── moment-publish/        # 发布动态
│   ├── moment-detail/         # 动态详情
│   └── profile/               # 我的
├── utils/                      # 工具类
│   ├── api.js                 # API接口封装
│   └── util.js                # 工具函数
├── images/                     # 图片资源
├── app.js                      # 小程序入口
├── app.json                    # 全局配置
└── app.wxss                    # 全局样式
```

## 页面说明

### 注册页面 (pages/register)
- 通过扫码携带的参数自动绑定活动
- 短信验证码验证
- 年级班级选择

### 首页 (pages/index)
- 显示当前学校和活动名称
- 四站地图路线展示
- 根据阶段状态显示解锁/进行中/已完成

### 目的地投票 (pages/vote)
- 网格布局展示目的地
- 支持多选(可配置最大数量)
- 查看活动详情
- 投票结果展示

### 任务预习 (pages/preview)
- Tab切换:挑战/技能/问题
- 问题答题功能
- 答对后解锁下一站

### 研学过程 (pages/process)
- 时间线布局
- 图文混排展示
- 下拉刷新,上拉加载更多

### 活动回顾 (pages/review)
- 富文本内容展示
- 图片集展示
- 图片预览功能

### 相册 (pages/album)
- 年级筛选
- 相册卡片展示
- 照片数量统计

### 相册详情 (pages/album-detail)
- 瀑布流布局
- 图片预览
- 图片保存

### 研学圈 (pages/moment)
- 动态列表展示
- 点赞评论数统计
- 浮动发布按钮

### 发布动态 (pages/moment-publish)
- 文字输入(最多1000字)
- 图片上传(最多6张)
- 可见范围设置

### 动态详情 (pages/moment-detail)
- 动态内容展示
- 点赞功能
- 评论列表
- 评论输入

### 我的 (pages/profile)
- 个人信息卡片
- 功能菜单
- 活动列表和切换
- 退出登录

## 云函数说明

需要创建以下云函数:

### 1. login
- 获取用户 openid

### 2. user
- register: 用户注册
- getUserInfo: 获取用户信息
- getActivities: 获取用户参与的活动列表

### 3. sms
- sendCode: 发送短信验证码
- verifyCode: 验证短信验证码

### 4. activity
- getInfo: 获取活动信息
- getStages: 获取活动阶段状态

### 5. vote
- getList: 获取投票列表
- submit: 提交投票
- getResult: 获取投票结果

### 6. preview
- getTasks: 获取预习任务
- submitAnswer: 提交答案

### 7. process
- getList: 获取研学过程列表

### 8. review
- getArticle: 获取回顾文章

### 9. album
- getList: 获取相册列表
- getDetail: 获取相册详情

### 10. moment
- getList: 获取动态列表
- getDetail: 获取动态详情
- publish: 发布动态
- like: 点赞
- comment: 评论
- getComments: 获取评论列表
- getMyList: 获取我的动态
- delete: 删除动态

## 数据库设计

### users - 用户表
```javascript
{
  _id: 'auto',
  openid: 'string',
  studentName: 'string',
  parentPhone: 'string',
  grade: 'string',
  class: 'string',
  school_id: 'string',
  act_id: 'string',
  registerTime: 'number',
  avatar: 'string'
}
```

### activities - 活动表
```javascript
{
  _id: 'auto',
  school_id: 'string',
  act_id: 'string',
  schoolName: 'string',
  activityName: 'string',
  grade: 'string',
  startTime: 'number',
  endTime: 'number',
  status: 'string', // ongoing/finished
  stages: 'array'
}
```

### votes - 投票表
```javascript
{
  _id: 'auto',
  school_id: 'string',
  act_id: 'string',
  userId: 'string',
  destinationIds: 'array',
  createTime: 'number'
}
```

### moments - 动态表
```javascript
{
  _id: 'auto',
  school_id: 'string',
  act_id: 'string',
  userId: 'string',
  content: 'string',
  images: 'array',
  classOnly: 'boolean',
  likeCount: 'number',
  commentCount: 'number',
  createTime: 'number'
}
```

### comments - 评论表
```javascript
{
  _id: 'auto',
  momentId: 'string',
  userId: 'string',
  content: 'string',
  createTime: 'number'
}
```

## 小程序码生成

后台需要提供生成小程序码的接口,参数格式:
```javascript
{
  scene: 'school_id=xxx&act_id=yyy',
  page: 'pages/register/register',
  width: 430
}
```

## 部署说明

1. 在微信公众平台注册小程序
2. 开通云开发环境
3. 修改 `app.js` 中的云开发环境 ID
4. 上传云函数
5. 配置数据库权限
6. 上传小程序代码
7. 提交审核发布

## 注意事项

1. 所有接口需要校验 school_id 和 act_id
2. 图片上传需要限制大小和数量
3. 内容发布需要进行敏感词过滤
4. 用户隐私信息需要加密存储
5. 定期清理过期活动数据

## 未来优化

1. 增加消息通知功能
2. 支持视频上传和播放
3. 增加数据统计分析
4. 优化图片加载性能
5. 增加分享功能
6. 支持导出活动报告

## 版本历史

### v1.0.0 (2026-03-01)
- 初始版本发布
- 实现核心功能模块
- 支持扫码进入
- 完成四站式研学流程
