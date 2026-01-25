// pages/courses/courses.js
const util = require('../../utils/util.js')
const { courses } = require('../../config/courses.js')

Page({
  data: {
    courses: []
  },

  onLoad() {
    this.loadCourses()
  },

  onShow() {
    this.loadCourses()
  },

  // 加载课程列表
  async loadCourses() {
    util.showLoading('加载中...')

    try {
      // 从云端获取课程数据（包括报名人数）
      const res = await wx.cloud.callFunction({
        name: 'course',
        data: {
          action: 'getCourses'
        }
      })

      util.hideLoading()

      if (res.result.success) {
        // 合并本地配置和云端数据
        const coursesData = courses.map(course => {
          const cloudData = res.result.courses.find(c => c.id === course.id)
          return {
            ...course,
            enrolled: cloudData ? cloudData.enrolled : 0
          }
        })

        this.setData({
          courses: coursesData
        })
      } else {
        // 如果云端获取失败，使用本地数据
        this.setData({
          courses
        })
      }
    } catch (err) {
      util.hideLoading()
      console.error('加载课程失败', err)
      // 使用本地数据作为降级方案
      this.setData({
        courses
      })
    }
  },

  // 跳转到课程详情
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${id}`
    })
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: '精品项目课 - 更多职业体验等你来',
      path: '/pages/courses/courses'
    }
  }
})

