# 🚀 快速开始 - 从开发到上线

## 当前状态 ✅

您的项目已经完成：
- ✅ 10个云函数代码已创建
- ✅ 数据库设计文档已完成
- ✅ 开发模式可正常使用
- ✅ 所有页面UI已完成

## 需要做的事情 📋

### 立即可做（20分钟）

#### 1. 上传云函数（10分钟）

在微信开发者工具中：

```
cloudfunctions/
├── login/        → 右键 → 上传并部署：云端安装依赖
├── sms/          → 右键 → 上传并部署：云端安装依赖  
├── user/         → 右键 → 上传并部署：云端安装依赖
├── activity/     → 右键 → 上传并部署：云端安装依赖
├── vote/         → 右键 → 上传并部署：云端安装依赖
├── preview/      → 右键 → 上传并部署：云端安装依赖
├── process/      → 右键 → 上传并部署：云端安装依赖
├── review/       → 右键 → 上传并部署：云端安装依赖
├── album/        → 右键 → 上传并部署：云端安装依赖
└── moment/       → 右键 → 上传并部署：云端安装依赖
```

**批量上传技巧：**
每个云函数右键点击 → "上传并部署：云端安装依赖" → 等待完成

#### 2. 创建数据库（10分钟）

登录微信云开发控制台 → 数据库 → 创建以下集合：

**基础表（必须）：**
1. `users` - 用户表
2. `activities` - 活动表  
3. `sms_codes` - 验证码表
4. `destinations` - 目的地表

**功能表（可选）：**
5. `votes` - 投票记录
6. `preview_tasks` - 预习任务
7. `preview_answers` - 答题记录
8. `process_posts` - 研学过程
9. `review_articles` - 活动回顾
10. `albums` - 相册
11. `photos` - 照片
12. `moments` - 动态
13. `likes` - 点赞
14. `comments` - 评论

### 测试数据初始化（10分钟）

#### 1. 添加测试活动

在 `activities` 集合添加：

```json
{
  "school_id": "school001",
  "act_id": "act001",
  "schoolName": "北京市实验小学",
  "activityName": "2026春季研学活动",
  "grade": "五年级",
  "status": "ongoing",
  "stages": [
    {"id": 1, "name": "目的地投票", "icon": "📍", "status": "active", "url": "/pages/vote/vote"},
    {"id": 2, "name": "任务预习", "icon": "📚", "status": "locked", "url": "/pages/preview/preview"},
    {"id": 3, "name": "研学过程", "icon": "🎒", "status": "locked", "url": "/pages/process/process"},
    {"id": 4, "name": "活动回顾", "icon": "📝", "status": "locked", "url": "/pages/review/review"}
  ],
  "vote_max_select": 2,
  "vote_deadline": "2026-03-15",
  "preview_task_id": "task_camping"
}
```

#### 2. 添加目的地（复制粘贴即可）

在 `destinations` 集合添加6条数据（详见 DEPLOYMENT.md）

#### 3. 添加预习任务

在 `preview_tasks` 集合添加：

```json
{
  "task_id": "task_camping",
  "identity": "野外生存小专家",
  "challenge": "当我们去野外游玩时，如果一不小心与朋友或家人走散，一时找不到回家的路，我们该如何在野外生存呢？",
  "skills": "我们即将体验安营扎寨、生命之源、荒野定位、急救互助、埋锅造饭等项目，帮助你完成挑战！",
  "questions": [
    {"id": 1, "question": "你解锁的新身份是（   ）", "options": [{"label": "A.环保志愿者", "value": "A"}, {"label": "B.野外生存小专家", "value": "B"}], "answer": "B"},
    {"id": 2, "question": "你面临的挑战是（   ）", "options": [{"label": "A.如何在野外生存？", "value": "A"}, {"label": "B.如何进行垃圾分类？", "value": "B"}], "answer": "A"}
  ]
}
```

### 切换到生产模式（5分钟）

修改以下3个文件：

**1. `utils/api.js` 第5行：**
```javascript
const DEV_MODE = false;  // 改为 false
```

