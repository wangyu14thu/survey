// pages/register/register.js
const util = require('../../utils/util.js')

Page({
  data: {
    formData: {
      role: '', // 身份：student 或 teacher
      nickname: '',
      grade: '',
      region: [],
      school: '', // 学校
      phone: ''
    },
    gradeList: [
      '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
      '初一', '初二', '初三',
      '高一', '高二', '高三'
    ],
    schoolList: [
      '北京翠微小学',
      '其他'
    ],
    gradeIndex: -1,
    schoolIndex: -1,
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

    // 检查是否已注册（只检查本地存储）
    const userInfo = util.checkRegistration()
    if (userInfo) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  // 选择身份
  selectRole(e) {
    const role = e.currentTarget.dataset.role
    this.setData({
      'formData.role': role
    }, () => {
      this.checkCanSubmit()
    })
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

  // 学校选择
  onSchoolChange(e) {
    const index = e.detail.value
    this.setData({
      schoolIndex: index,
      'formData.school': this.data.schoolList[index]
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

  // 检查是否可以提交
  checkCanSubmit() {
    const { role, nickname, grade, region, school, phone } = this.data.formData
    const canSubmit = role !== '' &&
                     nickname.trim() !== '' &&
                     grade !== '' &&
                     region.length > 0 &&
                     school !== '' &&
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

      // 注册用户
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
        // 保存用户信息到本地（使用云函数返回的数据或本地数据）
        const userInfo = res.result.userInfo || {
          ...this.data.formData,
          openid,
          region: this.data.formData.region.join(' ')
        }
        
        wx.setStorageSync('userInfo', userInfo)
        app.globalData.userInfo = userInfo

        util.hideLoading()
        
        // 根据返回消息显示不同提示
        if (res.result.message === '欢迎回来') {
          util.showToast('欢迎回来', 'success')
        } else {
          util.showToast('注册成功', 'success')
        }

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
      
      // 判断具体的错误类型
      if (err.message.includes('姓名或手机号不匹配')) {
        wx.showModal({
          title: '身份验证失败',
          content: '该微信账号已注册过，但您填写的姓名或手机号与注册信息不匹配。\n\n如果忘记注册信息，请联系管理员。',
          showCancel: false,
          confirmText: '我知道了'
        })
      } else {
        util.showToast('注册失败，请重试')
      }
    }
  }
})

