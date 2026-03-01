// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event

  switch (action) {
    case 'getList':
      return await getList(event)
    case 'submit':
      return await submit(event)
    case 'getResult':
      return await getResult(event)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取投票列表
async function getList(event) {
  const { school_id, act_id, openid } = event

  try {
    // 查询活动配置
    const actRes = await db.collection('activities')
      .where({ school_id, act_id })
      .get()

    if (actRes.data.length === 0) {
      return { success: false, message: '活动不存在' }
    }

    const activity = actRes.data[0]

    // 查询目的地列表
    const destRes = await db.collection('destinations')
      .where({
        act_id: _.in(activity.destination_ids || [])
      })
      .get()

    // 查询用户是否已投票
    const voteRes = await db.collection('votes')
      .where({
        school_id,
        act_id,
        openid
      })
      .get()

    const hasVoted = voteRes.data.length > 0

    // 查询每个目的地的票数
    const voteCountRes = await db.collection('votes')
      .where({
        school_id,
        act_id
      })
      .get()

    const voteCounts = {}
    voteCountRes.data.forEach(vote => {
      vote.destinationIds.forEach(id => {
        voteCounts[id] = (voteCounts[id] || 0) + 1
      })
    })

    // 合并票数信息
    const destinations = destRes.data.map(dest => ({
      ...dest,
      votes: voteCounts[dest._id] || 0
    }))

    return {
      success: true,
      data: {
        destinations,
        maxSelect: activity.vote_max_select || 2,
        deadline: activity.vote_deadline || '',
        hasVoted,
        showResult: activity.vote_show_result || false
      }
    }
  } catch (err) {
    console.error('获取投票列表失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}

// 提交投票
async function submit(event) {
  const { school_id, act_id, openid, destinationIds } = event

  try {
    // 检查是否已投票
    const existRes = await db.collection('votes')
      .where({
        school_id,
        act_id,
        openid
      })
      .get()

    if (existRes.data.length > 0) {
      return {
        success: false,
        message: '您已经投过票了'
      }
    }

    // 添加投票记录
    await db.collection('votes').add({
      data: {
        school_id,
        act_id,
        openid,
        destinationIds,
        createTime: db.serverDate()
      }
    })

    return {
      success: true,
      message: '投票成功'
    }
  } catch (err) {
    console.error('投票失败:', err)
    return {
      success: false,
      message: '投票失败'
    }
  }
}

// 获取投票结果
async function getResult(event) {
  const { school_id, act_id } = event

  try {
    // 查询所有投票
    const voteRes = await db.collection('votes')
      .where({
        school_id,
        act_id
      })
      .get()

    // 统计票数
    const voteCounts = {}
    voteRes.data.forEach(vote => {
      vote.destinationIds.forEach(id => {
        voteCounts[id] = (voteCounts[id] || 0) + 1
      })
    })

    // 查询目的地信息
    const destIds = Object.keys(voteCounts)
    if (destIds.length === 0) {
      return {
        success: true,
        data: { winners: [] }
      }
    }

    const destRes = await db.collection('destinations')
      .where({
        _id: _.in(destIds)
      })
      .get()

    // 合并数据并排序
    const destinations = destRes.data.map(dest => ({
      id: dest._id,
      name: dest.name,
      votes: voteCounts[dest._id]
    })).sort((a, b) => b.votes - a.votes)

    return {
      success: true,
      data: {
        winners: destinations.slice(0, 2)
      }
    }
  } catch (err) {
    console.error('获取投票结果失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}
