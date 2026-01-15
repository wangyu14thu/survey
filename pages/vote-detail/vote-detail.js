// pages/vote-detail/vote-detail.js
const util = require('../../utils/util.js')
const { themes } = require('../../config/themes.js')

Page({
  data: {
    theme: null,
    hasVoted: false
  },

  onLoad(options) {
    const id = parseInt(options.id)
    const theme = themes.find(t => t.id === id)
    
    if (theme) {
      this.setData({ theme })
      this.checkVoteStatus()
    } else {
      util.showToast('主题不存在')
      wx.navigateBack()
    }
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

      if (res.result.success) {
        this.setData({
          hasVoted: res.result.hasVoted
        })
      }
    } catch (err) {
      console.error('检查投票状态失败', err)
    }
  },

  // 投票
  async voteForTheme() {
    if (this.data.hasVoted) {
      return
    }

    const confirm = await util.showConfirm(
      `确定要投票给"${this.data.theme.name}"吗？投票后不可更改。`,
      '确认投票'
    )

    if (!confirm) {
      return
    }

    util.showLoading('投票中...')

    try {
      const res = await wx.cloud.callFunction({
        name: 'vote',
        data: {
          action: 'vote',
          openid: getApp().globalData.openid,
          themeId: this.data.theme.id,
          themeName: this.data.theme.name
        }
      })

      util.hideLoading()

      if (res.result.success) {
        this.setData({ hasVoted: true })
        
        // 显示投票成功提示
        wx.showModal({
          title: '投票成功',
          content: '感谢您的参与！最终投票结果将在12小时后公布，请耐心等待。',
          showCancel: false,
          confirmText: '知道了',
          success: () => {
            // 返回上一页
            wx.navigateBack()
          }
        })
      } else {
        throw new Error(res.result.message || '投票失败')
      }
    } catch (err) {
      util.hideLoading()
      console.error('投票失败', err)
      
      if (err.message.includes('已投票')) {
        util.showToast('您已经投过票了')
        this.setData({ hasVoted: true })
      } else {
        util.showToast('投票失败，请重试')
      }
    }
  }
})

