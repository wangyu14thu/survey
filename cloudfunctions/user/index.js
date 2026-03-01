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
    case 'register':
      return await register(event)
    case 'getUserInfo':
      return await getUserInfo(event)
    case 'getActivities':
      return await getActivities(event)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 用户注册
async function register(event) {
  const { openid, studentName, parentPhone, smsCode, grade, class: className, school_id, act_id, registerTime } = event

  try {
    // 验证短信验证码(需要调用短信服务商API)
    // const smsValid = await verifySmsCode(parentPhone, smsCode)
    // if (!smsValid) {
    //   return { success: false, message: '验证码错误' }
    // }

    // 检查是否已注册
    const existUser = await db.collection('users').where({
      openid
    }).get()

    if (existUser.data.length > 0) {
      return {
        success: false,
        message: '该用户已注册'
      }
    }

    // 创建用户
    const result = await db.collection('users').add({
      data: {
        openid,
        studentName,
        parentPhone,
        grade,
        class: className,
        school_id,
        act_id,
        registerTime,
        avatar: '',
        createTime: db.serverDate()
      }
    })

    return {
      success: true,
      message: '注册成功',
      data: {
        _id: result._id
      }
    }
  } catch (err) {
    console.error('注册失败:', err)
    return {
      success: false,
      message: '注册失败'
    }
  }
}

// 获取用户信息
async function getUserInfo(event) {
  const { openid } = event

  try {
    const result = await db.collection('users').where({
      openid
    }).get()

    if (result.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    return {
      success: true,
      data: result.data[0]
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}

// 获取用户参与的活动列表
async function getActivities(event) {
  const { openid } = event

  try {
    // 查询用户信息
    const userResult = await db.collection('users').where({
      openid
    }).get()

    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = userResult.data[0]

    // 查询该用户参与的所有活动
    const activitiesResult = await db.collection('activities').where({
      school_id: user.school_id
    }).orderBy('startTime', 'desc').get()

    return {
      success: true,
      data: {
        list: activitiesResult.data
      }
    }
  } catch (err) {
    console.error('获取活动列表失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}
