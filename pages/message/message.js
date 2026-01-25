// pages/message/message.js
Page({
  data: {
    messages: [
      {
        id: 1,
        type: 'system',
        title: '投票活动即将结束',
        content: '社会实践主题投票将于2026年3月1日结束，请尽快投票！',
        time: '2026-01-25 10:00',
        read: false
      },
      {
        id: 2,
        type: 'course',
        title: '新课程上线',
        content: '《小小发明家》课程已上线，欢迎报名参加！',
        time: '2026-01-20 14:30',
        read: true
      }
    ]
  },

  onLoad() {
    this.loadMessages()
  },

  // 加载消息列表
  loadMessages() {
    // TODO: 从云端加载消息
    // 目前使用模拟数据
  },

  // 查看消息详情
  viewMessage(e) {
    const id = e.currentTarget.dataset.id
    const message = this.data.messages.find(m => m.id === id)
    
    if (message) {
      // 标记为已读
      const messages = this.data.messages.map(m => {
        if (m.id === id) {
          return { ...m, read: true }
        }
        return m
      })
      
      this.setData({ messages })
      
      // 显示消息详情
      wx.showModal({
        title: message.title,
        content: message.content,
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  },

  // 全部标记为已读
  markAllRead() {
    const messages = this.data.messages.map(m => ({ ...m, read: true }))
    this.setData({ messages })
    wx.showToast({
      title: '已全部标记为已读',
      icon: 'success'
    })
  }
})

