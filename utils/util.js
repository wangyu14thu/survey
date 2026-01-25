// 工具函数库

/**
 * 格式化时间
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 显示Toast
 */
const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

/**
 * 显示加载中
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载中
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示确认对话框
 */
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        if (res.confirm) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: reject
    })
  })
}

/**
 * 获取用户OpenID
 */
const getOpenId = async () => {
  try {
    const res = await wx.cloud.callFunction({
      name: 'login'
    })
    return res.result.openid
  } catch (err) {
    console.error('获取OpenID失败', err)
    return null
  }
}

/**
 * 检查是否已授权
 */
const checkAuthorization = () => {
  return wx.getStorageSync('isAuthorized') || false
}

/**
 * 检查是否已注册
 */
const checkRegistration = () => {
  return wx.getStorageSync('userInfo') || null
}

/**
 * 倒计时格式化
 */
const formatCountdown = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}小时${minutes}分${secs}秒`
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`
  } else {
    return `${secs}秒`
  }
}

/**
 * 图片压缩
 */
const compressImage = (src) => {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src,
      quality: 80,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 保存图片到相册
 */
const saveImageToAlbum = async (filePath) => {
  try {
    // 先获取授权
    const auth = await wx.getSetting()
    if (!auth.authSetting['scope.writePhotosAlbum']) {
      await wx.authorize({
        scope: 'scope.writePhotosAlbum'
      })
    }
    
    await wx.saveImageToPhotosAlbum({
      filePath
    })
    showToast('保存成功', 'success')
    return true
  } catch (err) {
    if (err.errMsg.includes('auth deny')) {
      const confirm = await showConfirm('需要授权保存图片到相册')
      if (confirm) {
        wx.openSetting()
      }
    } else {
      showToast('保存失败')
    }
    return false
  }
}

module.exports = {
  formatTime,
  formatNumber,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  getOpenId,
  checkAuthorization,
  checkRegistration,
  formatCountdown,
  compressImage,
  saveImageToAlbum
}

