// pages/profile/profile.js
const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: null,
    stats: {
      certificates: 0,
      orders: 0,
      albums: 0
    }
  },

  onLoad() {
    this.loadUserData()
  },

  onShow() {
    this.loadUserData()
  },

  // 加载用户数据
  async loadUserData() {
    const userInfo = util.checkRegistration()
    
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/authorization/authorization'
      })
      return
    }

    this.setData({ userInfo })
    this.loadStats()
  },

  // 加载统计数据
  async loadStats() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'getStats',
          openid: getApp().globalData.openid
        }
      })

      if (res.result.success) {
        this.setData({
          stats: res.result.stats
        })
      }
    } catch (err) {
      console.error('加载统计数据失败', err)
    }
  },

  // 跳转到证书页面
  navigateToCertificate() {
    wx.navigateTo({
      url: '/pages/certificate/certificate'
    })
  },

  // 跳转到订单页面
  navigateToOrder() {
    wx.navigateTo({
      url: '/pages/order/order'
    })
  },

  // 跳转到相册页面
  navigateToAlbum() {
    wx.switchTab({
      url: '/pages/album/album'
    })
  },

  // 跳转到课程页面
  navigateToCourses() {
    wx.switchTab({
      url: '/pages/courses/courses'
    })
  },

  // 跳转到投票页面
  navigateToVote() {
    wx.navigateTo({
      url: '/pages/vote/vote'
    })
  },

  // 显示关于我们
  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '社会实践投票小程序致力于为学生提供丰富多彩的社会实践体验，通过民主投票的方式让学生参与活动选择，并提供完整的活动记录和证书管理功能。\n\n版本：v1.0.0',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：周一至周五 9:00-18:00\n\n或者点击右上角菜单中的"联系客服"按钮',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 退出登录
  async logout() {
    const confirm = await util.showConfirm('确定要退出登录吗？', '退出登录')
    
    if (confirm) {
      // 清除本地数据
      wx.clearStorageSync()
      
      // 重置全局数据
      const app = getApp()
      app.globalData.userInfo = null
      app.globalData.isAuthorized = false
      app.globalData.openid = null

      util.showToast('已退出登录', 'success')

      // 跳转到授权页面
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/authorization/authorization'
        })
      }, 1500)
    }
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: '社会实践投票 - 精彩活动等你来',
      path: '/pages/index/index'
    }
  }
})

