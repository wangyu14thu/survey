// pages/course-detail/course-detail.js
const util = require('../../utils/util.js')
const { courses } = require('../../config/courses.js')

Page({
  data: {
    course: null
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadCourseDetail(id)
  },

  // 加载课程详情
  async loadCourseDetail(id) {
    const course = courses.find(c => c.id === id)
    
    if (!course) {
      util.showToast('课程不存在')
      wx.navigateBack()
      return
    }

    // 从云端获取最新报名人数
    try {
      const res = await wx.cloud.callFunction({
        name: 'course',
        data: {
          action: 'getCourseDetail',
          courseId: id
        }
      })

      if (res.result.success) {
        this.setData({
          course: {
            ...course,
            enrolled: res.result.enrolled || 0
          }
        })
      } else {
        this.setData({ course })
      }
    } catch (err) {
      console.error('加载课程详情失败', err)
      this.setData({ course })
    }
  },

  // 预览图片
  previewImage(e) {
    const { urls, index } = e.currentTarget.dataset
    wx.previewImage({
      urls,
      current: urls[index]
    })
  },

  // 报名课程
  async enrollCourse() {
    if (this.data.course.enrolled >= this.data.course.quota) {
      return
    }

    // 检查是否已注册
    const userInfo = util.checkRegistration()
    if (!userInfo) {
      const confirm = await util.showConfirm('请先完成注册')
      if (confirm) {
        wx.redirectTo({
          url: '/pages/register/register'
        })
      }
      return
    }

    // 跳转到报名页面（实际上是订单确认页）
    wx.navigateTo({
      url: `/pages/order/order-confirm?courseId=${this.data.course.id}`
    })
  },

  // 分享配置
  onShareAppMessage() {
    const course = this.data.course
    return {
      title: `${course.title} - ${course.subtitle}`,
      path: `/pages/course-detail/course-detail?id=${course.id}`,
      imageUrl: course.cover
    }
  }
})

