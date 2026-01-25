// 投票云函数 - 投票管理
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
      case 'vote':
        return await vote(event)
      
      case 'checkUserVote':
        return await checkUserVote(event)
      
      case 'getStatus':
        return await getStatus(event)
      
      case 'getResult':
        return await getResult(event)

      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('投票操作失败', err)
    return {
      success: false,
      message: err.message
    }
  }
}

// 投票
async function vote(event) {
  const { openid, themeId, themeName } = event

  // 检查是否已投票
  const voteResult = await db.collection('votes')
    .where({ openid })
    .limit(1)
    .get()

  if (voteResult.data.length > 0) {
    return {
      success: false,
      message: '您已经投过票了，不能重复投票'
    }
  }

  // 检查投票是否已结束（这里简化处理，实际应该从配置表读取）
  // 假设投票时间为7天
  const voteEndTime = new Date('2026-01-21').getTime()
  if (Date.now() > voteEndTime) {
    return {
      success: false,
      message: '投票已结束'
    }
  }

  // 创建投票记录
  await db.collection('votes').add({
    data: {
      openid,
      themeId,
      themeName,
      voteTime: db.serverDate(),
      timestamp: Date.now()
    }
  })

  // 更新投票统计
  await db.collection('vote_stats')
    .where({ themeId })
    .update({
      data: {
        votes: _.inc(1)
      }
    })

  return {
    success: true,
    message: '投票成功'
  }
}

// 检查用户是否已投票
async function checkUserVote(event) {
  const { openid } = event

  const result = await db.collection('votes')
    .where({ openid })
    .limit(1)
    .get()

  return {
    success: true,
    hasVoted: result.data.length > 0,
    voteData: result.data[0] || null
  }
}

// 获取投票状态
async function getStatus(event) {
  const { openid } = event

  // 获取总投票数
  const totalResult = await db.collection('votes').count()

  // 检查用户是否已投票
  const userVoteResult = await db.collection('votes')
    .where({ openid })
    .limit(1)
    .get()

  // 投票结束时间（这里写死，实际应该从配置表读取）
  const voteEndTime = new Date('2026-01-21').getTime()
  const publishTime = voteEndTime + 12 * 60 * 60 * 1000 // 结束后12小时公布

  return {
    success: true,
    data: {
      totalVotes: totalResult.total,
      hasVoted: userVoteResult.data.length > 0,
      voteEnded: Date.now() > voteEndTime,
      resultPublished: Date.now() > publishTime,
      publishTime: publishTime
    }
  }
}

// 获取投票结果
async function getResult() {
  // 获取各主题投票统计
  const statsResult = await db.collection('vote_stats')
    .orderBy('votes', 'desc')
    .get()

  // 获取总投票数
  const totalResult = await db.collection('votes').count()

  return {
    success: true,
    data: {
      rankings: statsResult.data,
      totalVotes: totalResult.total
    }
  }
}

