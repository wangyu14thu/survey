# 社会实践投票小程序

一个完整的社会实践活动管理小程序，通过"民主投票+线下实战+云端留存+课程转化"的闭环，为学生提供社会实践的全流程体验。

## 项目功能

### 学生端功能
- ✅ **监护人授权** - 符合未成年人隐私保护要求
- ✅ **用户注册** - 班级码验证，精准信息采集
- ✅ **民主投票** - 6大主题实践活动投票，限投1票
- ✅ **结果公示** - 冠军榜单展示，倒计时功能
- ✅ **云端相册** - 班级专属相册，批量下载
- ✅ **电子证书** - 自动生成，分享功能
- ✅ **精品课程** - 课程展示、报名、支付
- ✅ **订单管理** - 订单查看、凭证管理

### 教师端功能
- ✅ **照片上传** - 批量上传活动照片到班级相册
- ✅ **班级管理** - 选择学校、年级、班级

### 管理端功能
- ✅ **数据统计** - 投票数、用户数、订单数
- ✅ **投票管理** - 实时票数监控、截止投票、公布结果
- ✅ **课程管理** - 报名人数监控、名额管理
- ✅ **数据导出** - 导出各类数据

## 技术栈

### 前端
- **微信小程序原生框架**
- WXML + WXSS + JavaScript
- 云开发能力（云函数、云数据库、云存储）

### 后端（云函数）
- Node.js
- wx-server-sdk
- 云数据库 MongoDB

## 项目结构

```
survey/
├── pages/                      # 页面目录
│   ├── authorization/          # 监护人授权页
│   ├── register/               # 用户注册页
│   ├── index/                  # 首页
│   ├── vote/                   # 投票页
│   ├── vote-detail/            # 投票详情页
│   ├── result/                 # 结果公示页
│   ├── album/                  # 云端相册页
│   ├── certificate/            # 电子证书页
│   ├── courses/                # 精品课程列表页
│   ├── course-detail/          # 课程详情页
│   ├── order/                  # 订单页
│   ├── profile/                # 个人中心页
│   ├── teacher/                # 教师上传页
│   └── admin/                  # 管理后台页
├── cloudfunctions/             # 云函数目录
│   ├── login/                  # 登录（获取OpenID）
│   ├── authorization/          # 授权管理
│   ├── user/                   # 用户管理
│   ├── vote/                   # 投票管理
│   ├── album/                  # 相册管理
│   ├── certificate/            # 证书管理
│   ├── course/                 # 课程管理
│   ├── order/                  # 订单管理
│   └── admin/                  # 管理员功能
├── utils/                      # 工具函数
│   └── util.js                 # 通用工具
├── config/                     # 配置文件
│   ├── themes.js               # 投票主题配置
│   └── courses.js              # 课程配置
├── images/                     # 图片资源（需自行添加）
├── app.js                      # 小程序入口
├── app.json                    # 小程序配置
├── app.wxss                    # 全局样式
└── project.config.json         # 项目配置
```

## 快速开始

### 1. 环境准备

