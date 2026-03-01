// pages/profile/profile.js
const app = getApp();
import { getMyActivities, getMyMoments } from '../../utils/api';
import { showLoading, hideLoading, showToast, showAlert } from '../../utils/util';

Page({
  data: {
    userInfo: null,
    activityInfo: null,
    myActivities: [],
    stats: {
      momentCount: 0,
      likeCount: 0
    }
  },

  onShow() {
    this.loadUserInfo();
    this.loadActivityInfo();
    this.loadMyActivities();
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  loadActivityInfo() {
    const school_id = app.globalData.school_id;
    const act_id = app.globalData.act_id;
    
    if (school_id && act_id) {
      // 这里可以加载当前活动信息
      this.setData({
        activityInfo: {
          school_id,
          act_id
        }
      });
    }
  },

  async loadMyActivities() {
    try {
      const res = await getMyActivities();
      this.setData({
        myActivities: res.data.list || []
      });
    } catch (err) {
      console.error('加载活动列表失败:', err);
    }
  },

  viewMyMoments() {
    wx.navigateTo({
      url: '/pages/my-moments/my-moments'
    });
  },

  viewActivity(e) {
    const { school_id, act_id } = e.currentTarget.dataset;
    
    // 切换活动上下文
    app.globalData.school_id = school_id;
    app.globalData.act_id = act_id;
    wx.setStorageSync('school_id', school_id);
    wx.setStorageSync('act_id', act_id);

    showToast('已切换活动', 'success');

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1000);
  },

  editProfile() {
    showToast('功能开发中');
  },

  about() {
    showAlert(
      '研学活动小程序\n版本: 1.0.0\n\n记录每一次研学旅程的精彩瞬间',
      '关于我们'
    );
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗?',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          app.globalData.userInfo = null;
          app.globalData.openid = null;
          app.globalData.school_id = null;
          app.globalData.act_id = null;

          wx.reLaunch({
            url: '/pages/register/register'
          });
        }
      }
    });
  }
});
