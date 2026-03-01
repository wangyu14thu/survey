# 开发模式配置说明

## 问题说明

在开发阶段，云函数可能还未创建或部署，导致小程序调用云函数时出现 `-501000` 错误：
```
FunctionName parameter could not be found
```

## 解决方案

我们在代码中添加了 **开发模式（DEV_MODE）**，可以使用模拟数据进行界面开发和测试。

## 配置方法

### 1. 修改 utils/api.js

找到文件开头的 `DEV_MODE` 常量：

```javascript
// 开发模式开关 - 开发时设置为true使用模拟数据，上线时改为false
const DEV_MODE = true;
```

- **开发阶段**: 设置为 `true`，使用模拟数据
- **生产环境**: 设置为 `false`，调用真实云函数

### 2. 修改 pages/index/index.js

在 `onLoad` 方法中找到 `DEV_MODE`：

```javascript
onLoad() {
  // 开发模式：模拟用户信息和活动上下文
  const DEV_MODE = true;
  if (DEV_MODE) {
    // ... 模拟数据代码
  }
  
  this.checkLogin();
}
```

在 `checkLogin` 方法中也有一个 `DEV_MODE`：

```javascript
checkLogin() {
  // ...
  
  // 开发模式下不检查活动上下文
  const DEV_MODE = true;
  if (!DEV_MODE && !app.hasActivityContext()) {
    // ...
  }
}
```

### 3. 修改 pages/register/register.js

在 `onLoad` 方法中找到 `DEV_MODE`：

```javascript
onLoad(options) {
  // ...
  
  // 开发模式：不检查活动上下文
  const DEV_MODE = true;
  if (!DEV_MODE && !app.hasActivityContext()) {
    // ...
  }
}
```

## 模拟数据说明

在 `utils/api.js` 的 `getMockData` 函数中，我们提供了以下模拟数据：

### 1. 活动信息 (activity)
```javascript
{
  schoolName: '北京市实验小学',
  activityName: '2026春季研学活动',
  grade: '五年级',
  status: 'ongoing'
}
```

### 2. 活动阶段 (activity stages)
```javascript
{
  stages: [
    { id: 1, name: '目的地投票', status: 'active' },
    { id: 2, name: '任务预习', status: 'locked' },
    { id: 3, name: '研学过程', status: 'locked' },
    { id: 4, name: '活动回顾', status: 'locked' }
  ]
}
```

### 3. 投票目的地 (vote)
```javascript
{
  destinations: [
    { id: 1, name: '通州国际都市农业科技园', ... },
    { id: 2, name: '北京大兴野生动物园', ... },
    { id: 3, name: '北京艺云数字艺术中心', ... }
  ],
  maxSelect: 2,
  hasVoted: false
}
```

### 4. 相册列表 (album)
```javascript
{
  list: [
    {
      id: 1,
      title: '2026春季·五年级博物馆研学',
      photoCount: 120
    }
  ]
}
```

### 5. 研学圈动态 (moment)
```javascript
{
  list: [
    {
      id: 1,
      userName: '张小明',
      userClass: '五(1)班',
      content: '今天的研学活动太有趣了！',
      likeCount: 5,
      commentCount: 2
    }
  ]
}
```

### 6. 用户活动列表 (user activities)
```javascript
{
  list: [
    {
      id: 1,
      schoolName: '北京市实验小学',
      activityName: '2026春季研学活动',
      status: 'ongoing'
    }
  ]
}
```

## 添加更多模拟数据

如果需要添加更多模拟数据，在 `utils/api.js` 的 `getMockData` 函数中的 `mockDataMap` 对象里添加：

```javascript
const mockDataMap = {
  '云函数名': {
    'action名': {
      success: true,
      data: {
        // 你的模拟数据
      }
    }
  }
};
```

## 使用步骤

### 开发阶段

1. 确保所有文件中的 `DEV_MODE = true`
2. 运行小程序，查看界面效果
3. 根据需要修改模拟数据
4. 完成界面开发和调试

### 部署云函数后

1. 在云开发控制台创建并部署所有云函数
2. 将所有文件中的 `DEV_MODE` 改为 `false`
3. 测试真实云函数调用
4. 确认功能正常后发布小程序

## 注意事项

### 1. 图片资源

模拟数据中的图片URL是示例，实际开发时：
- 将图片上传到云存储
- 替换模拟数据中的图片URL

### 2. 数据格式

模拟数据的格式要与真实云函数返回的格式保持一致，包括：
- 字段名称
- 数据类型
- 嵌套结构

### 3. 错误处理

开发模式下也会模拟网络延迟（500ms），但不会模拟错误情况。真实环境需要：
- 处理网络错误
- 处理数据为空的情况
- 处理权限不足的情况

### 4. 用户认证

开发模式会自动创建测试用户信息，但真实环境需要：
- 完整的注册流程
- 短信验证码验证
- openid 获取和绑定

## 切换到生产模式

当云函数开发完成后，按以下步骤切换：

### 1. 全局搜索并替换

在整个项目中搜索：
```
const DEV_MODE = true
```

替换为：
```
const DEV_MODE = false
```

### 2. 需要修改的文件

- `utils/api.js` (第5行)
- `pages/index/index.js` (第20行和第38行)
- `pages/register/register.js` (第13行)

### 3. 测试清单

切换到生产模式后，测试以下功能：
- [ ] 扫码注册流程
- [ ] 活动信息加载
- [ ] 目的地投票
- [ ] 任务预习
- [ ] 研学过程浏览
- [ ] 活动回顾查看
- [ ] 相册浏览
- [ ] 研学圈动态发布和浏览
- [ ] 评论和点赞
- [ ] 个人信息管理

## 常见问题

### Q1: 切换到生产模式后还是报错？
**A:** 检查云函数是否已正确部署，可以在云开发控制台查看云函数列表。

### Q2: 模拟数据不够用怎么办？
**A:** 在 `utils/api.js` 的 `getMockData` 函数中添加更多数据。

### Q3: 需要测试错误情况怎么办？
**A:** 可以临时修改 `getMockData` 函数返回错误数据或 `null`。

### Q4: 真实环境和开发环境数据格式不一致？
**A:** 确保云函数返回的数据格式与模拟数据格式完全一致。

## 推荐的开发流程

1. **界面开发** (DEV_MODE = true)
   - 使用模拟数据
   - 完成所有页面布局
   - 完成交互逻辑

2. **云函数开发** (并行进行)
   - 创建云函数
   - 实现业务逻辑
   - 本地测试

3. **集成测试** (DEV_MODE = false)
   - 切换到生产模式
   - 测试真实接口
   - 修复bug

4. **上线发布**
   - 确认 DEV_MODE = false
   - 完整测试
   - 提交审核

## 总结

开发模式可以让您在云函数未完成时先进行界面开发，大大提高开发效率。记住上线前一定要将所有 `DEV_MODE` 改为 `false`！
