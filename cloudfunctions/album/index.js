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
    case 'getDetail':
      return await getDetail(event)
    default:
      return {
        success: false,
        message: '未知操作'
      }
  }
}

// 获取相册列表
async function getList(event) {
  const { school_id, grade = '' } = event

  try {
    const where = { school_id }
    if (grade) {
      where.grade = grade
    }

    const res = await db.collection('albums')
      .where(where)
      .orderBy('createTime', 'desc')
      .get()

    return {
      success: true,
      data: {
        list: res.data
      }
    }
  } catch (err) {
    console.error('获取相册列表失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}

// 获取相册详情
async function getDetail(event) {
  const { albumId } = event

  try {
    // 获取相册信息
    const albumRes = await db.collection('albums').doc(albumId).get()

    if (!albumRes.data) {
      return {
        success: false,
        message: '相册不存在'
      }
    }

    // 获取照片列表
    const photosRes = await db.collection('photos')
      .where({
        albumId
      })
      .get()

    return {
      success: true,
      data: {
        album: albumRes.data,
        photos: photosRes.data
      }
    }
  } catch (err) {
    console.error('获取相册详情失败:', err)
    return {
      success: false,
      message: '获取失败'
    }
  }
}
