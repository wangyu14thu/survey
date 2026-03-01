// pages/album-detail/album-detail.js
const app = getApp();
import { getAlbumDetail } from '../../utils/api';
import { showLoading, hideLoading, showToast, previewImage } from '../../utils/util';

Page({
  data: {
    albumId: '',
    album: null,
    photos: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ albumId: options.id });
      this.loadAlbumDetail();
    }
  },

  async loadAlbumDetail() {
    showLoading();
    try {
      const res = await getAlbumDetail(this.data.albumId);
      this.setData({
        album: res.data.album,
        photos: res.data.photos || []
      });
    } catch (err) {
      console.error('加载相册详情失败:', err);
      showToast('加载失败');
    } finally {
      hideLoading();
    }
  },

  previewPhoto(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.photos.map(p => p.url);
    previewImage(urls[index], urls);
  },

  savePhoto(e) {
    const url = e.currentTarget.dataset.url;
    
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              showToast('保存成功', 'success');
            },
            fail: (err) => {
              if (err.errMsg.includes('auth deny')) {
                wx.showModal({
                  title: '提示',
                  content: '需要您授权保存到相册',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting();
                    }
                  }
                });
              } else {
                showToast('保存失败');
              }
            }
          });
        }
      },
      fail: () => {
        showToast('下载失败');
      }
    });
  }
});
