// pages/order/order.js
const util = require('../../utils/util.js')

Page({
  data: {
    orders: []
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  // 加载订单列表
  async loadOrders() {
    util.showLoading('加载中...')

    try {
      const res = await wx.cloud.callFunction({
        name: 'order',
        data: {
          action: 'getOrders',
          openid: getApp().globalData.openid
        }
      })

      util.hideLoading()

      if (res.result.success) {
        // 处理订单状态文本
        const orders = res.result.orders.map(order => ({
          ...order,
          statusText: this.getStatusText(order.status)
        }))
        
        this.setData({ orders })
      }
    } catch (err) {
      util.hideLoading()
      console.error('加载订单失败', err)
      util.showToast('加载失败，请重试')
    }
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      pending: '待支付',
      paid: '待开始',
      ongoing: '进行中',
      completed: '已完成',
      cancelled: '已取消'
    }
    return statusMap[status] || '未知状态'
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `/pages/order/order-detail?id=${order.id}`
    })
  },

  // 取消订单
  async cancelOrder(e) {
    const id = e.currentTarget.dataset.id
    
    const confirm = await util.showConfirm('确定要取消这个订单吗？')
    if (!confirm) return

    util.showLoading('取消中...')

    try {
      const res = await wx.cloud.callFunction({
        name: 'order',
        data: {
          action: 'cancelOrder',
          orderId: id,
          openid: getApp().globalData.openid
        }
      })

      util.hideLoading()

      if (res.result.success) {
        util.showToast('订单已取消', 'success')
        this.loadOrders()
      } else {
        throw new Error(res.result.message || '取消失败')
      }
    } catch (err) {
      util.hideLoading()
      console.error('取消订单失败', err)
      util.showToast('取消失败，请重试')
    }
  },

  // 支付订单
  async payOrder(e) {
    const order = e.currentTarget.dataset.order

    util.showLoading('请稍候...')

    try {
      // 调用云函数获取支付参数
      const res = await wx.cloud.callFunction({
        name: 'payment',
        data: {
          action: 'createPayment',
          orderId: order.id,
          openid: getApp().globalData.openid
        }
      })

      util.hideLoading()

      if (res.result.success) {
        // 调起微信支付
        const paymentRes = await wx.requestPayment({
          ...res.result.payment
        })

        util.showToast('支付成功', 'success')
        this.loadOrders()
      } else {
        throw new Error(res.result.message || '支付失败')
      }
    } catch (err) {
      util.hideLoading()
      if (err.errMsg && err.errMsg.includes('cancel')) {
        util.showToast('已取消支付')
      } else {
        console.error('支付失败', err)
        util.showToast('支付失败，请重试')
      }
    }
  },

  // 查看二维码凭证
  viewQRCode(e) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `/pages/order/qrcode?orderId=${order.id}`
    })
  },

  // 查看相册
  viewAlbum(e) {
    wx.switchTab({
      url: '/pages/album/album'
    })
  },

  // 查看证书
  viewCertificate(e) {
    wx.navigateTo({
      url: '/pages/certificate/certificate'
    })
  },

  // 分享订单
  shareOrder(e) {
    const order = e.currentTarget.dataset.order
    this.setData({
      shareOrder: order
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
    const order = this.data.shareOrder
    if (order) {
      return {
        title: `我参加了《${order.courseTitle}}》活动`,
        path: `/pages/course-detail/course-detail?id=${order.courseId}`,
        imageUrl: order.courseImage
      }
    }
    return {
      title: '社会实践活动',
      path: '/pages/index/index'
    }
  }
})

