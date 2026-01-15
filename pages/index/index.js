// pages/index/index.js
const util = require('../../utils/util.js')
const { themes } = require('../../config/themes.js')

Page({
  data: {
    banners: [
      {
        id: 1,
        image: '/images/banner-course.jpg',
        url: '/pages/course-detail/course-detail?id=1'
      },
      {
        id: 2,
        image: '/images/banner-vote.jpg',
        url: '/pages/vote/vote'
      }
    ],
    themes: themes,
    voteStatus: null,
    totalVotes: 0,
    countdownText: '',
    countdownTimer: null
  },

  onLoad() {
    this.checkUserStatus()
  },

  onShow() {
    this.loadVoteStatus()
  },

  onUnload() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
  },

  // 检查用户状态
  checkUserStatus() {
    // 检查授权
    if (!util.checkAuthorization()) {
      wx.redirectTo({
        url: '/pages/authorization/authorization'
      })
      return
    }

    // 检查注册
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
          totalVotes: status.totalVotes || 0
        })

        // 根据投票状态设置显示内容
        if (status.hasVoted) {
          // 已投票
          if (status.resultPublished) {
            // 结果已公布
            this.setData({
              voteStatus: {
                icon: '🎉',
                title: '投票结果已公布',
                content: '快来查看哪个主题获胜了！',
                showButton: true,
                buttonText: '查看结果',
                showCountdown: false
              }
            })
          } else {
            // 等待结果
            this.setData({
              voteStatus: {
                icon: '⏰',
                title: '您已完成投票',
                content: '投票结果将在结束后12小时公布',
                showButton: false,
                showCountdown: true
              }
            })
            this.startCountdown(status.publishTime)
          }
        } else {
          // 未投票
          if (status.voteEnded) {
            // 投票已结束
            this.setData({
              voteStatus: {
                icon: '⚠️',
                title: '投票已结束',
                content: '很遗憾，您错过了本次投票',
                showButton: true,
                buttonText: '查看结果',
                showCountdown: false
              }
            })
          } else {
            // 投票进行中
            this.setData({
              voteStatus: {
                icon: '🗳️',
                title: '投票进行中',
                content: '快来投出您宝贵的一票吧！',
                showButton: true,
                buttonText: '立即投票',
                showCountdown: false
              }
            })
          }
        }
      }
    } catch (err) {
      console.error('加载投票状态失败', err)
    }
  },

  // 开始倒计时
  startCountdown(targetTime) {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetTime - now

      if (distance < 0) {
        this.setData({
          countdownText: '结果即将公布...'
        })
        if (this.data.countdownTimer) {
          clearInterval(this.data.countdownTimer)
        }
        // 重新加载状态
        this.loadVoteStatus()
        return
      }

      const hours = Math.floor(distance / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      this.setData({
        countdownText: `${hours}小时${minutes}分${seconds}秒后公布`
      })
    }

    updateCountdown()
    this.data.countdownTimer = setInterval(updateCountdown, 1000)
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
    const status = this.data.voteStatus
    if (status.title === '投票结果已公布' || status.title === '投票已结束') {
      wx.navigateTo({
        url: '/pages/result/result'
      })
    } else {
      wx.navigateTo({
        url: '/pages/vote/vote'
      })
    }
  },

  // 跳转到主题详情
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/vote-detail/vote-detail?id=${id}`
    })
  },

  // 快捷入口跳转
  navigateToAlbum() {
    wx.switchTab({
      url: '/pages/album/album'
    })
  },

  navigateToCertificate() {
    wx.navigateTo({
      url: '/pages/certificate/certificate'
    })
  },

  navigateToCourses() {
    wx.switchTab({
      url: '/pages/courses/courses'
    })
  },

  navigateToOrder() {
    wx.navigateTo({
      url: '/pages/order/order'
    })
  }
})

