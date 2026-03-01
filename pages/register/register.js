// pages/register/register.js
const app = getApp();
import { register } from '../../utils/api';
import { validatePhone, validateSmsCode, showToast, showLoading, hideLoading, getGradeList, getClassList } from '../../utils/util';

Page({
  data: {
    formData: {
      studentName: '',
      parentPhone: '',
      smsCode: '',
      grade: '',
      class: ''
    },
    gradeList: getGradeList(),
    gradeIndex: -1,
    classList: getClassList(),
    classIndex: -1,
    canSubmit: false,
    countdown: 0,
    timer: null
  },

  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      wx.switchTab({
        url: '/pages/index/index'
      });
      return;
    }

    // 开发模式：不检查活动上下文
    const DEV_MODE = true;
    if (!DEV_MODE && !app.hasActivityContext()) {
      showToast('请通过活动二维码进入');
      setTimeout(() => {
        // wx.exitMiniProgram();
      }, 2000);
    }
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  onStudentNameInput(e) {
    this.setData({
      'formData.studentName': e.detail.value
    }, () => {
      this.checkCanSubmit();
    });
  },

  onParentPhoneInput(e) {
    this.setData({
      'formData.parentPhone': e.detail.value
    }, () => {
      this.checkCanSubmit();
    });
  },

  onSmsCodeInput(e) {
    this.setData({
      'formData.smsCode': e.detail.value
    }, () => {
      this.checkCanSubmit();
    });
  },

  onGradeChange(e) {
    const index = e.detail.value;
    this.setData({
      gradeIndex: index,
      'formData.grade': this.data.gradeList[index]
    }, () => {
      this.checkCanSubmit();
    });
  },

  onClassChange(e) {
    const index = e.detail.value;
    this.setData({
      classIndex: index,
      'formData.class': this.data.classList[index]
    }, () => {
      this.checkCanSubmit();
    });
  },

  checkCanSubmit() {
    const { studentName, parentPhone, smsCode, grade, class: className } = this.data.formData;
    const canSubmit = studentName.trim() !== '' &&
                     validatePhone(parentPhone) &&
                     validateSmsCode(smsCode) &&
                     grade !== '' &&
                     className !== '';
    this.setData({ canSubmit });
  },

  async getSmsCode() {
    const phone = this.data.formData.parentPhone;
    
    if (!validatePhone(phone)) {
      showToast('请输入正确的手机号');
      return;
    }

    if (this.data.countdown > 0) {
      return;
    }

    showLoading('发送中...');

    try {
      await wx.cloud.callFunction({
        name: 'sms',
        data: {
          action: 'sendCode',
          phone
        }
      });

      hideLoading();
      showToast('验证码已发送', 'success');

      this.setData({ countdown: 60 });
      this.data.timer = setInterval(() => {
        const countdown = this.data.countdown - 1;
        if (countdown <= 0) {
          clearInterval(this.data.timer);
          this.data.timer = null;
        }
        this.setData({ countdown });
      }, 1000);
    } catch (err) {
      hideLoading();
      console.error('发送验证码失败:', err);
      showToast('发送失败,请重试');
    }
  },

  async submitRegister() {
    if (!this.data.canSubmit) {
      return;
    }

    showLoading('注册中...');

    try {
      const loginRes = await wx.cloud.callFunction({
        name: 'login'
      });
      const openid = loginRes.result.openid;

      const res = await register({
        openid,
        studentName: this.data.formData.studentName,
        parentPhone: this.data.formData.parentPhone,
        smsCode: this.data.formData.smsCode,
        grade: this.data.formData.grade,
        class: this.data.formData.class,
        registerTime: new Date().getTime()
      });

      hideLoading();

      if (res.success) {
        const userInfo = {
          openid,
          studentName: this.data.formData.studentName,
          parentPhone: this.data.formData.parentPhone,
          grade: this.data.formData.grade,
          class: this.data.formData.class,
          school_id: app.globalData.school_id,
          act_id: app.globalData.act_id
        };

        wx.setStorageSync('userInfo', userInfo);
        app.globalData.userInfo = userInfo;
        app.globalData.openid = openid;

        showToast('注册成功', 'success');

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      }
    } catch (err) {
      hideLoading();
      console.error('注册失败:', err);
      showToast(err.message || '注册失败,请重试');
    }
  }
});