**2. `pages/index/index.js` 第20和55行：**
```javascript
const DEV_MODE = false;  // 改为 false (两处)
```

**3. `pages/register/register.js` 第13行：**
```javascript
const DEV_MODE = false;  // 改为 false
```

### 测试功能（5分钟）

1. 重新编译小程序
2. 清除缓存（工具 → 清除缓存）
3. 测试注册流程
4. 测试首页显示
5. 测试投票功能

---

## 📁 重要文档

| 文档 | 用途 | 优先级 |
|-----|------|--------|
| **DEPLOYMENT.md** | 完整部署指南 | ⭐⭐⭐⭐⭐ |
| **docs/database-design.md** | 数据库设计 | ⭐⭐⭐⭐⭐ |
| **QUICK-START.md** | 快速启动（当前） | ⭐⭐⭐⭐ |
| **docs/dev-mode.md** | 开发模式说明 | ⭐⭐⭐ |
| **README.md** | 项目说明 | ⭐⭐⭐ |

---

## ⚠️ 重要提示

### 关于短信验证码

**开发环境：**
- 验证码会直接返回在控制台
- 无需真实发送短信

**生产环境：**
- 需要对接真实短信服务商
- 修改 `cloudfunctions/sms/index.js`
- 取消注释 `sendSMS` 函数
- 配置短信服务商API

**临时方案：**
- 可以先用固定验证码（如：888888）
- 或者跳过验证码验证

### 关于图片

当前使用示例图片地址：
```
https://mmbiz.qpic.cn/mmbiz_jpg/demo1.jpg
```

**替换方法：**
1. 上传图片到云存储
2. 获取图片URL
3. 更新数据库中的 `image` 字段

---

## 🎯 最快上线路径（1小时）

### 方案A：完整功能（推荐）

```
1. 上传10个云函数          [10分钟]
2. 创建14个数据库集合      [10分钟]
3. 添加测试数据            [10分钟]
4. 切换生产模式            [5分钟]
5. 测试所有功能            [15分钟]
6. 上传代码并提交审核      [10分钟]
```

### 方案B：最小可用（30分钟）

```
1. 上传6个核心云函数       [6分钟]
   - login, user, activity, vote, album, moment
2. 创建6个核心数据库       [6分钟]
   - users, activities, destinations, votes, albums, moments
3. 添加必要测试数据        [8分钟]
4. 切换生产模式            [5分钟]
5. 快速测试                [5分钟]
```

---

## 🐛 遇到问题？

### 常见错误及解决

**1. 云函数调用失败**
```
错误：-501000 FunctionName not found
解决：检查云函数是否已上传，名称是否正确
```

**2. 数据库权限错误**
```
错误：Permission denied
解决：设置数据库权限为 {"read": true, "write": false}
```

**3. 注册时短信发送失败**
```
这是正常的！开发环境验证码会直接显示在控制台
查看控制台日志获取验证码
```

### 快速检查清单

出问题时按顺序检查：
- [ ] 云函数是否已部署（云开发控制台查看）
- [ ] 数据库集合是否已创建
- [ ] DEV_MODE 是否已改为 false
- [ ] 测试数据是否已添加
- [ ] 缓存是否已清除

---

## 📞 下一步

**部署完成后：**

1. **测试二维码功能**
   - 生成活动二维码
   - 测试扫码注册

2. **完善内容**
   - 上传真实图片
   - 添加更多目的地
   - 编写活动回顾文章

3. **对接短信**
   - 注册短信服务商
   - 配置API密钥
   - 测试短信发送

4. **数据监控**
   - 查看用户注册情况
   - 监控云函数调用
   - 检查错误日志

---

## 🎉 总结

您现在有：
- ✅ 完整的小程序代码
- ✅ 10个云函数
- ✅ 14个数据库设计
- ✅ 完整的文档

只需要：
1. 上传云函数（10分钟）
2. 创建数据库（10分钟）
3. 添加测试数据（10分钟）
4. 切换生产模式（5分钟）

**35分钟后即可开始测试使用！** 🚀

---

**有任何问题，请查看 DEPLOYMENT.md 获取详细说明！**
