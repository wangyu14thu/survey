// pages/teacher/upload.js
const util = require('../../utils/util.js')

Page({
  data: {
    formData: {
      activityName: '',
      school: '',
      grade: '',
      classId: ''
    },
    schoolList: ['示例学校一', '示例学校二'],
    schoolIndex: -1,
    gradeList: [
      '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
      '初一', '初二', '初三', '高一', '高二', '高三'
    ],
    gradeIndex: -1,
    classList: [],
    classIndex: -1,
    photos: [],
    canSubmit: false,
    uploading: false
  },

  onLoad() {
    this.loadSchools()
  },

  // 加载学校列表
  async loadSchools() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'school',
        data: {
          action: 'getSchools'
        }
      })

      if (res.result.success) {
        this.setData({
          schoolList: res.result.schools
        })
      }
    } catch (err) {
      console.error('加载学校列表失败', err)
    }
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    }, () => {
      this.checkCanSubmit()
    })
  },

  // 学校选择
  onSchoolChange(e) {
    const index = e.detail.value
    this.setData({
      schoolIndex: index,
      'formData.school': this.data.schoolList[index]
    }, () => {
      this.checkCanSubmit()
    })
  },

  // 年级选择
  async onGradeChange(e) {
    const index = e.detail.value
    this.setData({
      gradeIndex: index,
      'formData.grade': this.data.gradeList[index],
      classIndex: -1,
      'formData.classId': ''
    })

    // 加载班级列表
    await this.loadClasses()
    this.checkCanSubmit()
  },

  // 加载班级列表
  async loadClasses() {
    if (this.data.schoolIndex === -1 || this.data.gradeIndex === -1) {
      return
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'class',
        data: {
          action: 'getClasses',
          school: this.data.formData.school,
          grade: this.data.formData.grade
        }
      })

      if (res.result.success) {
        this.setData({
          classList: res.result.classes.map(c => c.name)
        })
      }
    } catch (err) {
      console.error('加载班级列表失败', err)
      util.showToast('加载班级失败')
    }
  },

  // 班级选择
  onClassChange(e) {
    const index = e.detail.value
    // 这里简化处理，实际应该存储班级ID
    this.setData({
      classIndex: index,
      'formData.classId': `${this.data.formData.school}_${this.data.formData.grade}_${this.data.classList[index]}`
    }, () => {
      this.checkCanSubmit()
    })
  },

  // 选择照片
  choosePhoto() {
    const maxCount = 30 - this.data.photos.length
    
    wx.chooseImage({
      count: Math.min(maxCount, 9),
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const photos = [...this.data.photos, ...res.tempFilePaths]
        this.setData({ photos }, () => {
          this.checkCanSubmit()
        })
      }
    })
  },

  // 删除照片
  removePhoto(e) {
    const index = e.currentTarget.dataset.index
    const photos = this.data.photos.filter((_, i) => i !== index)
    this.setData({ photos }, () => {
      this.checkCanSubmit()
    })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { activityName, school, grade, classId } = this.data.formData
    const canSubmit = activityName.trim() !== '' &&
                     school !== '' &&
                     grade !== '' &&
                     classId !== '' &&
                     this.data.photos.length > 0

    this.setData({ canSubmit })
  },

  // 提交上传
  async submitUpload() {
    if (!this.data.canSubmit || this.data.uploading) {
      return
    }

    const confirm = await util.showConfirm(
      `确定上传 ${this.data.photos.length} 张照片到 ${this.data.formData.school} ${this.data.formData.grade} ${this.data.classList[this.data.classIndex]}？`,
      '确认上传'
    )

    if (!confirm) return

    this.setData({ uploading: true })
    wx.showLoading({
      title: '上传中...0%',
      mask: true
    })

    try {
      const uploadedPhotos = []
      
      // 上传每张照片
      for (let i = 0; i < this.data.photos.length; i++) {
        const photo = this.data.photos[i]
        
        // 上传到云存储
        const cloudPath = `albums/${this.data.formData.classId}/${Date.now()}_${i}.jpg`
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: photo
        })

        uploadedPhotos.push({
          fileID: uploadRes.fileID,
          url: uploadRes.fileID
        })

        // 更新进度
        const progress = Math.round(((i + 1) / this.data.photos.length) * 100)
        wx.showLoading({
          title: `上传中...${progress}%`,
          mask: true
        })
      }

      // 保存到数据库
      await wx.cloud.callFunction({
        name: 'album',
        data: {
          action: 'createAlbum',
          ...this.data.formData,
          className: this.data.classList[this.data.classIndex],
          photos: uploadedPhotos,
          uploadTime: new Date().getTime()
        }
      })

      wx.hideLoading()
      
      wx.showModal({
        title: '上传成功',
        content: '照片已成功上传到云端相册',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })

    } catch (err) {
      wx.hideLoading()
      this.setData({ uploading: false })
      console.error('上传失败', err)
      util.showToast('上传失败，请重试')
    }
  }
})

