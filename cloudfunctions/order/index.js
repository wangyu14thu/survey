// 订单云函数 - 订单管理
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action } = event

  try {
    switch (action) {
      case 'getOrders':
        return await getOrders(event)
      
      case 'cancelOrder':
        return await cancelOrder(event)
      
      case 'createOrder':
        return await createOrder(event)

      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('订单操作失败', err)
    return {
      success: false,
      message: err.message
    }
  }
}

// 获取订单列表
async function getOrders(event) {
  const { openid } = event

  const result = await db.collection('orders')
    .where({ openid })
    .orderBy('createTime', 'desc')
    .get()

  return {
    success: true,
    orders: result.data
  }
}

// 取消订单
async function cancelOrder(event) {
  const { orderId, openid } = event

  // 验证订单所有者
  const orderResult = await db.collection('orders')
    .where({
      _id: orderId,
      openid
    })
    .limit(1)
    .get()

  if (orderResult.data.length === 0) {
    return {
      success: false,
      message: '订单不存在或无权操作'
    }
  }

  const order = orderResult.data[0]

  if (order.status !== 'pending') {
    return {
      success: false,
      message: '只能取消待支付的订单'
    }
  }

  // 更新订单状态
  await db.collection('orders')
    .doc(orderId)
    .update({
      data: {
        status: 'cancelled',
        cancelTime: db.serverDate()
      }
    })

  return {
    success: true,
    message: '订单已取消'
  }
}

// 创建订单
async function createOrder(event) {
  const { openid, courseId, courseTitle, courseImage, price, userInfo } = event

  const orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

  await db.collection('orders').add({
    data: {
      orderId,
      openid,
      courseId,
      courseTitle,
      courseImage,
      price,
      userInfo,
      status: 'pending',
      statusText: '待支付',
      createTime: db.serverDate(),
      timestamp: Date.now()
    }
  })

  return {
    success: true,
    orderId,
    message: '订单创建成功'
  }
}

