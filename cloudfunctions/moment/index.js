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
    case 'getDetail':
      return await getDetail(event)
    case 'publish':
      return await publish(event)
    case 'like':
      return await like(event)
    case 'comment':
      return await comment(event)
    case 'getComments':
      return await getComments(event)
    case 'getMyList':
      return await getMyList(event)
    case 'delete':
      return await deleteMoment(event)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取动态列表
async function getList(event) {
  const { school_id, act_id, page = 1, pageSize = 20 } = event

  try {
    const skip = (page - 1) * pageSize

    const countRes = await db.collection('moments')
      .where({
        school_id,
        act_id
      })
      .count()

    const dataRes = await db.collection('moments')
      .where({
        school_id,
        act_id
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取用户信息
    const moments = await Promise.all(dataRes.data.map(async (moment) => {
      const userRes = await db.collection('users').where({ openid: moment.openid }).get()
      const user = userRes.data[0] || {}
      
      return {
        ...moment,
        userName: user.studentName || '匿名',
        userClass: `${user.grade} ${user.class}`,
        userAvatar: user.avatar || '',
        timeText: formatTime(moment.createTime)
      }
    }))

    return {
      success: true,
      data: {
        list: moments,
        hasMore: skip + dataRes.data.length < countRes.total
      }
    }
  } catch (err) {
    console.error('获取动态列表失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}

// 获取动态详情
async function getDetail(event) {
  const { momentId, openid } = event

  try {
    const momentRes = await db.collection('moments').doc(momentId).get()
    
    if (!momentRes.data) {
      return {
        success: false,
        message: '动态不存在'
      }
    }

    const moment = momentRes.data

    // 获取用户信息
    const userRes = await db.collection('users').where({ openid: moment.openid }).get()
    const user = userRes.data[0] || {}

    // 检查是否已点赞
    const likeRes = await db.collection('likes')
      .where({
        momentId,
        openid
      })
      .get()

    return {
      success: true,
      data: {
        ...moment,
        userName: user.studentName || '匿名',
        userClass: `${user.grade} ${user.class}`,
        userAvatar: user.avatar || '',
        timeText: formatTime(moment.createTime),
        isLiked: likeRes.data.length > 0
      }
    }
  } catch (err) {
    console.error('获取动态详情失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}

// 发布动态
async function publish(event) {
  const { school_id, act_id, openid, content, images, classOnly } = event

  try {
    // 获取用户信息
    const userRes = await db.collection('users').where({ openid }).get()
    const user = userRes.data[0]

    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    await db.collection('moments').add({
      data: {
        school_id,
        act_id,
        openid,
        grade: user.grade,
        class: user.class,
        content,
        images,
        classOnly,
        likeCount: 0,
        commentCount: 0,
        createTime: db.serverDate()
      }
    })

    return {
      success: true,
      message: '发布成功'
    }
  } catch (err) {
    console.error('发布动态失败:', err)
    return {
      success: false,
      message: '发布失败'
    }
  }
}

// 点赞
async function like(event) {
  const { momentId, openid } = event

  try {
    // 检查是否已点赞
    const likeRes = await db.collection('likes')
      .where({
        momentId,
        openid
      })
      .get()

    if (likeRes.data.length > 0) {
      // 取消点赞
      await db.collection('likes').doc(likeRes.data[0]._id).remove()
      await db.collection('moments').doc(momentId).update({
        data: {
          likeCount: _.inc(-1)
        }
      })
    } else {
      // 点赞
      await db.collection('likes').add({
        data: {
          momentId,
          openid,
          createTime: db.serverDate()
        }
      })
      await db.collection('moments').doc(momentId).update({
        data: {
          likeCount: _.inc(1)
        }
      })
    }

    return {
      success: true,
      message: '操作成功'
    }
  } catch (err) {
    console.error('点赞失败:', err)
    return {
      success: false,
      message: '操作失败'
    }
  }
}

// 评论
async function comment(event) {
  const { momentId, openid, content } = event

  try {
    await db.collection('comments').add({
      data: {
        momentId,
        openid,
        content,
        createTime: db.serverDate()
      }
    })

    await db.collection('moments').doc(momentId).update({
      data: {
        commentCount: _.inc(1)
      }
    })

    return {
      success: true,
      message: '评论成功'
    }
  } catch (err) {
    console.error('评论失败:', err)
    return {
      success: false,
      message: '评论失败'
    }
  }
}

// 获取评论列表
async function getComments(event) {
  const { momentId, page = 1, pageSize = 20 } = event

  try {
    const skip = (page - 1) * pageSize

    const dataRes = await db.collection('comments')
      .where({
        momentId
      })
      .orderBy('createTime', 'asc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取用户信息
    const comments = await Promise.all(dataRes.data.map(async (comment) => {
      const userRes = await db.collection('users').where({ openid: comment.openid }).get()
      const user = userRes.data[0] || {}
      
      return {
        ...comment,
        userName: user.studentName || '匿名',
        userClass: `${user.grade} ${user.class}`,
        userAvatar: user.avatar || '',
        timeText: formatTime(comment.createTime)
      }
    }))

    return {
      success: true,
      data: {
        list: comments
      }
    }
  } catch (err) {
    console.error('获取评论失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}

// 获取我的动态
async function getMyList(event) {
  const { openid, page = 1, pageSize = 20 } = event

  try {
    const skip = (page - 1) * pageSize

    const countRes = await db.collection('moments')
      .where({
        openid
      })
      .count()

    const dataRes = await db.collection('moments')
      .where({
        openid
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
    console.error('获取我的动态失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}

// 删除动态
async function deleteMoment(event) {
  const { momentId, openid } = event

  try {
    // 检查是否是作者
    const momentRes = await db.collection('moments').doc(momentId).get()
    
    if (!momentRes.data || momentRes.data.openid !== openid) {
      return {
        success: false,
        message: '无权删除'
      }
    }

    await db.collection('moments').doc(momentId).remove()

    return {
      success: true,
      message: '删除成功'
    }
  } catch (err) {
    console.error('删除动态失败:', err)
    return {
      success: false,
      message: '删除失败'
    }
  }
}

// 格式化时间
function formatTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${month}-${day}`
  }
}
