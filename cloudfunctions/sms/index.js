// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event

  switch (action) {
    case 'sendCode':
      return await sendCode(event)
    case 'verifyCode':
      return await verifyCode(event)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 发送验证码
async function sendCode(event) {
  const { phone } = event

  try {
    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 保存到数据库，设置5分钟过期
    const expireTime = Date.now() + 5 * 60 * 1000

    await db.collection('sms_codes').add({
      data: {
        phone,
        code,
        expireTime,
        used: false,
        createTime: db.serverDate()
      }
    })

    // TODO: 这里需要对接真实的短信服务商API
    // 例如：阿里云短信、腾讯云短信等
    // const smsResult = await sendSMS(phone, code)
    
    console.log(`验证码已生成: ${phone} - ${code}`)

    // 开发环境：直接返回验证码（生产环境要删除这行）
    return {
      success: true,
      message: '验证码已发送',
      code: code  // 生产环境删除这行
    }
  } catch (err) {
    console.error('发送验证码失败:', err)
    return {
      success: false,
      message: '发送失败'
    }
  }
}

// 验证验证码
async function verifyCode(event) {
  const { phone, code } = event

  try {
    // 查询最新的未使用的验证码
    const res = await db.collection('sms_codes')
      .where({
        phone,
        code,
        used: false
      })
      .orderBy('createTime', 'desc')
      .limit(1)
      .get()

    if (res.data.length === 0) {
      return {
        success: false,
        message: '验证码错误'
      }
    }

    const record = res.data[0]

    // 检查是否过期
    if (Date.now() > record.expireTime) {
      return {
        success: false,
        message: '验证码已过期'
      }
    }

    // 标记为已使用
    await db.collection('sms_codes').doc(record._id).update({
      data: {
        used: true
      }
    })

    return {
      success: true,
      message: '验证成功'
    }
  } catch (err) {
    console.error('验证失败:', err)
    return {
      success: false,
      message: '验证失败'
    }
  }
}
