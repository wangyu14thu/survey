// pages/moment/moment.js
const app = getApp();
import { getMomentList } from '../../utils/api';
import { showLoading, hideLoading, showToast } from '../../utils/util';

Page({
  data: {
    moments: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onShow() {
    if (this.data.page === 1) {
      this.loadMoments();
    }
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoments();
    }
  },

  onPullDownRefresh() {
    this.setData({
      moments: [],
      page: 1,
      hasMore: true
    });
    this.loadMoments().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadMoments() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await getMomentList(this.data.page, 20);
      
      const moments = this.data.page === 1 ? res.data.list : [...this.data.moments, ...res.data.list];
      
      this.setData({
        moments,
        page: this.data.page + 1,
        hasMore: res.data.hasMore,
        loading: false
      });
    } catch (err) {
      console.error('加载动态列表失败:', err);
      showToast('加载失败');
      this.setData({ loading: false });
    }
  },

  publishMoment() {
    wx.navigateTo({
      url: '/pages/moment-publish/moment-publish'
    });
  },

  viewMoment(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/moment-detail/moment-detail?id=${id}`
    });
  },

  previewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    wx.previewImage({
      current,
      urls
    });
  }
});
