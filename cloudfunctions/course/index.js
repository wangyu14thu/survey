// 课程云函数 - 课程管理
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action } = event

  try {
    switch (action) {
      case 'getCourses':
        return await getCourses()
      
      case 'getCourseDetail':
        return await getCourseDetail(event)

      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('课程操作失败', err)
    return {
      success: false,
      message: err.message
    }
  }
}

// 获取课程列表（包括报名人数）
async function getCourses() {
  const result = await db.collection('courses').get()

  return {
    success: true,
    courses: result.data
  }
}

// 获取课程详情
async function getCourseDetail(event) {
  const { courseId } = event

  const result = await db.collection('courses')
    .where({ id: courseId })
    .limit(1)
    .get()

  if (result.data.length === 0) {
    return {
      success: false,
      message: '课程不存在'
    }
  }

  return {
    success: true,
    enrolled: result.data[0].enrolled || 0
  }
}

