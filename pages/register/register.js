// pages/register/register.js
const util = require('../../utils/util.js')

Page({
  data: {
    formData: {
      nickname: '',
      grade: '',
      region: [],
      school: '',
      classCode: '',
      phone: ''
    },
    gradeList: [
      '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
      '初一', '初二', '初三',
      '高一', '高二', '高三'
    ],
    gradeIndex: -1,
    canSubmit: false
  },

  onLoad(options) {
    // 检查是否已授权
    if (!util.checkAuthorization()) {
      wx.redirectTo({
        url: '/pages/authorization/authorization'
      })
      return
    }

    // 检查是否已注册
    const userInfo = util.checkRegistration()
    if (userInfo) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    }, () => {
      this.checkCanSubmit()
    })
  },

  // 年级选择
  onGradeChange(e) {
    const index = e.detail.value
    this.setData({
      gradeIndex: index,
      'formData.grade': this.data.gradeList[index]
    }, () => {
      this.checkCanSubmit()
    })
  },

  // 地区选择
  onRegionChange(e) {
    this.setData({
      'formData.region': e.detail.value
    }, () => {
      this.checkCanSubmit()
    })
  },

  // 微信授权获取手机号
  getPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 这里需要调用云函数解密手机号
      util.showLoading('获取中...')
      
      wx.cloud.callFunction({
        name: 'getPhoneNumber',
        data: {
          cloudID: e.detail.cloudID
        }
      }).then(res => {
        util.hideLoading()
        if (res.result && res.result.phone) {
          this.setData({
            'formData.phone': res.result.phone
          }, () => {
            this.checkCanSubmit()
          })
          util.showToast('获取成功', 'success')
        }
      }).catch(err => {
        util.hideLoading()
        console.error('获取手机号失败', err)
        util.showToast('获取失败，请手动输入')
      })
    }
  },

  // 显示班级码提示
  showClassCodeTip() {
    wx.showModal({
      title: '班级码说明',
      content: '班级码是由老师创建的唯一标识，用于确保您能看到所属班级的活动照片。请向您的老师获取班级码。',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { nickname, grade, region, school, classCode, phone } = this.data.formData
    const canSubmit = nickname.trim() !== '' &&
                     grade !== '' &&
                     region.length > 0 &&
                     school.trim() !== '' &&
                     classCode.trim() !== '' &&
                     phone.length === 11

    this.setData({ canSubmit })
  },

  // 提交注册
  async submitRegister() {
    if (!this.data.canSubmit) {
      return
    }

    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(this.data.formData.phone)) {
      util.showToast('请输入正确的手机号')
      return
    }

    util.showLoading('注册中...')

    try {
      // 获取OpenID
      const app = getApp()
      let openid = app.globalData.openid
      
      if (!openid) {
        openid = await util.getOpenId()
        app.globalData.openid = openid
      }

      if (!openid) {
        throw new Error('获取用户标识失败')
      }

      // 验证班级码并注册
      const res = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'register',
          openid,
          ...this.data.formData,
          registerTime: new Date().getTime()
        }
      })

      if (res.result.success) {
        // 保存用户信息到本地
        const userInfo = {
          ...this.data.formData,
          openid,
          classId: res.result.classId,
          className: res.result.className
        }
        
        wx.setStorageSync('userInfo', userInfo)
        app.globalData.userInfo = userInfo

        util.hideLoading()
        util.showToast('注册成功', 'success')

        // 延迟跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        throw new Error(res.result.message || '注册失败')
      }

    } catch (err) {
      util.hideLoading()
      console.error('注册失败', err)
      
      if (err.message.includes('班级码')) {
        util.showToast('班级码无效，请联系老师')
      } else {
        util.showToast('注册失败，请重试')
      }
    }
  }
})

