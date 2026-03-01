// pages/moment-detail/moment-detail.js
const app = getApp();
import { getMomentDetail, likeMoment, commentMoment, getCommentList } from '../../utils/api';
import { showLoading, hideLoading, showToast } from '../../utils/util';

Page({
  data: {
    momentId: '',
    moment: null,
    comments: [],
    commentInput: '',
    isLiked: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ momentId: options.id });
      this.loadMomentDetail();
      this.loadComments();
    }
  },

  async loadMomentDetail() {
    showLoading();
    try {
      const res = await getMomentDetail(this.data.momentId);
      this.setData({
        moment: res.data,
        isLiked: res.data.isLiked || false
      });
    } catch (err) {
      console.error('加载动态详情失败:', err);
      showToast('加载失败');
    } finally {
      hideLoading();
    }
  },

  async loadComments() {
    try {
      const res = await getCommentList(this.data.momentId);
      this.setData({
        comments: res.data.list || []
      });
    } catch (err) {
      console.error('加载评论失败:', err);
    }
  },

  previewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    wx.previewImage({
      current,
      urls
    });
  },

  async toggleLike() {
    try {
      await likeMoment(this.data.momentId);
      
      const isLiked = !this.data.isLiked;
      const likeCount = this.data.moment.likeCount + (isLiked ? 1 : -1);
      
      this.setData({
        isLiked,
        'moment.likeCount': likeCount
      });
    } catch (err) {
      console.error('点赞失败:', err);
      showToast('操作失败');
    }
  },

  onCommentInput(e) {
    this.setData({
      commentInput: e.detail.value
    });
  },

  async submitComment() {
    const content = this.data.commentInput.trim();
    if (!content) {
      showToast('请输入评论内容');
      return;
    }

    showLoading('发送中...');
    try {
      await commentMoment(this.data.momentId, content);
      
      hideLoading();
      showToast('评论成功', 'success');
      
      this.setData({
        commentInput: '',
        'moment.commentCount': this.data.moment.commentCount + 1
      });

      this.loadComments();
    } catch (err) {
      hideLoading();
      console.error('评论失败:', err);
      showToast('评论失败');
    }
  }
});
