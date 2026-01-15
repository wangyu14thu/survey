// pages/authorization/authorization.js
const util = require('../../utils/util.js')

Page({
  data: {
    isAgreed: false
  },

  onLoad(options) {
    // 如果已经授权，直接跳转
    if (util.checkAuthorization()) {
      this.redirectToTarget()
    }
  },

  // 复选框变化
  onCheckboxChange(e) {
    this.setData({
      isAgreed: e.detail.value.length > 0
    })
  },

  // 查看协议
  viewProtocol(e) {
    const type = e.currentTarget.dataset.type
    let title = ''
    let content = ''

    if (type === 'privacy') {
      title = '未成年人隐私保护协议'
      content = this.getPrivacyProtocol()
    } else {
      title = '社会实践活动授权书'
      content = this.getAuthorizationProtocol()
    }

    wx.showModal({
      title,
      content,
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 确认授权
  async confirmAuthorization() {
    if (!this.data.isAgreed) {
      return
    }

    util.showLoading('授权中...')

    try {
      // 获取OpenID
      const openid = await util.getOpenId()
      if (!openid) {
        throw new Error('获取用户标识失败')
      }

      // 调用云函数记录授权
      await wx.cloud.callFunction({
        name: 'authorization',
        data: {
          action: 'create',
          openid,
          timestamp: new Date().getTime()
        }
      })

      // 保存授权状态到本地
      wx.setStorageSync('isAuthorized', true)
      wx.setStorageSync('authTime', new Date().getTime())
      
      // 更新全局数据
      const app = getApp()
      app.globalData.isAuthorized = true
      app.globalData.openid = openid

      util.hideLoading()
      util.showToast('授权成功', 'success')

      // 延迟跳转
      setTimeout(() => {
        this.redirectToTarget()
      }, 1500)

    } catch (err) {
      util.hideLoading()
      console.error('授权失败', err)
      util.showToast('授权失败，请重试')
    }
  },

  // 跳转到目标页面
  redirectToTarget() {
    // 检查是否已注册
    const userInfo = util.checkRegistration()
    
    if (userInfo) {
      // 已注册，跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      })
    } else {
      // 未注册，跳转到注册页面
      wx.redirectTo({
        url: '/pages/register/register'
      })
    }
  },

  // 获取隐私协议内容
  getPrivacyProtocol() {
    return `本协议旨在保护未成年人隐私权益。

一、信息收集
我们仅收集必要的信息用于提供服务，包括但不限于：学生基本信息、活动照片、学习记录等。

二、信息使用
所收集的信息仅用于：
1. 提供社会实践活动服务
2. 生成电子证书
3. 课程推荐与通知
4. 改进服务质量

三、信息保护
1. 采用加密技术存储数据
2. 严格的访问权限控制
3. 定期安全审计
4. 不向第三方提供学生信息

四、监护人权利
1. 随时查看孩子的信息
2. 申请修改或删除信息
3. 撤销授权并注销账号

如有疑问，请联系客服。`
  },

  // 获取授权书内容
  getAuthorizationProtocol() {
    return `社会实践活动授权书

本人作为学生的法定监护人，特此授权：

一、活动参与
同意学生参加社会实践活动，包括但不限于线下实践、投票活动等。

二、信息采集
同意采集学生的基本信息（年级、学校、班级等）用于活动管理。

三、照片使用
同意在活动中拍摄学生照片，并用于：
1. 活动记录与展示
2. 电子证书制作
3. 宣传推广（仅限班级或学校范围）

四、安全保障
我们承诺：
1. 提供专业带队老师
2. 购买活动保险
3. 确保活动场地安全
4. 及时通知活动信息

五、免责说明
因不可抗力导致的活动取消或延期，主办方不承担责任。

本授权书自签署之日起生效，除非监护人主动撤销。`
  }
})

