// utils/util.js - 工具函数
// 格式化时间
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');
  const second = d.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// 格式化时间(简短)
export const formatTimeShort = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  }
};

// 格式化日期
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// 验证手机号
export const validatePhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone);
};

// 验证短信验证码
export const validateSmsCode = (code) => {
  return /^\d{6}$/.test(code);
};

// 显示Toast
export const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  });
};

// 显示Loading
export const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

// 隐藏Loading
export const hideLoading = () => {
  wx.hideLoading();
};

// 显示确认对话框
export const showConfirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
};

// 显示提示对话框
export const showAlert = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      showCancel: false,
      success: () => {
        resolve();
      }
    });
  });
};

// 预览图片
export const previewImage = (current, urls) => {
  wx.previewImage({
    current,
    urls
  });
};

// 保存图片到相册
export const saveImageToPhotosAlbum = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              saveImage(filePath, resolve, reject);
            },
            fail: () => {
              showToast('需要授权保存相册权限');
              reject();
            }
          });
        } else {
          saveImage(filePath, resolve, reject);
        }
      }
    });
  });
};

const saveImage = (filePath, resolve, reject) => {
  wx.saveImageToPhotosAlbum({
    filePath,
    success: () => {
      showToast('保存成功', 'success');
      resolve();
    },
    fail: (err) => {
      console.error('保存失败:', err);
      showToast('保存失败');
      reject(err);
    }
  });
};

// 选择图片
export const chooseImage = (count = 1) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths);
      },
      fail: reject
    });
  });
};

// 节流函数
export const throttle = (fn, delay = 500) => {
  let timer = null;
  return function (...args) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

// 防抖函数
export const debounce = (fn, delay = 500) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 获取年级列表
export const getGradeList = () => {
  return [
    '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
    '初一', '初二', '初三',
    '高一', '高二', '高三'
  ];
};

// 获取班级列表(1-20班)
export const getClassList = () => {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    list.push(`${i}班`);
  }
  return list;
};

// 深拷贝
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloneObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key]);
    }
  }
  return cloneObj;
};
