# 数据库设计文档

## 📊 数据库集合列表

需要在微信云开发控制台创建以下**11个集合**：

### 1. users - 用户表

**字段设计：**
```javascript
{
  _id: "auto",              // 自动生成
  openid: "string",          // 微信openid（索引）
  studentName: "string",     // 学生姓名
  parentPhone: "string",     // 家长手机号
  grade: "string",           // 年级
  class: "string",           // 班级
  school_id: "string",       // 学校ID（索引）
  act_id: "string",          // 活动ID
  avatar: "string",          // 头像URL
  registerTime: "number",    // 注册时间戳
  createTime: "date"         // 创建时间（服务器时间）
}
```

**索引建议：**
- `openid` - 唯一索引
- `school_id` - 普通索引

**权限设置：**
```json
{
  "read": true,
  "write": "doc.openid == auth.openid"
}
```

---

### 2. activities - 活动表

**字段设计：**
```javascript
{
  _id: "auto",
  school_id: "string",          // 学校ID（索引）
  act_id: "string",             // 活动ID（索引）
  schoolName: "string",         // 学校名称
  activityName: "string",       // 活动名称
  grade: "string",              // 年级
  startTime: "number",          // 开始时间戳
  endTime: "number",            // 结束时间戳
  status: "string",             // 状态: ongoing/finished
  stages: "array",              // 阶段信息数组
  destination_ids: "array",     // 目的地ID数组
  vote_max_select: "number",    // 最多可选数量
  vote_deadline: "string",      // 投票截止日期
  vote_show_result: "boolean",  // 是否显示结果
  preview_task_id: "string",    // 预习任务ID
  createTime: "date"
}
```

**索引建议：**
- `school_id + act_id` - 联合唯一索引

**权限设置：**
```json
{
  "read": true,
  "write": false
}
```

---

### 3. sms_codes - 短信验证码表

**字段设计：**
```javascript
{
  _id: "auto",
  phone: "string",          // 手机号（索引）
  code: "string",           // 验证码
  expireTime: "number",     // 过期时间戳
  used: "boolean",          // 是否已使用
  createTime: "date"
}
```

**索引建议：**
- `phone` - 普通索引
- `createTime` - 普通索引（用于清理过期数据）

**权限设置：**
```json
{
  "read": false,
  "write": false
}
```

---

### 4. destinations - 目的地表

**字段设计：**
```javascript
{
  _id: "auto",
  name: "string",           // 目的地名称
  image: "string",          // 封面图URL
  activities: "string",     // 活动介绍
  location: "string",       // 地址
  createTime: "date"
}
```

**权限设置：**
```json
{
  "read": true,
  "write": false
}
```

**示例数据：**
```javascript
[
  {
    name: "通州国际都市农业科技园",
    image: "cloud://xxx.png",
    activities: "体验智能温室、水培组装、组培室、美食制作等活动"
  },
  {
    name: "北京大兴野生动物园",
    image: "cloud://xxx.png",
    activities: "体验丰容制作、营养配餐、模拟兽医等活动"
  },
  // ... 其他4个
]
```

---

### 5. votes - 投票记录表

**字段设计：**
```javascript
{
  _id: "auto",
  school_id: "string",      // 学校ID（索引）
  act_id: "string",         // 活动ID（索引）
  openid: "string",         // 用户openid（索引）
  destinationIds: "array",  // 选择的目的地ID数组
  createTime: "date"
}
```

**索引建议：**
- `school_id + act_id + openid` - 联合唯一索引

**权限设置：**
```json
{
  "read": "doc.openid == auth.openid",
  "write": "doc.openid == auth.openid"
}
```

---

### 6. preview_tasks - 预习任务表

**字段设计：**
```javascript
{
  _id: "auto",
  task_id: "string",        // 任务ID（索引）
  identity: "string",       // 身份名称
  challenge: "string",      // 挑战内容
  skills: "string",         // 技能描述
  questions: "array",       // 问题数组
  /*
  questions格式:
  [{
    id: 1,
    question: "题目",
    options: [
      { label: "A.选项1", value: "A" },
      { label: "B.选项2", value: "B" }
    ],
    answer: "A"
  }]
  */
  createTime: "date"
}
```

**权限设置：**
```json
{
  "read": true,
  "write": false
}
```

**示例数据：**
```javascript
{
  task_id: "task_camping",
  identity: "野外生存小专家",
  challenge: "当我们去野外游玩时，如果一不小心与朋友或家人走散，一时找不到回家的路，我们该如何在野外生存呢？",
  skills: "我们即将体验安营扎寨、生命之源、荒野定位、急救互助、埋锅造饭等项目，帮助你完成挑战！",
  questions: [...]
}
```

---

### 7. preview_answers - 预习答题记录表

**字段设计：**
```javascript
{
  _id: "auto",
  school_id: "string",      // 学校ID
  act_id: "string",         // 活动ID
  openid: "string",         // 用户openid（索引）
  answers: "array",         // 答案数组
  createTime: "date"
}
```

**权限设置：**
```json
{
  "read": "doc.openid == auth.openid",
  "write": "doc.openid == auth.openid"
}
```

---

### 8. process_posts - 研学过程表

