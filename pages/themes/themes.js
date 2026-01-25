// pages/themes/themes.js
const { themes } = require('../../config/themes.js')

Page({
  data: {
    themes: themes
  },

  onLoad() {
    // 可以从云端加载投票数据
  },

  // 跳转到主题详情
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/vote-detail/vote-detail?id=${id}`
    })
  }
})

