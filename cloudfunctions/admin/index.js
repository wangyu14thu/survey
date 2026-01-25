// 管理员云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action } = event

  try {
    switch (action) {
      case 'getStats':
        return await getStats()
      
      case 'endVote':
        return await endVote()
      
      case 'publishResult':
        return await publishResult()
      
      case 'updateCourseQuota':
        return await updateCourseQuota(event)

      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('管理操作失败', err)
    return {
      success: false,
      message: err.message
    }
  }
}

// 获取统计数据
async function getStats() {
  const [votesResult, usersResult, ordersResult, albumsResult] = await Promise.all([
    db.collection('votes').count(),
    db.collection('users').count(),
    db.collection('orders').count(),
    db.collection('albums').count()
  ])

  return {
    success: true,
    stats: {
      totalVotes: votesResult.total,
      totalUsers: usersResult.total,
      totalOrders: ordersResult.total,
      totalAlbums: albumsResult.total
    }
  }
}

// 截止投票
async function endVote() {
  await db.collection('vote_config').doc('main').update({
    data: {
      ended: true,
      endTime: db.serverDate()
    }
  })

  return {
    success: true,
    message: '投票已截止'
  }
}

// 公布结果
async function publishResult() {
  await db.collection('vote_config').doc('main').update({
    data: {
      published: true,
      publishTime: db.serverDate()
    }
  })

  return {
    success: true,
    message: '结果已公布'
  }
}

// 更新课程名额
async function updateCourseQuota(event) {
  const { courseId, quota } = event

  await db.collection('courses')
    .where({ id: courseId })
    .update({
      data: {
        quota
      }
    })

  return {
    success: true,
    message: '名额已更新'
  }
}

