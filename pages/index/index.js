// pages/index/index.js
const app = getApp();
import { getActivityInfo, getActivityStages } from '../../utils/api';
import { showLoading, hideLoading, showToast } from '../../utils/util';

Page({
  data: {
    userInfo: null,
    activityInfo: null,
    stages: [
      { id: 1, name: '目的地投票', icon: '📍', status: 'active', url: '/pages/vote/vote' },
      { id: 2, name: '任务预习', icon: '📚', status: 'locked', url: '/pages/preview/preview' },
      { id: 3, name: '研学过程', icon: '🎒', status: 'locked', url: '/pages/process/process' },
      { id: 4, name: '活动回顾', icon: '📝', status: 'locked', url: '/pages/review/review' }
    ]
  },

  onLoad() {
    // 开发模式：模拟用户信息和活动上下文
    const DEV_MODE = true;
    if (DEV_MODE) {
      if (!wx.getStorageSync('userInfo')) {
        wx.setStorageSync('userInfo', {
          studentName: '测试学生',
          grade: '五年级',
          class: '1班',
          parentPhone: '13800138000'
        });
      }
      if (!app.hasActivityContext()) {
        app.globalData.school_id = 'school001';
        app.globalData.act_id = 'act001';
      }
    }
    
    this.checkLogin();
  },

  onShow() {
    this.loadUserInfo();
    this.loadActivityInfo();
    this.loadActivityStages();
  },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/register/register'
      });
      return;
    }

    // 开发模式下不检查活动上下文
    const DEV_MODE = true;
    if (!DEV_MODE && !app.hasActivityContext()) {
      showToast('活动信息异常');
      setTimeout(() => {
        // wx.exitMiniProgram(); // 开发时注释掉
      }, 2000);
      return;
    }
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  async loadActivityInfo() {
    try {
      const res = await getActivityInfo();
      this.setData({
        activityInfo: res.data
      });
    } catch (err) {
      console.error('加载活动信息失败:', err);
    }
  },

  async loadActivityStages() {
    try {
      const res = await getActivityStages();
      if (res.data && res.data.stages) {
        this.setData({
          stages: res.data.stages
        });
      }
    } catch (err) {
      console.error('加载活动阶段失败:', err);
    }
  },

  navigateToStage(e) {
    const { url, status } = e.currentTarget.dataset;
    
    if (status === 'locked') {
      showToast('该站点尚未解锁');
      return;
    }

    wx.navigateTo({ url });
  }
});
