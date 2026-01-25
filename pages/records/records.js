// pages/records/records.js
const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: null,
    records: [],
    canUpload: false
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ 
      userInfo,
      canUpload: userInfo && userInfo.role === 'teacher' // 只有老师可以上传
    })
  },

  onShow() {
    this.loadRecords()
  },

  // 加载成长记录
  async loadRecords() {
    if (!this.data.userInfo || !this.data.userInfo.school) {
      return
    }

    util.showLoading('加载中...')

    try {
      const res = await wx.cloud.callFunction({
        name: 'record',
        data: {
          action: 'getRecords',
          school: this.data.userInfo.school
        }
      })

      util.hideLoading()

      if (res.result.success) {
        const records = res.result.records.map(record => ({
          ...record,
          createTimeText: this.formatTime(record.createTime)
        }))

        this.setData({ records })
      }
    } catch (err) {
      util.hideLoading()
      console.error('加载成长记录失败', err)
    }
  },

  // 格式化时间
  formatTime(date) {
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
      return Math.floor(diff / minute) + '分钟前'
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前'
    } else if (diff < 7 * day) {
      return Math.floor(diff / day) + '天前'
    } else {
      return `${d.getMonth() + 1}-${d.getDate()}`
    }
  },

  // 显示上传选项
  showUploadOptions() {
    if (!this.data.canUpload) {
      util.showToast('仅老师可以上传')
      return
    }

    wx.showActionSheet({
      itemList: ['上传照片', '写日志'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.uploadImages()
        } else if (res.tapIndex === 1) {
          this.writeLog()
        }
      }
    })
  },

  // 上传照片
  uploadImages() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadRecord(res.tempFilePaths, '')
      }
    })
  },

  // 写日志
  writeLog() {
    wx.navigateTo({
      url: '/pages/write-log/write-log'
    })
  },

  // 上传记录
  async uploadRecord(images, content) {
    util.showLoading('上传中...')

    try {
      const imageUrls = []
      
      // 上传图片到云存储
      for (let i = 0; i < images.length; i++) {
        const cloudPath = `records/${Date.now()}_${i}.jpg`
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: images[i]
        })
        imageUrls.push(uploadRes.fileID)
      }

      // 保存记录到数据库
      const res = await wx.cloud.callFunction({
        name: 'record',
        data: {
          action: 'createRecord',
          openid: this.data.userInfo.openid,
          authorName: this.data.userInfo.nickname,
          authorRole: this.data.userInfo.role,
          school: this.data.userInfo.school,
          images: imageUrls,
          content: content
        }
      })

      util.hideLoading()

      if (res.result.success) {
        util.showToast('发布成功', 'success')
        this.loadRecords()
      } else {
        throw new Error(res.result.message)
      }
    } catch (err) {
      util.hideLoading()
      console.error('上传失败', err)
      util.showToast('上传失败，请重试')
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls
    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  // 评论
  commentRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '评论',
      editable: true,
      placeholderText: '说点什么...',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await wx.cloud.callFunction({
              name: 'record',
              data: {
                action: 'commentRecord',
                recordId: id,
                openid: this.data.userInfo.openid,
                authorName: this.data.userInfo.nickname,
                content: res.content
              }
            })
            util.showToast('评论成功', 'success')
            this.loadRecords()
          } catch (err) {
            console.error('评论失败', err)
            util.showToast('评论失败')
          }
        }
      }
    })
  }
})

