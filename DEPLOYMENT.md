# 🚀 完整部署指南

## 📋 部署前准备

### 1. 环境要求
- ✅ 微信开发者工具（最新版）
- ✅ Node.js 环境（用于安装依赖）
- ✅ 微信小程序账号（已认证）
- ✅ 云开发环境已开通

### 2. 文件清单检查

**云函数列表（10个）：**
- [ ] login
- [ ] sms
- [ ] user
- [ ] activity
- [ ] vote
- [ ] preview
- [ ] process
- [ ] review
- [ ] album
- [ ] moment

**数据库集合（14个）：**
- [ ] users
- [ ] activities
- [ ] sms_codes
- [ ] destinations
- [ ] votes
- [ ] preview_tasks
- [ ] preview_answers
- [ ] process_posts
- [ ] review_articles
- [ ] albums
- [ ] photos
- [ ] moments
- [ ] likes
- [ ] comments

---

## 📦 步骤一：部署云函数

### 1. 打开微信开发者工具

1. 打开您的小程序项目
2. 点击左侧"云开发"按钮
3. 进入云开发控制台

### 2. 上传云函数

**方法一：通过开发者工具上传（推荐）**

对每个云函数执行以下步骤：

```bash
1. 在开发者工具左侧，找到 cloudfunctions 文件夹
2. 右键点击 login 文件夹
3. 选择"上传并部署：云端安装依赖"
4. 等待上传完成
5. 重复以上步骤上传其他9个云函数
```

**需要上传的云函数列表：**
1. login
2. sms
3. user  
4. activity
5. vote
6. preview
7. process
8. review
9. album
10. moment

**方法二：通过命令行上传**

```bash
# 进入云函数目录
cd cloudfunctions

# 对每个云函数执行
cd login
npm install
# 然后在开发者工具中右键上传

cd ../sms
npm install
# 右键上传

# ... 重复其他云函数
```

### 3. 验证云函数部署

在云开发控制台 -> 云函数页面：
- [ ] 确认10个云函数都显示"已部署"
- [ ] 状态都是"正常"
- [ ] 没有错误提示

### 4. 测试云函数

在云开发控制台，点击任意云函数 -> "测试"：

**测试 login 云函数：**
```json
{}
```
预期返回：
```json
{
  "success": true,
  "openid": "oXXXX...",
  "appid": "wxXXXX..."
}
```

---

## 🗄️ 步骤二：创建数据库

### 1. 进入数据库管理

云开发控制台 -> 数据库 -> 集合

### 2. 创建集合

点击"添加集合"，按照以下列表逐个创建：

**基础数据表（4个）：**
1. `users` - 用户表
2. `activities` - 活动表
3. `sms_codes` - 短信验证码表
4. `destinations` - 目的地表

**投票相关（2个）：**
5. `votes` - 投票记录表

**预习相关（2个）：**
6. `preview_tasks` - 预习任务表
7. `preview_answers` - 答题记录表

**研学相关（2个）：**
8. `process_posts` - 研学过程表
9. `review_articles` - 回顾文章表

**相册相关（2个）：**
10. `albums` - 相册表
11. `photos` - 照片表

**研学圈相关（3个）：**
12. `moments` - 动态表
13. `likes` - 点赞表
14. `comments` - 评论表

### 3. 设置数据库权限

对每个集合设置权限（数据库 -> 集合 -> 权限设置）：

**所有人可读，仅创建者可写：**
```json
{
  "read": true,
  "write": "doc.openid == auth.openid"
}
```
适用于：users, votes, preview_answers, moments, likes, comments

**所有人可读，不可写：**
```json
{
  "read": true,
  "write": false
}
```
适用于：activities, destinations, preview_tasks, process_posts, review_articles, albums, photos

**仅云函数可访问：**
```json
{
  "read": false,
  "write": false
}
```
适用于：sms_codes

### 4. 创建索引（可选但推荐）

对高频查询字段创建索引：

**users 集合：**
- 索引字段：`openid`
- 索引类型：唯一索引

**activities 集合：**
- 索引字段：`school_id, act_id`
- 索引类型：联合唯一索引

**其他索引参考 `docs/database-design.md`**

---

## 📝 步骤三：初始化测试数据

### 1. 创建测试活动

在 `activities` 集合中添加记录：

