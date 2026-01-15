// pages/vote/vote.js
const util = require('../../utils/util.js')
const { themes } = require('../../config/themes.js')

Page({
  data: {
    themes: themes,
    selectedId: null,
    submitting: false
  },

  onLoad() {
    this.checkVoteStatus()
  },

  // 检查投票状态
  async checkVoteStatus() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'vote',
        data: {
          action: 'checkUserVote',
          openid: getApp().globalData.openid
        }
      })

      if (res.result.success && res.result.hasVoted) {
        wx.showModal({
          title: '提示',
          content: '您已经投过票了，无法重复投票',
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
      }
    } catch (err) {
      console.error('检查投票状态失败', err)
    }
  },

  // 选择主题
  selectTheme(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      selectedId: id
    })
  },

  // 提交投票
  async submitVote() {
    if (!this.data.selectedId || this.data.submitting) {
      return
    }

    const selectedTheme = this.data.themes.find(t => t.id === this.data.selectedId)
    
    const confirm = await util.showConfirm(
      `确定要投票给"${selectedTheme.name}"吗？\n\n投票后不可更改，请慎重选择。`,
      '确认投票'
    )

    if (!confirm) {
      return
    }

    this.setData({ submitting: true })
    util.showLoading('投票中...')

    try {
      const res = await wx.cloud.callFunction({
        name: 'vote',
        data: {
          action: 'vote',
          openid: getApp().globalData.openid,
          themeId: selectedTheme.id,
          themeName: selectedTheme.name
        }
      })

      util.hideLoading()

      if (res.result.success) {
        // 显示投票成功提示
        wx.showModal({
          title: '投票成功 🎉',
          content: '感谢您的参与！\n\n最终投票结果将在12小时后公布，请耐心等待。您可以在首页查看倒计时。',
          showCancel: false,
          confirmText: '返回首页',
          success: () => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        })
      } else {
        throw new Error(res.result.message || '投票失败')
      }
    } catch (err) {
      util.hideLoading()
      this.setData({ submitting: false })
      console.error('投票失败', err)
      
      if (err.message.includes('已投票')) {
        wx.showModal({
          title: '提示',
          content: '您已经投过票了',
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
      } else if (err.message.includes('已结束')) {
        util.showToast('投票已结束')
      } else {
        util.showToast('投票失败，请重试')
      }
    }
  }
})

