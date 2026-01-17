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
  const { openid, nickname, grade, region, phone, registerTime } = event

  // 检查是否已注册
  const userResult = await db.collection('users')
    .where({ openid })
    .limit(1)
    .get()

  if (userResult.data.length > 0) {
    return {
      success: false,
      message: '您已经注册过了'
    }
  }

  // 创建用户记录
  await db.collection('users').add({
    data: {
      openid,
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
    message: '注册成功'
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

