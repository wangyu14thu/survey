// pages/process/process.js
const app = getApp();
import { getProcessList } from '../../utils/api';
import { showLoading, hideLoading, showToast, previewImage } from '../../utils/util';

Page({
  data: {
    posts: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadPosts();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPosts();
    }
  },

  onPullDownRefresh() {
    this.setData({
      posts: [],
      page: 1,
      hasMore: true
    });
    this.loadPosts().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadPosts() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await getProcessList(this.data.page, 20);
      
      const posts = this.data.page === 1 ? res.data.list : [...this.data.posts, ...res.data.list];
      
      this.setData({
        posts,
        page: this.data.page + 1,
        hasMore: res.data.hasMore,
        loading: false
      });
    } catch (err) {
      console.error('加载直播内容失败:', err);
      showToast('加载失败');
      this.setData({ loading: false });
    }
  },

  previewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    previewImage(current, urls);
  }
});
