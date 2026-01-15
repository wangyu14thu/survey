# 数据库设计文档

本文档详细说明小程序使用的云数据库结构。

## 数据库集合

### 1. authorizations（授权记录）

存储监护人授权信息，用于合规性记录。

```json
{
  "_id": "auto",
  "openid": "oABC123...",
  "timestamp": 1704960000000,
  "createTime": "2026-01-14T10:00:00.000Z"
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 自动生成 | 是 |
| openid | string | 用户OpenID | 是 |
| timestamp | number | 授权时间戳 | 是 |
| createTime | serverDate | 服务器创建时间 | 是 |

**索引建议**：
- openid（唯一索引）

---

### 2. users（用户信息）

存储注册用户的基本信息。

```json
{
  "_id": "auto",
  "openid": "oABC123...",
  "nickname": "小明",
  "grade": "三年级",
  "region": "北京市 朝阳区",
  "school": "示例小学",
  "classCode": "CLASS001",
  "classId": "class_id_123",
  "className": "1班",
  "phone": "13800138000",
  "role": "student",
  "registerTime": 1704960000000,
  "createTime": "2026-01-14T10:00:00.000Z"
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 自动生成 | 是 |
| openid | string | 用户OpenID | 是 |
| nickname | string | 昵称 | 是 |
| grade | string | 年级 | 是 |
| region | string | 地区 | 是 |
| school | string | 学校 | 是 |
| classCode | string | 班级码 | 是 |
| classId | string | 班级ID | 是 |
| className | string | 班级名称 | 是 |
| phone | string | 手机号 | 是 |
| role | string | 角色（student/teacher/admin） | 否 |
| registerTime | number | 注册时间戳 | 是 |
| createTime | serverDate | 服务器创建时间 | 是 |

**索引建议**：
- openid（唯一索引）
- classId（普通索引）
- school（普通索引）

---

### 3. votes（投票记录）

存储用户的投票信息。

```json
{
  "_id": "auto",
  "openid": "oABC123...",
  "themeId": 1,
  "themeName": "绿色地球",
  "voteTime": "2026-01-14T10:00:00.000Z",
  "timestamp": 1704960000000
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 自动生成 | 是 |
| openid | string | 用户OpenID | 是 |
| themeId | number | 主题ID（1-6） | 是 |
| themeName | string | 主题名称 | 是 |
| voteTime | serverDate | 投票时间 | 是 |
| timestamp | number | 时间戳 | 是 |

**索引建议**：
- openid（唯一索引）
- themeId（普通索引）

---

### 4. vote_stats（投票统计）

存储各主题的票数统计。

```json
{
  "_id": "auto",
  "themeId": 1,
  "themeName": "绿色地球",
  "votes": 0
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 自动生成 | 是 |
| themeId | number | 主题ID | 是 |
| themeName | string | 主题名称 | 是 |
| votes | number | 票数 | 是 |

**索引建议**：
- themeId（唯一索引）

**初始数据**：需要预先创建6条记录，votes初始值为0。

---

### 5. vote_config（投票配置）

存储投票的全局配置。

```json
{
  "_id": "main",
  "ended": false,
  "published": false,
  "startTime": "2026-01-14T00:00:00.000Z",
  "endTime": "2026-01-21T00:00:00.000Z",
  "publishTime": null
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 固定为"main" | 是 |
| ended | boolean | 是否已结束 | 是 |
| published | boolean | 结果是否已公布 | 是 |
| startTime | date | 开始时间 | 否 |
| endTime | date | 结束时间 | 否 |
| publishTime | date | 公布时间 | 否 |

---

### 6. albums（相册）

存储活动照片。

```json
{
  "_id": "auto",
  "activityName": "绿色地球主题实践",
  "school": "示例小学",
  "grade": "三年级",
  "classId": "class_id_123",
  "className": "1班",
  "photos": [
    {
      "fileID": "cloud://xxx.jpg",
      "url": "https://xxx.jpg"
    }
  ],
  "photoCount": 10,
  "cover": "https://xxx.jpg",
  "uploadTime": 1704960000000,
  "date": "2026-01-14",
  "createTime": "2026-01-14T10:00:00.000Z"
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 自动生成 | 是 |
| activityName | string | 活动名称 | 是 |
| school | string | 学校 | 是 |
| grade | string | 年级 | 是 |
| classId | string | 班级ID | 是 |
| className | string | 班级名称 | 是 |
| photos | array | 照片数组 | 是 |
| photoCount | number | 照片数量 | 是 |
| cover | string | 封面图URL | 是 |
| uploadTime | number | 上传时间戳 | 是 |
| date | string | 日期字符串 | 是 |
| createTime | serverDate | 创建时间 | 是 |

**索引建议**：
- classId（普通索引）
- school（普通索引）

---

### 7. certificates（证书）

存储用户获得的证书。

```json
{
  "_id": "auto",
  "openid": "oABC123...",
  "userName": "小明",
  "themeId": 1,
  "themeName": "绿色地球",
  "role": "小小农业家",
  "date": "2026-01-14",
  "imageUrl": "cloud://cert-xxx.png",
  "createTime": "2026-01-14T10:00:00.000Z"
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 自动生成 | 是 |
| openid | string | 用户OpenID | 是 |
| userName | string | 用户姓名 | 是 |
| themeId | number | 主题ID | 是 |
| themeName | string | 主题名称 | 是 |
| role | string | 职业角色 | 是 |
| date | string | 颁发日期 | 是 |
| imageUrl | string | 证书图片URL | 否 |
| createTime | serverDate | 创建时间 | 是 |

**索引建议**：
- openid（普通索引）

---

### 8. courses（课程）

存储精品课程信息。

```json
{
  "_id": "auto",
  "id": 1,
  "title": "开演啦！中国古典四大名著",
  "enrolled": 0,
  "quota": 48
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 自动生成 | 是 |
| id | number | 课程ID | 是 |
| title | string | 课程标题 | 是 |
| enrolled | number | 已报名人数 | 是 |
| quota | number | 名额上限 | 是 |

**索引建议**：
- id（唯一索引）

**初始数据**：需要预先创建课程记录。

---

### 9. orders（订单）

存储课程订单信息。

```json
{
  "_id": "auto",
  "orderId": "ORDER_xxx",
  "openid": "oABC123...",
  "courseId": 1,
  "courseTitle": "开演啦！中国古典四大名著",
  "courseImage": "https://xxx.jpg",
  "price": 1980,
  "userInfo": {
    "name": "小明",
    "phone": "13800138000"
  },
  "status": "pending",
  "statusText": "待支付",
  "createTime": "2026-01-14T10:00:00.000Z",
  "timestamp": 1704960000000,
  "payTime": null,
  "cancelTime": null
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 自动生成 | 是 |
| orderId | string | 订单号 | 是 |
| openid | string | 用户OpenID | 是 |
| courseId | number | 课程ID | 是 |
| courseTitle | string | 课程标题 | 是 |
| courseImage | string | 课程图片 | 是 |
| price | number | 价格 | 是 |
| userInfo | object | 用户信息 | 是 |
| status | string | 订单状态 | 是 |
| statusText | string | 状态文本 | 是 |
| createTime | serverDate | 创建时间 | 是 |
| timestamp | number | 时间戳 | 是 |
| payTime | date | 支付时间 | 否 |
| cancelTime | date | 取消时间 | 否 |

**订单状态**：
- pending: 待支付
- paid: 待开始
- ongoing: 进行中
- completed: 已完成
- cancelled: 已取消

**索引建议**：
- openid（普通索引）
- orderId（唯一索引）

---

### 10. classes（班级信息）

存储班级信息，用于验证班级码。

```json
{
  "_id": "auto",
  "classCode": "CLASS001",
  "school": "北京示例小学",
  "grade": "三年级",
  "name": "1班",
  "createTime": "2026-01-14T10:00:00.000Z"
}
```

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| _id | string | 自动生成 | 是 |
| classCode | string | 班级码（唯一） | 是 |
| school | string | 学校名称 | 是 |
| grade | string | 年级 | 是 |
| name | string | 班级名称 | 是 |
| createTime | serverDate | 创建时间 | 是 |

**索引建议**：
- classCode（唯一索引）

---

## 权限配置建议

### 开发环境

开发阶段可以设置为"所有用户可读可写"便于调试。

### 生产环境

#### authorizations
```json
{
  "read": "doc.openid == auth.openid",
  "write": "doc.openid == auth.openid"
}
```

#### users
```json
{
  "read": "doc.openid == auth.openid",
  "write": "doc.openid == auth.openid"
}
```

#### votes
```json
{
  "read": true,
  "write": "doc.openid == auth.openid && doc._openid == undefined"
}
```

#### vote_stats
```json
{
  "read": true,
  "write": false
}
```

#### albums
```json
{
  "read": true,
  "write": false
}
```

#### certificates
```json
{
  "read": "doc.openid == auth.openid",
  "write": false
}
```

#### orders
```json
{
  "read": "doc.openid == auth.openid",
  "write": "doc.openid == auth.openid"
}
```

#### classes
```json
{
  "read": true,
  "write": false
}
```

---

## 数据迁移脚本

如需从其他系统迁移数据，可参考以下云函数示例：

```javascript
// migrate云函数
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  // 示例：批量导入班级数据
  const classes = [
    { classCode: 'CLASS001', school: '示例小学', grade: '三年级', name: '1班' },
    // ... 更多班级
  ]
  
  for (let cls of classes) {
    await db.collection('classes').add({
      data: {
        ...cls,
        createTime: db.serverDate()
      }
    })
  }
  
  return { success: true }
}
```

---

**文档更新日期**：2026年1月14日

