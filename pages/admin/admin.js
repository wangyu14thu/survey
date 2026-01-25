// pages/admin/admin.js
const util = require('../../utils/util.js')

Page({
  data: {
    stats: {
      totalVotes: 0,
      totalUsers: 0,
      totalOrders: 0,
      totalAlbums: 0
    },
    voteResults: [],
    courses: []
  },

  onLoad() {
    // 验证管理员权限（简化处理）
    this.checkAdminPermission()
    this.loadData()
  },

  // 检查管理员权限
  checkAdminPermission() {
    const userInfo = util.checkRegistration()
    // 这里简化处理，实际应该从数据库验证角色
    if (!userInfo || userInfo.role !== 'admin') {
      wx.showModal({
        title: '提示',
        content: '您没有权限访问管理后台',
        showCancel: false,
        success: () => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      })
    }
  },

  // 加载数据
  async loadData() {
    await Promise.all([
      this.loadStats(),
      this.loadVoteResults(),
      this.loadCourses()
    ])
  },

  // 加载统计数据
  async loadStats() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'admin',
        data: {
          action: 'getStats'
        }
      })

      if (res.result.success) {
        this.setData({
          stats: res.result.stats
        })
      }
    } catch (err) {
      console.error('加载统计数据失败', err)
    }
  },

  // 加载投票结果
  async loadVoteResults() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'vote',
        data: {
          action: 'getResult'
        }
      })

      if (res.result.success) {
        const { rankings, totalVotes } = res.result.data
        
        const results = rankings.map(item => ({
          ...item,
          percent: totalVotes > 0 ? ((item.votes / totalVotes) * 100).toFixed(1) : 0
        }))

        this.setData({
          voteResults: results
        })
      }
    } catch (err) {
      console.error('加载投票结果失败', err)
    }
  },

  // 加载课程数据
  async loadCourses() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'course',
        data: {
          action: 'getCourses'
        }
      })

      if (res.result.success) {
        this.setData({
          courses: res.result.courses
        })
      }
    } catch (err) {
      console.error('加载课程数据失败', err)
    }
  },

  // 刷新投票数据
  refreshVotes() {
    this.loadVoteResults()
    util.showToast('已刷新', 'success')
  },

  // 截止投票
  async endVote() {
    const confirm = await util.showConfirm('确定要截止投票吗？截止后用户将无法继续投票。')
    
    if (confirm) {
      util.showLoading('处理中...')
      
      try {
        await wx.cloud.callFunction({
          name: 'admin',
          data: {
            action: 'endVote'
          }
        })

        util.hideLoading()
        util.showToast('投票已截止', 'success')
      } catch (err) {
        util.hideLoading()
        console.error('截止投票失败', err)
        util.showToast('操作失败')
      }
    }
  },

  // 公布结果
  async publishResult() {
    const confirm = await util.showConfirm('确定要公布投票结果吗？')
    
    if (confirm) {
      util.showLoading('处理中...')
      
      try {
        await wx.cloud.callFunction({
          name: 'admin',
          data: {
            action: 'publishResult'
          }
        })

        util.hideLoading()
        util.showToast('结果已公布', 'success')
      } catch (err) {
        util.hideLoading()
        console.error('公布结果失败', err)
        util.showToast('操作失败')
      }
    }
  },

  // 管理课程名额
  manageCourse(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '管理名额',
      content: '请输入新的名额数量',
      editable: true,
      placeholderText: '请输入数字',
      success: async (res) => {
        if (res.confirm && res.content) {
          const newQuota = parseInt(res.content)
          
          if (isNaN(newQuota) || newQuota < 0) {
            util.showToast('请输入有效数字')
            return
          }

          util.showLoading('更新中...')

          try {
            await wx.cloud.callFunction({
              name: 'admin',
              data: {
                action: 'updateCourseQuota',
                courseId: id,
                quota: newQuota
              }
            })

            util.hideLoading()
            util.showToast('更新成功', 'success')
            this.loadCourses()
          } catch (err) {
            util.hideLoading()
            console.error('更新失败', err)
            util.showToast('更新失败')
          }
        }
      }
    })
  },

  // 导出投票数据
  exportVotes() {
    util.showToast('导出功能开发中')
  },

  // 导出用户数据
  exportUsers() {
    util.showToast('导出功能开发中')
  },

  // 导出订单数据
  exportOrders() {
    util.showToast('导出功能开发中')
  }
})

