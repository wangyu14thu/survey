// pages/certificate/certificate.js
const util = require('../../utils/util.js')
const { getRoleByThemeId } = require('../../config/themes.js')

Page({
  data: {
    certificates: [],
    showModal: false,
    currentCert: null
  },

  onLoad() {
    this.loadCertificates()
  },

  // 加载证书列表
  async loadCertificates() {
    util.showLoading('加载中...')

    try {
      const userInfo = util.checkRegistration()
      if (!userInfo) {
        wx.redirectTo({
          url: '/pages/register/register'
        })
        return
      }

      const res = await wx.cloud.callFunction({
        name: 'certificate',
        data: {
          action: 'getCertificates',
          openid: getApp().globalData.openid
        }
      })

      util.hideLoading()

      if (res.result.success) {
        this.setData({
          certificates: res.result.certificates
        })
      }
    } catch (err) {
      util.hideLoading()
      console.error('加载证书失败', err)
      util.showToast('加载失败，请重试')
    }
  },

  // 查看证书详情
  viewCertificate(e) {
    const cert = e.currentTarget.dataset.cert
    this.setData({
      showModal: true,
      currentCert: cert
    })
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showModal: false
    })
  },

  // 阻止冒泡
  stopPropagation() {},

  // 下载证书
  async downloadCert(e) {
    const cert = e.currentTarget.dataset.cert
    
    util.showLoading('生成中...')

    try {
      // 调用云函数生成证书图片
      const res = await wx.cloud.callFunction({
        name: 'certificate',
        data: {
          action: 'generateImage',
          certificate: cert
        }
      })

      if (res.result.success && res.result.fileID) {
        // 下载图片
        const downloadRes = await wx.cloud.downloadFile({
          fileID: res.result.fileID
        })

        util.hideLoading()

        // 保存到相册
        await util.saveImageToAlbum(downloadRes.tempFilePath)
      } else {
        throw new Error('生成失败')
      }
    } catch (err) {
      util.hideLoading()
      console.error('下载证书失败', err)
      util.showToast('下载失败，请重试')
    }
  },

  // 从详情下载证书
  async downloadCertDetail() {
    await this.downloadCert({
      currentTarget: {
        dataset: {
          cert: this.data.currentCert
        }
      }
    })
  },

  // 分享证书
  shareCert(e) {
    const cert = e.currentTarget.dataset.cert
    
    // 设置为当前证书用于分享
    this.setData({
      currentCert: cert
    })

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    util.showToast('点击右上角分享')
  },

  // 跳转到课程页面
  navigateToCourses() {
    wx.switchTab({
      url: '/pages/courses/courses'
    })
  },

  // 分享配置
  onShareAppMessage() {
    const cert = this.data.currentCert
    if (cert) {
      return {
        title: `我获得了《${cert.themeName}》实践证书，成为了一名${cert.role}！`,
        path: '/pages/index/index'
      }
    }
    return {
      title: '社会实践活动 - 我的证书',
      path: '/pages/certificate/certificate'
    }
  }
})

