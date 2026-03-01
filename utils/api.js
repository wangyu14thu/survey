// utils/api.js - API请求封装
const app = getApp();

// 云函数调用封装
const cloudFunction = (name, data) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: res => {
        if (res.result.success) {
          resolve(res.result);
        } else {
          reject(res.result.message || '请求失败');
        }
      },
      fail: err => {
        console.error('云函数调用失败:', name, err);
        reject(err.errMsg || '网络请求失败');
      }
    });
  });
};

// 用户注册
export const register = (data) => {
  return cloudFunction('user', {
    action: 'register',
    ...data,
    ...app.getActivityContext()
  });
};

// 获取用户信息
export const getUserInfo = (openid) => {
  return cloudFunction('user', {
    action: 'getUserInfo',
    openid
  });
};

// 获取活动信息
export const getActivityInfo = () => {
  return cloudFunction('activity', {
    action: 'getInfo',
    ...app.getActivityContext()
  });
};

// 获取活动阶段状态
export const getActivityStages = () => {
  return cloudFunction('activity', {
    action: 'getStages',
    ...app.getActivityContext()
  });
};

// 目的地投票相关
export const getVoteList = () => {
  return cloudFunction('vote', {
    action: 'getList',
    ...app.getActivityContext()
  });
};

export const submitVote = (destinationIds) => {
  return cloudFunction('vote', {
    action: 'submit',
    destinationIds,
    openid: app.globalData.openid,
    ...app.getActivityContext()
  });
};

export const getVoteResult = () => {
  return cloudFunction('vote', {
    action: 'getResult',
    ...app.getActivityContext()
  });
};

// 任务预习相关
export const getPreviewTasks = () => {
  return cloudFunction('preview', {
    action: 'getTasks',
    ...app.getActivityContext()
  });
};

export const submitPreviewAnswer = (answers) => {
  return cloudFunction('preview', {
    action: 'submitAnswer',
    answers,
    openid: app.globalData.openid,
    ...app.getActivityContext()
  });
};

// 研学过程相关
export const getProcessList = (page = 1, pageSize = 20) => {
  return cloudFunction('process', {
    action: 'getList',
    page,
    pageSize,
    ...app.getActivityContext()
  });
};

// 活动回顾相关
export const getReviewArticle = () => {
  return cloudFunction('review', {
    action: 'getArticle',
    ...app.getActivityContext()
  });
};

// 相册相关
export const getAlbumList = (grade = '') => {
  return cloudFunction('album', {
    action: 'getList',
    grade,
    school_id: app.globalData.school_id
  });
};

export const getAlbumDetail = (albumId) => {
  return cloudFunction('album', {
    action: 'getDetail',
    albumId
  });
};

// 研学圈相关
export const getMomentList = (page = 1, pageSize = 20) => {
  return cloudFunction('moment', {
    action: 'getList',
    page,
    pageSize,
    ...app.getActivityContext()
  });
};

export const getMomentDetail = (momentId) => {
  return cloudFunction('moment', {
    action: 'getDetail',
    momentId
  });
};

export const publishMoment = (content, images, classOnly = false) => {
  return cloudFunction('moment', {
    action: 'publish',
    content,
    images,
    classOnly,
    openid: app.globalData.openid,
    ...app.getActivityContext()
  });
};

export const likeMoment = (momentId) => {
  return cloudFunction('moment', {
    action: 'like',
    momentId,
    openid: app.globalData.openid
  });
};

export const commentMoment = (momentId, content) => {
  return cloudFunction('moment', {
    action: 'comment',
    momentId,
    content,
    openid: app.globalData.openid
  });
};

export const getCommentList = (momentId, page = 1, pageSize = 20) => {
  return cloudFunction('moment', {
    action: 'getComments',
    momentId,
    page,
    pageSize
  });
};

// 我的动态列表
export const getMyMoments = (page = 1, pageSize = 20) => {
  return cloudFunction('moment', {
    action: 'getMyList',
    page,
    pageSize,
    openid: app.globalData.openid
  });
};

// 删除动态
export const deleteMoment = (momentId) => {
  return cloudFunction('moment', {
    action: 'delete',
    momentId,
    openid: app.globalData.openid
  });
};

// 我的活动列表
export const getMyActivities = () => {
  return cloudFunction('user', {
    action: 'getActivities',
    openid: app.globalData.openid
  });
};

// 上传图片到云存储
export const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const cloudPath = `images/${Date.now()}-${Math.random().toString(36).substr(2)}.png`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        resolve(res.fileID);
      },
      fail: err => {
        console.error('图片上传失败:', err);
        reject(err);
      }
    });
  });
};

// 批量上传图片
export const uploadImages = (filePaths) => {
  return Promise.all(filePaths.map(path => uploadImage(path)));
};
