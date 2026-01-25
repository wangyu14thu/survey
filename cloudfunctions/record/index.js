// 成长记录云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action } = event

  try {
    switch (action) {
      case 'createRecord':
        return await createRecord(event)
      
      case 'getRecords':
        return await getRecords(event)
      
      case 'commentRecord':
        return await commentRecord(event)

      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('成长记录操作失败', err)
    return {
      success: false,
      message: err.message
    }
  }
}

// 创建记录
async function createRecord(event) {
  const { openid, authorName, authorRole, school, images, content } = event

  await db.collection('records').add({
    data: {
      openid,
      authorName,
      authorRole,
      school,
      images: images || [],
      content: content || '',
      comments: [],
      createTime: db.serverDate()
    }
  })

  return {
    success: true,
    message: '发布成功'
  }
}

// 获取记录（按学校过滤）
async function getRecords(event) {
  const { school } = event

  const result = await db.collection('records')
    .where({ school })
    .orderBy('createTime', 'desc')
    .limit(50)
    .get()

  return {
    success: true,
    records: result.data
  }
}

// 评论记录
async function commentRecord(event) {
  const { recordId, openid, authorName, content } = event

  await db.collection('records').doc(recordId).update({
    data: {
      comments: _.push({
        openid,
        authorName,
        content,
        createTime: db.serverDate()
      })
    }
  })

  return {
    success: true,
    message: '评论成功'
  }
}