```json
{
  "school_id": "school001",
  "act_id": "act001",
  "schoolName": "北京市实验小学",
  "activityName": "2026春季研学活动",
  "grade": "五年级",
  "startTime": 1709222400000,
  "endTime": 1709913600000,
  "status": "ongoing",
  "stages": [
    {
      "id": 1,
      "name": "目的地投票",
      "icon": "📍",
      "status": "active",
      "url": "/pages/vote/vote"
    },
    {
      "id": 2,
      "name": "任务预习",
      "icon": "📚",
      "status": "locked",
      "url": "/pages/preview/preview"
    },
    {
      "id": 3,
      "name": "研学过程",
      "icon": "🎒",
      "status": "locked",
      "url": "/pages/process/process"
    },
    {
      "id": 4,
      "name": "活动回顾",
      "icon": "📝",
      "status": "locked",
      "url": "/pages/review/review"
    }
  ],
  "destination_ids": ["dest001", "dest002", "dest003", "dest004", "dest005", "dest006"],
  "vote_max_select": 2,
  "vote_deadline": "2026-03-15",
  "vote_show_result": false,
  "preview_task_id": "task_camping"
}
```

### 2. 创建目的地数据

在 `destinations` 集合中添加6条记录：

```json
[
  {
    "_id": "dest001",
    "name": "通州国际都市农业科技园",
    "image": "cloud://您的图片地址",
    "activities": "体验智能温室、水培组装、组培室、美食制作等活动"
  },
  {
    "_id": "dest002",
    "name": "北京大兴野生动物园",
    "image": "cloud://您的图片地址",
    "activities": "体验丰容制作、营养配餐、模拟兽医等活动"
  },
  {
    "_id": "dest003",
    "name": "北京艺云数字艺术中心",
    "image": "cloud://您的图片地址",
    "activities": "体验超验之躯、敦煌宇宙、光与色、敦煌花灯、飞天星座、时间机器、出神入画等活动"
  },
  {
    "_id": "dest004",
    "name": "北京陶瓷艺术馆",
    "image": "cloud://您的图片地址",
    "activities": "体验指尖陶瓷制作、泥塑成型、釉下绘画、拉坯体验和扎染技艺等活动"
  },
  {
    "_id": "dest005",
    "name": "国家中影数字制作基地",
    "image": "cloud://您的图片地址",
    "activities": "体验拟音车间、绿幕摄影棚、特效化妆、光影魔术等活动"
  },
  {
    "_id": "dest006",
    "name": "北京国际青年营",
    "image": "cloud://您的图片地址",
    "activities": "体验安营扎寨、生命之源、荒野定位、急救互助、埋锅造饭等活动"
  }
]
```

### 3. 创建预习任务

在 `preview_tasks` 集合中添加记录：

```json
{
  "task_id": "task_camping",
  "identity": "野外生存小专家",
  "challenge": "当我们去野外游玩时，如果一不小心与朋友或家人走散，一时找不到回家的路，我们该如何在野外生存呢？",
  "skills": "我们即将体验安营扎寨、生命之源、荒野定位、急救互助、埋锅造饭等项目，帮助你完成挑战！",
  "questions": [
    {
      "id": 1,
      "question": "你解锁的新身份是（   ）",
      "options": [
        {"label": "A.环保志愿者", "value": "A"},
        {"label": "B.野外生存小专家", "value": "B"}
      ],
      "answer": "B"
    },
    {
      "id": 2,
      "question": "你面临的挑战是（   ）",
      "options": [
        {"label": "A.如何在野外生存？", "value": "A"},
        {"label": "B.如何进行垃圾分类？", "value": "B"}
      ],
      "answer": "A"
    }
  ]
}
```

---

## ⚙️ 步骤四：配置小程序

### 1. 关闭开发模式

在 `utils/api.js` 中修改：

```javascript
// 第5行
const DEV_MODE = false;  // 改为 false
```

在 `pages/index/index.js` 中修改：

```javascript
// 第20行
const DEV_MODE = false;  // 改为 false

// 第55行
const DEV_MODE = false;  // 改为 false
```

在 `pages/register/register.js` 中修改：

```javascript
// 第13行
const DEV_MODE = false;  // 改为 false
```

### 2. 配置云环境ID

确认 `app.js` 中的环境ID正确：

```javascript
wx.cloud.init({
  traceUser: true,
  env: 'cloud1-9gpi4pkt9a8bce92'  // 确认这是您的环境ID
});
```

