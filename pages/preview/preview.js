// pages/preview/preview.js
const app = getApp();
import { getPreviewTasks, submitPreviewAnswer } from '../../utils/api';
import { showLoading, hideLoading, showToast } from '../../utils/util';

Page({
  data: {
    taskInfo: null,
    selectedTab: 'challenge',
    answers: {},
    canSubmit: false
  },

  onLoad() {
    this.loadTasks();
  },

  async loadTasks() {
    showLoading();
    try {
      const res = await getPreviewTasks();
      this.setData({
        taskInfo: res.data
      });
    } catch (err) {
      console.error('加载任务失败:', err);
      showToast('加载失败');
    } finally {
      hideLoading();
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      selectedTab: tab
    });
  },

  selectAnswer(e) {
    const { index, option } = e.currentTarget.dataset;
    const answers = { ...this.data.answers };
    answers[index] = option;
    
    this.setData({ answers });
    this.checkCanSubmit();
  },

  checkCanSubmit() {
    if (!this.data.taskInfo || !this.data.taskInfo.questions) {
      return;
    }

    const questionCount = this.data.taskInfo.questions.length;
    const answerCount = Object.keys(this.data.answers).length;
    
    this.setData({
      canSubmit: answerCount === questionCount
    });
  },

  async submitAnswer() {
    if (!this.data.canSubmit) {
      return;
    }

    showLoading('提交中...');
    try {
      const answerList = this.data.taskInfo.questions.map((q, index) => ({
        questionId: q.id,
        answer: this.data.answers[index]
      }));

      await submitPreviewAnswer(answerList);
      hideLoading();
      showToast('提交成功', 'success');

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      hideLoading();
      console.error('提交失败:', err);
      showToast(err.message || '提交失败');
    }
  }
});
