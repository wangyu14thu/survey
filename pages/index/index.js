// pages/index/index.js
const util = require('../../utils/util.js')
const { themes } = require('../../config/themes.js')
const { courses } = require('../../config/courses.js')

Page({
  data: {
    banners: [
      {
        id: 1,
        image: '/images/banner-course.jpg',
        url: ''
      },
      {
        id: 2,
        image: '/images/banner-vote.jpg',
        url: ''
      }
    ],
    themes: themes,
    courses: courses,
    voteEnded: false,
    hasVoted: false,
    totalVotes: 0,
    voteEndTime: new Date('2026-03-01').getTime()
  },

  onLoad() {
    this.checkUserStatus()
  },

  onShow() {
    this.loadVoteStatus()
  },

  // 检查用户状态
  checkUserStatus() {
    if (!util.checkAuthorization()) {
      wx.redirectTo({
        url: '/pages/authorization/authorization'
      })
      return
    }

    const userInfo = util.checkRegistration()
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/register/register'
      })
      return
    }
  },

  // 加载投票状态
  async loadVoteStatus() {
    try {
      // 检查是否已结束
      const now = new Date().getTime()
      const voteEnded = now > this.data.voteEndTime
      
      const res = await wx.cloud.callFunction({
        name: 'vote',
        data: {
          action: 'getStatus',
          openid: getApp().globalData.openid
        }
      })

      if (res.result.success) {
        const status = res.result.data
        this.setData({
          hasVoted: status.hasVoted || false,
          totalVotes: status.totalVotes || 0,
          voteEnded: voteEnded
        })
      } else {
        this.setData({ voteEnded })
      }
    } catch (err) {
      console.error('加载投票状态失败', err)
      const now = new Date().getTime()
      this.setData({
        voteEnded: now > this.data.voteEndTime
      })
    }
  },

  // 跳转到主题列表页面
  navigateToThemesList() {
    wx.navigateTo({
      url: '/pages/themes/themes'
    })
  },

  // Banner点击
  onBannerTap(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({ url })
    }
  },

  // 跳转到投票页面
  navigateToVote() {
    if (this.data.hasVoted) {
      return
    }
    wx.navigateTo({
      url: '/pages/vote/vote'
    })
  },

  // 跳转到投票结果
  navigateToResult() {
    wx.navigateTo({
      url: '/pages/result/result'
    })
  },

  // 跳转到课程列表
  navigateToCourses() {
    wx.navigateTo({
      url: '/pages/courses/courses'
    })
  }
})
