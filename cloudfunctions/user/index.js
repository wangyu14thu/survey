// 用户云函数 - 用户注册、信息管理
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action } = event

  try {
    switch (action) {
      case 'register':
        return await register(event)
      
      case 'getUserInfo':
        return await getUserInfo(event)
      
      case 'getStats':
        return await getStats(event)

      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('用户操作失败', err)
    return {
      success: false,
      message: err.message
    }
  }
}

// 用户注册
async function register(event) {
  const { openid, role, nickname, grade, region, phone, registerTime } = event

  // 检查是否已注册
  const userResult = await db.collection('users')
    .where({ openid })
    .limit(1)
    .get()

  if (userResult.data.length > 0) {
    // 用户已注册，需要验证姓名和手机号是否匹配
    const existingUser = userResult.data[0]
    
    // 验证姓名和手机号是否完全匹配
    if (existingUser.nickname === nickname && existingUser.phone === phone) {
      // 身份验证通过，欢迎回来
      return {
        success: true,
        message: '欢迎回来',
        userInfo: {
          openid: existingUser.openid,
          role: existingUser.role,
          nickname: existingUser.nickname,
          grade: existingUser.grade,
          region: existingUser.region,
          phone: existingUser.phone
        }
      }
    } else {
      // 身份验证失败，姓名或手机号不匹配
      return {
        success: false,
        message: '该微信账号已注册，但姓名或手机号不匹配，请核对信息后重试',
        code: 'INFO_MISMATCH'
      }
    }
  }

  // 创建新用户记录
  await db.collection('users').add({
    data: {
      openid,
      role, // 添加身份字段
      nickname,
      grade,
      region: region.join(' '),
      phone,
      registerTime,
      createTime: db.serverDate()
    }
  })

  return {
    success: true,
    message: '注册成功',
    userInfo: {
      openid,
      role,
      nickname,
      grade,
      region: region.join(' '),
      phone
    }
  }
}

// 获取用户信息
async function getUserInfo(event) {
  const { openid } = event

  const userResult = await db.collection('users')
    .where({ openid })
    .limit(1)
    .get()

  if (userResult.data.length > 0) {
    const user = userResult.data[0]
    return {
      success: true,
      userInfo: {
        openid: user.openid,
        role: user.role,
        nickname: user.nickname,
        grade: user.grade,
        region: user.region,
        phone: user.phone
      }
    }
  }

  return {
    success: false,
    message: '用户不存在'
  }
}

// 获取统计数据
async function getStats(event) {
  const { openid } = event

  // 获取证书数量
  const certResult = await db.collection('certificates')
    .where({ openid })
    .count()

  // 获取订单数量
  const orderResult = await db.collection('orders')
    .where({ openid })
    .count()

  // 获取相册数量
  const albumResult = await db.collection('albums')
    .where({ openid })
    .count()

  return {
    success: true,
    stats: {
      certificates: certResult.total,
      orders: orderResult.total,
      albums: albumResult.total
    }
  }
}

