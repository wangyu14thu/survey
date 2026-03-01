// pages/vote/vote.js
const app = getApp();
import { getVoteList, submitVote, getVoteResult } from '../../utils/api';
import { showLoading, hideLoading, showToast, showAlert } from '../../utils/util';

Page({
  data: {
    destinations: [],
    selectedIds: [],
    maxSelect: 2,
    deadline: '',
    hasVoted: false,
    voteResult: null,
    showResult: false
  },

  onLoad() {
    this.loadVoteList();
  },

  async loadVoteList() {
    showLoading();
    try {
      const res = await getVoteList();
      this.setData({
        destinations: res.data.destinations || [],
        maxSelect: res.data.maxSelect || 2,
        deadline: res.data.deadline || '',
        hasVoted: res.data.hasVoted || false,
        showResult: res.data.showResult || false
      });

      if (this.data.showResult) {
        this.loadVoteResult();
      }
    } catch (err) {
      console.error('加载投票列表失败:', err);
      showToast('加载失败');
    } finally {
      hideLoading();
    }
  },

  async loadVoteResult() {
    try {
      const res = await getVoteResult();
      this.setData({
        voteResult: res.data
      });
    } catch (err) {
      console.error('加载投票结果失败:', err);
    }
  },

  viewDetail(e) {
    const { id, name, activities } = e.currentTarget.dataset;
    showAlert(activities, name);
  },

  toggleSelect(e) {
    if (this.data.hasVoted || this.data.showResult) {
      showToast('投票已结束');
      return;
    }

    const id = e.currentTarget.dataset.id;
    let selectedIds = [...this.data.selectedIds];

    const index = selectedIds.indexOf(id);
    if (index > -1) {
      selectedIds.splice(index, 1);
    } else {
      if (selectedIds.length >= this.data.maxSelect) {
        showToast(`最多只能选择${this.data.maxSelect}个目的地`);
        return;
      }
      selectedIds.push(id);
    }

    this.setData({ selectedIds });
  },

  async submitVote() {
    if (this.data.selectedIds.length === 0) {
      showToast('请至少选择一个目的地');
      return;
    }

    showLoading('提交中...');
    try {
      await submitVote(this.data.selectedIds);
      hideLoading();
      showToast('投票成功', 'success');
      
      this.setData({
        hasVoted: true,
        selectedIds: []
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      hideLoading();
      console.error('投票失败:', err);
      showToast(err.message || '投票失败');
    }
  }
});
