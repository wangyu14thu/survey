// pages/album/album.js
const app = getApp();
import { getAlbumList } from '../../utils/api';
import { showLoading, hideLoading, showToast, getGradeList } from '../../utils/util';

Page({
  data: {
    albums: [],
    gradeList: ['全部', ...getGradeList()],
    gradeIndex: 0,
    selectedGrade: '',
    loading: false
  },

  onShow() {
    this.loadAlbums();
  },

  onPullDownRefresh() {
    this.loadAlbums().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onGradeChange(e) {
    const index = e.detail.value;
    const grade = index === 0 ? '' : this.data.gradeList[index];
    
    this.setData({
      gradeIndex: index,
      selectedGrade: grade
    });

    this.loadAlbums();
  },

  async loadAlbums() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await getAlbumList(this.data.selectedGrade);
      this.setData({
        albums: res.data.list || [],
        loading: false
      });
    } catch (err) {
      console.error('加载相册列表失败:', err);
      showToast('加载失败');
      this.setData({ loading: false });
    }
  },

  viewAlbum(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/album-detail/album-detail?id=${id}`
    });
  }
});
