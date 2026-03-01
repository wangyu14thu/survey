// app.js - 研学活动小程序
App({
  onLaunch(options) {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'cloud1-9gpi4pkt9a8bce92' // 云开发环境ID
      });
      console.log('云开发初始化完成');
    }

    // 处理扫码进入场景
    this.handleScanScene(options);
    
    // 检查用户登录状态
    this.checkLoginStatus();
  },

  onShow(options) {
    // 处理扫码场景
    this.handleScanScene(options);
  },

  // 处理扫码进入场景
  handleScanScene(options) {
    console.log('启动场景:', options);
    
    // 场景值 1047: 扫描小程序码
    // 场景值 1048: 长按图片识别小程序码
    // 场景值 1049: 手机相册选取小程序码
    if (options.scene === 1047 || options.scene === 1048 || options.scene === 1049) {
      const scene = decodeURIComponent(options.query.scene || '');
      console.log('扫码参数:', scene);
      
      // 解析参数: school_id=xxx&act_id=yyy
      if (scene) {
        const params = this.parseSceneParams(scene);
        if (params.school_id && params.act_id) {
          this.globalData.school_id = params.school_id;
          this.globalData.act_id = params.act_id;
          wx.setStorageSync('school_id', params.school_id);
          wx.setStorageSync('act_id', params.act_id);
          console.log('设置活动上下文:', params);
        }
      }
    } else if (options.query && options.query.school_id && options.query.act_id) {
      // 直接通过URL参数传递
      this.globalData.school_id = options.query.school_id;
      this.globalData.act_id = options.query.act_id;
      wx.setStorageSync('school_id', options.query.school_id);
      wx.setStorageSync('act_id', options.query.act_id);
      console.log('设置活动上下文:', options.query);
    }
  },

  // 解析场景参数
  parseSceneParams(scene) {
    const params = {};
    const pairs = scene.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[key] = value;
      }
    });
    return params;
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = userInfo.openid;
    }
    
    // 恢复活动上下文
    const school_id = wx.getStorageSync('school_id');
    const act_id = wx.getStorageSync('act_id');
    if (school_id && act_id) {
      this.globalData.school_id = school_id;
      this.globalData.act_id = act_id;
    }
  },

  // 获取当前活动上下文
  getActivityContext() {
    return {
      school_id: this.globalData.school_id,
      act_id: this.globalData.act_id
    };
  },

  // 检查是否有活动上下文
  hasActivityContext() {
    return !!(this.globalData.school_id && this.globalData.act_id);
  },

  // 全局数据
  globalData: {
    userInfo: null,
    openid: null,
    school_id: null, // 学校ID
    act_id: null // 活动ID
  }
});
