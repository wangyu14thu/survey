// pages/album/album.js
const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: null,
    myClassAlbum: null,
    schoolAlbums: [],
    isTeacher: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadAlbums()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = util.checkRegistration()
    if (userInfo) {
      this.setData({ 
        userInfo,
        isTeacher: userInfo.role === 'teacher'
      })
    }
  },

  // 加载相册
  async loadAlbums() {
    if (!this.data.userInfo) return

    util.showLoading('加载中...')

    try {
      const res = await wx.cloud.callFunction({
        name: 'album',
        data: {
          action: 'getAlbums',
          classId: this.data.userInfo.classId,
          school: this.data.userInfo.school
        }
      })

      util.hideLoading()

      if (res.result.success) {
        const data = res.result.data
        
        // 处理我的班级相册
        if (data.myClassAlbum && data.myClassAlbum.photos) {
          data.myClassAlbum.photoUrls = data.myClassAlbum.photos.map(p => p.url)
        }

        this.setData({
          myClassAlbum: data.myClassAlbum,
          schoolAlbums: data.schoolAlbums || []
        })
      }
    } catch (err) {
      util.hideLoading()
      console.error('加载相册失败', err)
      util.showToast('加载失败，请重试')
    }
  },

  // 预览照片
  previewPhoto(e) {
    const { urls, index } = e.currentTarget.dataset
    wx.previewImage({
      urls,
      current: urls[index]
    })
  },

  // 查看相册详情
  viewAlbumDetail(e) {
    const album = e.currentTarget.dataset.album
    // 将相册数据暂存
    wx.setStorageSync('currentAlbum', album)
    wx.navigateTo({
      url: '/pages/album/album-detail'
    })
  },

  // 保存全部照片
  async downloadAll(e) {
    const album = e.currentTarget.dataset.album
    
    const confirm = await util.showConfirm(
      `确定要保存全部${album.photos.length}张照片到相册吗？`,
      '批量保存'
    )

    if (!confirm) return

    util.showLoading(`保存中...0/${album.photos.length}`)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < album.photos.length; i++) {
      const photo = album.photos[i]
      
      try {
        // 先下载到临时文件
        const tempFile = await wx.cloud.downloadFile({
          fileID: photo.fileID
        })

        // 保存到相册
        await util.saveImageToAlbum(tempFile.tempFilePath)
        successCount++
      } catch (err) {
        console.error('保存失败', err)
        failCount++
      }

      // 更新进度
      util.showLoading(`保存中...${i + 1}/${album.photos.length}`)
    }

    util.hideLoading()
    
    if (successCount > 0) {
      util.showToast(`成功保存${successCount}张照片`, 'success')
    }
    
    if (failCount > 0) {
      setTimeout(() => {
        util.showToast(`${failCount}张照片保存失败`)
      }, 2000)
    }
  },

  // 分享相册
  shareAlbum(e) {
    const album = e.currentTarget.dataset.album
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    util.showToast('点击右上角分享')
  },

  // 跳转到教师上传页面
  navigateToUpload() {
    wx.navigateTo({
      url: '/pages/teacher/upload'
    })
  },

  // 分享配置
  onShareAppMessage() {
    const album = this.data.myClassAlbum
    if (album) {
      return {
        title: `${album.activityName} - 精彩瞬间`,
        path: '/pages/album/album',
        imageUrl: album.photos[0].url
      }
    }
    return {
      title: '社会实践 - 云端相册',
      path: '/pages/album/album'
    }
  }
})

