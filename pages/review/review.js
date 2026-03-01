// pages/review/review.js
const app = getApp();
import { getReviewArticle } from '../../utils/api';
import { showLoading, hideLoading, showToast } from '../../utils/util';

Page({
  data: {
    article: null,
    loading: true
  },

  onLoad() {
    this.loadArticle();
  },

  async loadArticle() {
    showLoading();
    try {
      const res = await getReviewArticle();
      this.setData({
        article: res.data,
        loading: false
      });
    } catch (err) {
      console.error('加载文章失败:', err);
      showToast('加载失败');
      this.setData({ loading: false });
    } finally {
      hideLoading();
    }
  },

  previewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    wx.previewImage({
      current,
      urls
    });
  }
});
