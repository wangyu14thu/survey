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
    case 'getTasks':
      return await getTasks(event)
    case 'submitAnswer':
      return await submitAnswer(event)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取预习任务
async function getTasks(event) {
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

    // 查询预习任务
    const taskRes = await db.collection('preview_tasks')
      .where({
        task_id: activity.preview_task_id
      })
      .get()

    if (taskRes.data.length === 0) {
      return {
        success: false,
        message: '任务不存在'
      }
    }

    return {
      success: true,
      data: taskRes.data[0]
    }
  } catch (err) {
    console.error('获取预习任务失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}

// 提交答案
async function submitAnswer(event) {
  const { school_id, act_id, openid, answers } = event

  try {
    // 保存答题记录
    await db.collection('preview_answers').add({
      data: {
        school_id,
        act_id,
        openid,
        answers,
        createTime: db.serverDate()
      }
    })

    // TODO: 判断答案是否正确，如果正确则解锁下一站

    return {
      success: true,
      message: '提交成功'
    }
  } catch (err) {
    console.error('提交答案失败:', err)
    return {
      success: false,
      message: '提交失败'
    }
  }
}
