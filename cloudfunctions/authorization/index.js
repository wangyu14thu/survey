// 授权云函数 - 记录监护人授权信息
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, openid, timestamp } = event

  try {
    switch (action) {
      case 'create':
        // 创建授权记录
        await db.collection('authorizations').add({
          data: {
            openid,
            timestamp,
            createTime: db.serverDate()
          }
        })
        
        return {
          success: true,
          message: '授权成功'
        }

      case 'check':
        // 检查授权状态
        const result = await db.collection('authorizations')
          .where({ openid })
          .limit(1)
          .get()
        
        return {
          success: true,
          isAuthorized: result.data.length > 0
        }

      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('授权操作失败', err)
    return {
      success: false,
      message: err.message
    }
  }
}

