// 证书云函数 - 证书管理
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action } = event

  try {
    switch (action) {
      case 'getCertificates':
        return await getCertificates(event)
      
      case 'generateImage':
        return await generateImage(event)

      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('证书操作失败', err)
    return {
      success: false,
      message: err.message
    }
  }
}

// 获取证书列表
async function getCertificates(event) {
  const { openid } = event

  const result = await db.collection('certificates')
    .where({ openid })
    .orderBy('createTime', 'desc')
    .get()

  return {
    success: true,
    certificates: result.data
  }
}

// 生成证书图片
async function generateImage(event) {
  const { certificate } = event

  // 这里应该调用图片生成服务
  // 简化处理，返回一个模拟的 fileID
  const fileID = 'cloud://certificate-' + Date.now() + '.png'

  return {
    success: true,
    fileID
  }
}

