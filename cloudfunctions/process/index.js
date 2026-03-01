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
    case 'getList':
      return await getList(event)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取研学过程列表
async function getList(event) {
  const { school_id, act_id, page = 1, pageSize = 20 } = event

  try {
    const skip = (page - 1) * pageSize

    const countRes = await db.collection('process_posts')
      .where({
        school_id,
        act_id
      })
      .count()

    const dataRes = await db.collection('process_posts')
      .where({
        school_id,
        act_id
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: {
        list: dataRes.data,
        hasMore: skip + dataRes.data.length < countRes.total
      }
    }
  } catch (err) {
    console.error('获取研学过程失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}
