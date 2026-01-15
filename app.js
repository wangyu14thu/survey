// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'your-env-id' // 替换为你的云开发环境ID
      });
    }

    // 检查用户登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isAuthorized = wx.getStorageSync('isAuthorized') || false;
    }
  },

  // 全局数据
  globalData: {
    userInfo: null,
    isAuthorized: false,
    openid: null
  }
});