- 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册[微信小程序账号](https://mp.weixin.qq.com/)
- 开通[云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

### 2. 项目配置

1. **修改AppID**
   ```json
   // project.config.json
   {
     "appid": "your-appid"  // 替换为你的小程序AppID
   }
   ```

2. **配置云开发环境**
   ```javascript
   // app.js
   wx.cloud.init({
     env: 'your-env-id'  // 替换为你的云开发环境ID
   })
   ```

### 3. 云开发配置

#### 创建云数据库集合

在云开发控制台创建以下集合：

- `authorizations` - 授权记录
- `users` - 用户信息
- `votes` - 投票记录
- `vote_stats` - 投票统计
- `vote_config` - 投票配置
- `albums` - 相册
- `certificates` - 证书
- `courses` - 课程
- `orders` - 订单
- `classes` - 班级信息

#### 初始化数据

1. **投票统计表 (vote_stats)**
   ```json
   [
     { "themeId": 1, "themeName": "绿色地球", "votes": 0 },
     { "themeId": 2, "themeName": "动植物保护", "votes": 0 },
     { "themeId": 3, "themeName": "科学发明", "votes": 0 },
     { "themeId": 4, "themeName": "传统文化", "votes": 0 },
     { "themeId": 5, "themeName": "文化创意", "votes": 0 },
     { "themeId": 6, "themeName": "野外生存", "votes": 0 }
   ]
   ```

2. **课程表 (courses)**
   ```json
   [
     {
       "id": 1,
       "title": "开演啦！中国古典四大名著",
       "enrolled": 0,
       "quota": 48
     },
     {
       "id": 2,
       "title": "小小发明家",
       "enrolled": 0,
       "quota": 30
     }
   ]
   ```

3. **班级表 (classes)** - 示例数据
   ```json
   [
     {
       "classCode": "CLASS001",
       "school": "示例小学",
       "grade": "三年级",
       "name": "1班"
     }
   ]
   ```

#### 上传云函数

在微信开发者工具中，右键每个云函数文件夹，选择"上传并部署"。

### 4. 添加图片资源

在 `images/` 目录下添加以下图片资源（建议尺寸）：

- `home.png` / `home-active.png` - 首页图标 (64x64)
- `album.png` / `album-active.png` - 相册图标 (64x64)
- `course.png` / `course-active.png` - 课程图标 (64x64)
- `profile.png` / `profile-active.png` - 我的图标 (64x64)
- `banner-course.jpg` - 课程Banner (750x360)
- `banner-vote.jpg` - 投票Banner (750x360)
- 主题封面图 (750x600)：
  - `themes/green-earth.jpg` - 绿色地球
  - `themes/wildlife.jpg` - 动植物保护
  - `themes/science.jpg` - 科学发明
  - `themes/culture.jpg` - 传统文化
  - `themes/creative.jpg` - 文化创意
  - `themes/survival.jpg` - 野外生存
- 课程相关图片：
  - `courses/famous-books.jpg` - 四大名著课程封面
  - `courses/inventor.jpg` - 小小发明家封面
  - `courses/detail1.jpg` 等 - 课程详情图
- 空状态图片 (800x800)：
  - `empty-album.png`
  - `empty-certificate.png`
  - `empty-course.png`
  - `empty-order.png`
- 其他：
  - `auth-shield.png` - 授权图标 (320x320)
  - `register-bg.png` - 注册背景 (750x800)
  - `cert-bg.png` - 证书背景

### 5. 运行项目

1. 用微信开发者工具打开项目目录
2. 编译并预览
3. 使用测试账号登录体验

## 核心功能说明

### 投票流程

1. 用户完成授权和注册
2. 浏览6个主题并查看详情
3. 投票（每人限1票，不可更改）
4. 等待12小时后查看结果
5. 查看冠军主题及完整排名

### 相册功能

- **教师端**：选择学校→年级→班级，批量上传照片（最多30张）
- **学生端**：优先展示本班级相册，支持一键保存；可浏览全校其他班级相册

### 证书生成

- 活动完成后自动生成
- 格式：姓名 + 主题 + 职业角色
- 支持下载和分享

### 课程转化

- 首页Banner轮播引导
- 证书页"体验更多职业"按钮
- 个人中心"精品项目课"入口（带New标记）

## 支付功能说明

**注意**：微信支付需要单独申请开通，需要：

1. 企业主体小程序
2. 开通微信支付商户号
3. 配置支付密钥
4. 实现支付回调处理

当前代码中的支付功能为示例代码，实际使用需要：

1. 参考[微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
2. 实现云函数 `payment`（统一下单、支付回调等）
3. 配置支付相关密钥

## 数据安全

### 隐私保护措施

1. **监护人授权**：首次使用前必须获得授权
2. **数据加密**：云数据库自动加密存储
3. **权限控制**：相册仅本班级可见
4. **OpenID隔离**：用户通过OpenID唯一标识，保护真实身份

### 权限设置

在云开发控制台设置数据库权限：

- `authorizations`：仅创建者可读写
- `users`：仅创建者可读写
- `votes`：仅创建者可写，所有人可读统计
- `albums`：按classId控制访问权限
- `orders`：仅创建者可读写

## 管理后台使用

### 访问方式

1. 在 `user` 云函数中添加管理员验证逻辑
2. 或直接在小程序中访问 `/pages/admin/admin`（建议通过扫码或分享卡片）

### 功能说明

- **投票管理**：实时查看各主题票数、截止投票、公布结果
- **课程管理**：监控报名进度、手动调整名额
- **数据导出**：导出投票、用户、订单数据（功能待完善）

## 常见问题

### Q1: 如何创建班级码？

在云数据库 `classes` 集合中手动添加记录，包含 `classCode`、`school`、`grade`、`name` 字段。

### Q2: 如何修改投票结束时间？

在 `cloudfunctions/vote/index.js` 中修改 `voteEndTime` 变量。

### Q3: 相册照片上传失败？

检查云存储权限，确保已开通并有足够存储空间。

### Q4: 如何添加新的课程？

在 `config/courses.js` 中添加课程配置，同时在云数据库 `courses` 集合中添加对应记录。

## 后续优化建议

1. **性能优化**
   - 添加图片懒加载
   - 实现上拉加载更多
   - 优化云函数并发性能

2. **功能增强**
   - 实现真实的支付功能
   - 添加消息推送（活动提醒、结果公布等）
   - 完善证书图片生成功能
   - 添加数据导出功能

3. **用户体验**
   - 添加引导页
   - 优化加载状态
   - 增加错误处理和友好提示

4. **安全加固**
   - 添加接口签名验证
   - 实现请求频率限制
   - 完善管理员权限验证

## 开发团队

如需技术支持，请联系开发团队。

## 许可证

本项目仅供学习交流使用。

---

**最后更新时间**：2026年1月14日