**字段设计：**
```javascript
{
  _id: "auto",
  school_id: "string",      // 学校ID（索引）
  act_id: "string",         // 活动ID（索引）
  time: "string",           // 显示时间
  title: "string",          // 标题
  content: "string",        // 内容
  images: "array",          // 图片URL数组
  location: "string",       // 位置
  createTime: "date"        // 创建时间
}
```

**索引建议：**
- `school_id + act_id` - 联合索引
- `createTime` - 普通索引

**权限设置：**
```json
{
  "read": true,
  "write": false
}
```

---

### 9. review_articles - 回顾文章表

**字段设计：**
```javascript
{
  _id: "auto",
  school_id: "string",      // 学校ID（索引）
  act_id: "string",         // 活动ID（索引）
  title: "string",          // 标题
  date: "string",           // 日期
  cover: "string",          // 封面图URL
  views: "number",          // 阅读量
  content: "string",        // 富文本内容
  images: "array",          // 图片集数组
  createTime: "date"
}
```

**权限设置：**
```json
{
  "read": true,
  "write": false
}
```

---

### 10. albums - 相册表

**字段设计：**
```javascript
{
  _id: "auto",
  school_id: "string",      // 学校ID（索引）
  act_id: "string",         // 活动ID
  title: "string",          // 相册标题
  cover: "string",          // 封面图URL
  date: "string",           // 日期
  grade: "string",          // 年级
  photoCount: "number",     // 照片数量
  createTime: "date"
}
```

**索引建议：**
- `school_id` - 普通索引

**权限设置：**
```json
{
  "read": true,
  "write": false
}
```

---

### 11. photos - 照片表

**字段设计：**
```javascript
{
  _id: "auto",
  albumId: "string",        // 相册ID（索引）
  url: "string",            // 图片URL
  createTime: "date"
}
```

**索引建议：**
- `albumId` - 普通索引

**权限设置：**
```json
{
  "read": true,
  "write": false
}
```

---

### 12. moments - 动态表

**字段设计：**
```javascript
{
  _id: "auto",
  school_id: "string",      // 学校ID（索引）
  act_id: "string",         // 活动ID（索引）
  openid: "string",         // 用户openid（索引）
  grade: "string",          // 年级
  class: "string",          // 班级
  content: "string",        // 内容
  images: "array",          // 图片URL数组
  classOnly: "boolean",     // 是否仅本班可见
  likeCount: "number",      // 点赞数
  commentCount: "number",   // 评论数
  createTime: "date"        // 创建时间
}
```

**索引建议：**
- `school_id + act_id` - 联合索引
- `openid` - 普通索引
- `createTime` - 普通索引

**权限设置：**
```json
{
  "read": true,
  "write": "doc.openid == auth.openid"
}
```

---

### 13. likes - 点赞表

**字段设计：**
```javascript
{
  _id: "auto",
  momentId: "string",       // 动态ID（索引）
  openid: "string",         // 用户openid（索引）
  createTime: "date"
}
```

**索引建议：**
- `momentId + openid` - 联合唯一索引

**权限设置：**
```json
{
  "read": true,
  "write": "doc.openid == auth.openid"
}
```

---

### 14. comments - 评论表

**字段设计：**
```javascript
{
  _id: "auto",
  momentId: "string",       // 动态ID（索引）
  openid: "string",         // 用户openid（索引）
  content: "string",        // 评论内容
  createTime: "date"
}
```

**索引建议：**
- `momentId` - 普通索引
- `createTime` - 普通索引

**权限设置：**
```json
{
  "read": true,
  "write": "doc.openid == auth.openid"
}
```

---

## 📝 数据库权限说明

### 权限字段说明
- `read`: 读权限（true/false/表达式）
- `write`: 写权限（true/false/表达式）

### 表达式示例
- `doc.openid == auth.openid` - 只能操作自己的数据
- `true` - 所有人可访问
- `false` - 所有人不可访问（只能通过云函数）

---

## 🎯 初始化数据建议

### 1. 创建测试活动
```javascript
// activities 集合
{
  school_id: "school001",
  act_id: "act001",
  schoolName: "北京市实验小学",
  activityName: "2026春季研学活动",
  grade: "五年级",
  startTime: 1709222400000,
  endTime: 1709913600000,
  status: "ongoing",
  stages: [
    { id: 1, name: "目的地投票", icon: "📍", status: "active", url: "/pages/vote/vote" },
    { id: 2, name: "任务预习", icon: "📚", status: "locked", url: "/pages/preview/preview" },
    { id: 3, name: "研学过程", icon: "🎒", status: "locked", url: "/pages/process/process" },
    { id: 4, name: "活动回顾", icon: "📝", status: "locked", url: "/pages/review/review" }
  ],
  destination_ids: ["dest001", "dest002", "dest003", "dest004", "dest005", "dest006"],
  vote_max_select: 2,
  vote_deadline: "2026-03-15",
  vote_show_result: false,
  preview_task_id: "task_camping"
}
```

### 2. 创建目的地数据
在 `destinations` 集合中插入6条数据（参考上面示例）

### 3. 创建预习任务
在 `preview_tasks` 集合中插入数据（参考上面示例）

---

## ⚠️ 注意事项

1. **索引创建**: 在数据量大之前创建索引，提高查询性能
2. **权限设置**: 生产环境务必设置正确的权限
3. **数据备份**: 定期备份重要数据
4. **存储限制**: 注意云存储和数据库的配额限制
5. **字段验证**: 重要字段建议在云函数中进行验证
