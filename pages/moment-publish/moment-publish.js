// pages/moment-publish/moment-publish.js
const app = getApp();
import { publishMoment, uploadImages } from '../../utils/api';
import { showLoading, hideLoading, showToast, chooseImage } from '../../utils/util';

Page({
  data: {
    content: '',
    images: [],
    classOnly: false,
    maxImages: 6,
    canSubmit: false
  },

  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
    this.checkCanSubmit();
  },

  checkCanSubmit() {
    const canSubmit = this.data.content.trim().length > 0;
    this.setData({ canSubmit });
  },

  async chooseImage() {
    if (this.data.images.length >= this.data.maxImages) {
      showToast(`最多只能上传${this.data.maxImages}张图片`);
      return;
    }

    try {
      const count = this.data.maxImages - this.data.images.length;
      const tempFilePaths = await chooseImage(count);
      
      this.setData({
        images: [...this.data.images, ...tempFilePaths]
      });
    } catch (err) {
      console.error('选择图片失败:', err);
    }
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    });
  },

  toggleClassOnly(e) {
    this.setData({
      classOnly: e.detail.value
    });
  },

  async publish() {
    if (!this.data.canSubmit) {
      return;
    }

    showLoading('发布中...');

    try {
      let imageUrls = [];
      if (this.data.images.length > 0) {
        imageUrls = await uploadImages(this.data.images);
      }

      await publishMoment(this.data.content, imageUrls, this.data.classOnly);
      
      hideLoading();
      showToast('发布成功', 'success');

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      hideLoading();
      console.error('发布失败:', err);
      showToast(err.message || '发布失败');
    }
  }
});
