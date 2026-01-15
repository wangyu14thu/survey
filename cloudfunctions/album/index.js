// 相册云函数 - 相册管理
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action } = event

  try {
    switch (action) {
      case 'createAlbum':
        return await createAlbum(event)
      
      case 'getAlbums':
        return await getAlbums(event)

      default:
        return {
          success: false,
          message: '无效的操作'
        }
    }
  } catch (err) {
    console.error('相册操作失败', err)
    return {
      success: false,
      message: err.message
    }
  }
}

// 创建相册
async function createAlbum(event) {
  const { activityName, school, grade, classId, className, photos, uploadTime } = event

  await db.collection('albums').add({
    data: {
      activityName,
      school,
      grade,
      classId,
      className,
      photos,
      photoCount: photos.length,
      cover: photos[0].url,
      uploadTime,
      date: new Date().toLocaleDateString(),
      createTime: db.serverDate()
    }
  })

  return {
    success: true,
    message: '上传成功'
  }
}

// 获取相册列表
async function getAlbums(event) {
  const { classId, school } = event

  // 获取本班级相册
  const myClassResult = await db.collection('albums')
    .where({ classId })
    .orderBy('uploadTime', 'desc')
    .limit(1)
    .get()

  // 获取全校其他班级相册
  const schoolResult = await db.collection('albums')
    .where({
      school,
      classId: db.command.neq(classId)
    })
    .orderBy('uploadTime', 'desc')
    .limit(10)
    .get()

  return {
    success: true,
    data: {
      myClassAlbum: myClassResult.data[0] || null,
      schoolAlbums: schoolResult.data
    }
  }
}

