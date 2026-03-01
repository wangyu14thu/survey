# 后台生成活动二维码功能

## 功能说明

为每个"学校×年级×研学活动"生成专属的微信小程序码,用户扫码后自动携带 `school_id` 和 `act_id` 进入注册页面。

## 技术方案

使用微信小程序码接口生成二维码图片。

### 接口信息

**接口地址:** 
```
POST https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=ACCESS_TOKEN
```

**请求参数:**
```json
{
  "scene": "sid=学校ID&aid=活动ID",
  "page": "pages/register/register",
  "width": 430,
  "auto_color": false,
  "line_color": {"r":255,"g":107,"b":107},
  "is_hyaline": true
}
```

**参数说明:**
- `scene`: 最大32个可见字符,用于携带参数
- `page`: 扫码后跳转的页面路径
- `width`: 二维码宽度,单位px,最小280px,最大1280px
- `auto_color`: 是否自动配置线条颜色
- `line_color`: 自定义颜色(RGB格式)
- `is_hyaline`: 是否需要透明底色

## 后台实现步骤

### 1. 获取 access_token

```javascript
// Node.js 示例
const axios = require('axios');

async function getAccessToken(appid, secret) {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
  const response = await axios.get(url);
  return response.data.access_token;
}
```

### 2. 生成小程序码

```javascript
async function generateQRCode(accessToken, schoolId, actId) {
  const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
  
  const params = {
    scene: `sid=${schoolId}&aid=${actId}`,
    page: 'pages/register/register',
    width: 430,
    auto_color: false,
    line_color: {r: 255, g: 107, b: 107},
    is_hyaline: true
  };

  const response = await axios.post(url, params, {
    responseType: 'arraybuffer'
  });

  // 返回的是图片二进制数据
  return response.data;
}
```

### 3. 保存图片

```javascript
const fs = require('fs');
const path = require('path');

async function saveQRCode(imageBuffer, schoolId, actId) {
  const filename = `qrcode_${schoolId}_${actId}.png`;
  const filepath = path.join(__dirname, 'qrcodes', filename);
  
  fs.writeFileSync(filepath, imageBuffer);
  
  return filepath;
}
```

### 4. 完整示例

```javascript
const axios = require('axios');
const fs = require('fs');

// 配置
const config = {
  appid: 'your_appid',
  secret: 'your_secret'
};

// 生成二维码主函数
async function generateActivityQRCode(schoolId, actId) {
  try {
    // 1. 获取access_token
    const accessToken = await getAccessToken(config.appid, config.secret);
    
    // 2. 生成小程序码
    const imageBuffer = await generateQRCode(accessToken, schoolId, actId);
    
    // 3. 保存图片
    const filepath = await saveQRCode(imageBuffer, schoolId, actId);
    
    console.log('二维码生成成功:', filepath);
    return filepath;
  } catch (error) {
    console.error('生成二维码失败:', error);
    throw error;
  }
}

// 调用示例
generateActivityQRCode('school001', 'act001');
```

## 后台管理界面

### 页面布局

