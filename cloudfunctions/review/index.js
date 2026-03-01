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
    case 'getArticle':
      return await getArticle(event)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取回顾文章
async function getArticle(event) {
  const { school_id, act_id } = event

  try {
    const res = await db.collection('review_articles')
      .where({
        school_id,
        act_id
      })
      .get()

    if (res.data.length === 0) {
      return {
        success: true,
        data: null
      }
    }

    return {
      success: true,
      data: res.data[0]
    }
  } catch (err) {
    console.error('获取回顾文章失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}
