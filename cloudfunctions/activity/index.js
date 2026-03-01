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
    case 'getInfo':
      return await getInfo(event)
    case 'getStages':
      return await getStages(event)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取活动信息
async function getInfo(event) {
  const { school_id, act_id } = event

  try {
    const res = await db.collection('activities')
      .where({
        school_id,
        act_id
      })
      .get()

    if (res.data.length === 0) {
      return {
        success: false,
        message: '活动不存在'
      }
    }

    return {
      success: true,
      data: res.data[0]
    }
  } catch (err) {
    console.error('获取活动信息失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}

// 获取活动阶段状态
async function getStages(event) {
  const { school_id, act_id } = event

  try {
    // 查询活动信息
    const actRes = await db.collection('activities')
      .where({
        school_id,
        act_id
      })
      .get()

    if (actRes.data.length === 0) {
      return {
        success: false,
        message: '活动不存在'
      }
    }

    const activity = actRes.data[0]

    // 返回阶段信息
    return {
      success: true,
      data: {
        stages: activity.stages || [
          { id: 1, name: '目的地投票', icon: '📍', status: 'active', url: '/pages/vote/vote' },
          { id: 2, name: '任务预习', icon: '📚', status: 'locked', url: '/pages/preview/preview' },
          { id: 3, name: '研学过程', icon: '🎒', status: 'locked', url: '/pages/process/process' },
          { id: 4, name: '活动回顾', icon: '📝', status: 'locked', url: '/pages/review/review' }
        ]
      }
    }
  } catch (err) {
    console.error('获取活动阶段失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}
