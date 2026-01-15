// pages/result/result.js
const util = require('../../utils/util.js')
const { themes } = require('../../config/themes.js')

Page({
  data: {
    winner: null,
    rankings: [],
    totalVotes: 0
  },

  onLoad() {
    this.loadVoteResult()
  },

  // 加载投票结果
  async loadVoteResult() {
    util.showLoading('加载中...')

    try {
      const res = await wx.cloud.callFunction({
        name: 'vote',
        data: {
          action: 'getResult'
        }
      })

      util.hideLoading()

      if (res.result.success) {
        const data = res.result.data
        
        // 处理排名数据
        const rankings = data.rankings.map(item => {
          const theme = themes.find(t => t.id === item.themeId)
          return {
            ...item,
            ...theme,
            percent: data.totalVotes > 0 ? ((item.votes / data.totalVotes) * 100).toFixed(1) : 0
          }
        })

        // 获取冠军
        const winner = rankings[0]

        this.setData({
          winner,
          rankings,
          totalVotes: data.totalVotes
        })
      } else {
        throw new Error(res.result.message || '加载失败')
      }
    } catch (err) {
      util.hideLoading()
      console.error('加载投票结果失败', err)
      util.showToast('加载失败，请重试')
    }
  },

  // 查看主题详情
  navigateToDetail() {
    if (this.data.winner) {
      wx.navigateTo({
        url: `/pages/vote-detail/vote-detail?id=${this.data.winner.id}`
      })
    }
  },

  // 分享结果
  shareResult() {
    // 这里可以生成分享海报或直接分享
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    util.showToast('点击右上角分享给好友')
  },

  // 分享配置
  onShareAppMessage() {
    const winner = this.data.winner
    return {
      title: `投票结果揭晓！"${winner.name}"获得冠军 🏆`,
      path: '/pages/result/result',
      imageUrl: winner.cover
    }
  },

  onShareTimeline() {
    const winner = this.data.winner
    return {
      title: `"${winner.name}"获得投票冠军`,
      imageUrl: winner.cover
    }
  }
})