```html
<!DOCTYPE html>
<html>
<head>
  <title>生成活动二维码</title>
  <style>
    .form-container {
      max-width: 600px;
      margin: 50px auto;
      padding: 30px;
      border: 1px solid #ddd;
      border-radius: 10px;
    }
    .form-item {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 12px;
      background-color: #FF6B6B;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover {
      background-color: #FF5252;
    }
    #qrcode-result {
      margin-top: 30px;
      text-align: center;
    }
    #qrcode-result img {
      max-width: 300px;
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <h2>生成活动二维码</h2>
    
    <div class="form-item">
      <label>学校:</label>
      <select id="school-select">
        <option value="">请选择学校</option>
        <option value="school001">XX小学</option>
        <option value="school002">XX中学</option>
      </select>
    </div>

    <div class="form-item">
      <label>年级:</label>
      <select id="grade-select">
        <option value="">请选择年级</option>
        <option value="grade1">一年级</option>
        <option value="grade2">二年级</option>
        <option value="grade3">三年级</option>
      </select>
    </div>

    <div class="form-item">
      <label>活动名称:</label>
      <input type="text" id="activity-name" placeholder="如:2026春季研学活动">
    </div>

    <div class="form-item">
      <label>活动ID:</label>
      <input type="text" id="activity-id" placeholder="活动唯一标识">
    </div>

    <button onclick="generateQRCode()">生成二维码</button>

    <div id="qrcode-result" style="display:none;">
      <h3>二维码生成成功</h3>
      <img id="qrcode-image" src="" alt="活动二维码">
      <div>
        <a id="download-link" download>下载二维码</a>
      </div>
    </div>
  </div>

  <script>
    async function generateQRCode() {
      const schoolId = document.getElementById('school-select').value;
      const gradeId = document.getElementById('grade-select').value;
      const activityName = document.getElementById('activity-name').value;
      const activityId = document.getElementById('activity-id').value;

      if (!schoolId || !gradeId || !activityName || !activityId) {
        alert('请填写完整信息');
        return;
      }

      try {
        // 调用后台接口生成二维码
        const response = await fetch('/api/generate-qrcode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            school_id: schoolId,
            grade_id: gradeId,
            activity_name: activityName,
            act_id: activityId
          })
        });

        const data = await response.json();

        if (data.success) {
          // 显示二维码
          document.getElementById('qrcode-image').src = data.qrcode_url;
          document.getElementById('download-link').href = data.qrcode_url;
          document.getElementById('qrcode-result').style.display = 'block';
        } else {
          alert('生成失败: ' + data.message);
        }
      } catch (error) {
        alert('生成失败: ' + error.message);
      }
    }
  </script>
</body>
</html>
```

## API接口设计

### 生成二维码接口

**接口路径:** `/api/generate-qrcode`

**请求方法:** POST

**请求参数:**
```json
{
  "school_id": "school001",
  "grade_id": "grade1",
  "activity_name": "2026春季研学活动",
  "act_id": "act001"
}
```

**响应格式:**
```json
{
  "success": true,
  "message": "生成成功",
  "data": {
    "qrcode_url": "https://example.com/qrcodes/qrcode_school001_act001.png",
    "school_id": "school001",
    "act_id": "act001",
    "create_time": "2026-03-01 10:30:00"
  }
}
```

## 数据库表设计

### qrcodes 表
```sql
CREATE TABLE qrcodes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(50) NOT NULL,
  grade_id VARCHAR(50) NOT NULL,
  act_id VARCHAR(50) NOT NULL,
  activity_name VARCHAR(200) NOT NULL,
  qrcode_url VARCHAR(500) NOT NULL,
  scene_params VARCHAR(100) NOT NULL,
  create_time DATETIME NOT NULL,
  creator_id INT,
  status TINYINT DEFAULT 1 COMMENT '1:有效 0:失效',
  INDEX idx_school_act (school_id, act_id)
);
```

## 注意事项

1. **scene参数限制**: 最大32个可见字符,建议使用短标识符
2. **access_token缓存**: access_token有效期2小时,建议缓存使用
3. **接口调用限制**: 
   - 每个小程序每天限制100万次
   - 建议对生成的二维码进行缓存
4. **图片存储**: 建议将生成的二维码上传到云存储或CDN
5. **安全性**: 后台接口需要进行权限验证

## 使用流程

1. 管理员登录后台
2. 选择学校、年级
3. 填写活动名称和ID
4. 点击生成按钮
5. 系统生成二维码并保存
6. 下载二维码图片
7. 分发给学生/家长扫码注册

## 扩展功能

1. **批量生成**: 支持一次性为多个班级生成二维码
2. **样式定制**: 允许自定义二维码颜色和logo
3. **统计功能**: 记录每个二维码的扫码次数
4. **失效管理**: 支持设置二维码有效期
5. **打印模板**: 提供二维码打印模板