### 3. 配置域名

在小程序管理后台：
- 设置 -> 开发设置 -> 服务器域名
- 添加您的服务器域名（如果有）

---

## 🧪 步骤五：测试功能

### 1. 基础测试

**测试登录：**
1. 重新编译小程序
2. 清除缓存
3. 重新进入
4. 检查控制台是否有错误

**测试注册：**
1. 进入注册页面
2. 填写信息
3. 点击"获取验证码"
4. 查看控制台，应该返回验证码
5. 输入验证码（开发环境会直接显示）
6. 完成注册

### 2. 功能测试清单

- [ ] 注册功能
- [ ] 首页显示活动信息
- [ ] 第一站：目的地投票
  - [ ] 显示6个目的地
  - [ ] 选择并投票
  - [ ] 查看投票结果
- [ ] 第二站：任务预习（需先解锁）
  - [ ] 显示任务信息
  - [ ] Tab切换
  - [ ] 答题提交
- [ ] 第三站：研学过程（需先解锁）
  - [ ] 显示时间线
  - [ ] 下拉刷新
- [ ] 第四站：活动回顾（需先解锁）
  - [ ] 显示文章
- [ ] 相册功能
- [ ] 研学圈功能
  - [ ] 发布动态
  - [ ] 点赞评论
- [ ] 我的页面

### 3. 性能测试

- [ ] 页面加载速度
- [ ] 图片加载速度
- [ ] 接口响应时间
- [ ] 下拉刷新流畅度

---

## 🐛 常见问题

### 1. 云函数调用失败

**错误：** `-501000 FunctionName parameter could not be found`

**解决：**
- 确认云函数已部署
- 检查云函数名称是否正确
- 在云开发控制台查看云函数状态

### 2. 数据库访问失败

**错误：** 权限不足

**解决：**
- 检查数据库权限设置
- 确认用户已登录
- 查看云函数是否有数据库访问权限

### 3. 图片上传失败

**错误：** 上传超时

**解决：**
- 检查图片大小（建议<2MB）
- 检查网络连接
- 确认云存储配额

### 4. 短信验证码收不到

**开发环境：**
- 验证码会直接返回在响应中
- 查看控制台日志

**生产环境：**
- 需要对接真实短信服务商
- 在 `cloudfunctions/sms/index.js` 中实现发送逻辑

---

## 📊 步骤六：数据监控

### 1. 云函数监控

云开发控制台 -> 云函数 -> 监控：
- 查看调用次数
- 查看错误率
- 查看耗时

### 2. 数据库监控

云开发控制台 -> 数据库 -> 统计：
- 查看读写次数
- 查看存储容量
- 查看索引使用情况

### 3. 云存储监控

云开发控制台 -> 云存储 -> 统计：
- 查看存储容量
- 查看流量使用
- 查看文件数量

---

## 🎯 步骤七：上线发布

### 1. 版本管理

1. 在开发者工具点击"上传"
2. 填写版本号和备注
3. 上传成功后登录小程序管理后台

### 2. 提交审核

1. 管理 -> 版本管理 -> 开发版本
2. 选择刚上传的版本
3. 点击"提交审核"
4. 填写审核信息
5. 等待审核通过

### 3. 发布上线

1. 审核通过后
2. 在"审核版本"中点击"发布"
3. 确认发布
4. 线上版本生效

---

## 📝 后续维护

### 1. 定期检查

- 每周查看云函数调用情况
- 每周查看错误日志
- 每月查看资源使用情况

### 2. 数据备份

- 定期导出重要数据
- 备份数据库
- 备份云存储文件

### 3. 性能优化

- 优化频繁调用的云函数
- 添加缓存机制
- 优化数据库查询

### 4. 功能迭代

- 收集用户反馈
- 修复bug
- 添加新功能

---

## ✅ 部署完成检查清单

- [ ] 10个云函数已部署
- [ ] 14个数据库集合已创建
- [ ] 数据库权限已设置
- [ ] 测试数据已添加
- [ ] DEV_MODE 已关闭
- [ ] 云环境ID已配置
- [ ] 基础功能测试通过
- [ ] 性能测试通过
- [ ] 已提交审核
- [ ] 已发布上线

---

**部署完成！** 🎉

如有问题，请查看：
- `README.md` - 项目说明
- `docs/database-design.md` - 数据库设计
- `docs/dev-mode.md` - 开发模式说明
