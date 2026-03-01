// utils/api.js - API请求封装
const app = getApp();

// 开发模式开关 - 开发时设置为true使用模拟数据，上线时改为false
const DEV_MODE = true;

// 云函数调用封装
const cloudFunction = (name, data) => {
  return new Promise((resolve, reject) => {
    // 开发模式：返回模拟数据
    if (DEV_MODE) {
      setTimeout(() => {
        const mockData = getMockData(name, data);
        if (mockData) {
          resolve(mockData);
        } else {
          reject('暂无模拟数据');
        }
      }, 500); // 模拟网络延迟
      return;
    }

    // 生产模式：调用真实云函数
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

// 获取模拟数据
const getMockData = (name, data) => {
  const mockDataMap = {
    'activity': {
      'getInfo': {
        success: true,
        data: {
          schoolName: '北京市实验小学',
          activityName: '2026春季研学活动',
          grade: '五年级',
          startTime: Date.now(),
          endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
          status: 'ongoing'
        }
      },
      'getStages': {
        success: true,
        data: {
          stages: [
            { id: 1, name: '目的地投票', icon: '📍', status: 'active', url: '/pages/vote/vote' },
            { id: 2, name: '任务预习', icon: '📚', status: 'locked', url: '/pages/preview/preview' },
            { id: 3, name: '研学过程', icon: '🎒', status: 'locked', url: '/pages/process/process' },
            { id: 4, name: '活动回顾', icon: '📝', status: 'locked', url: '/pages/review/review' }
          ]
        }
      }
    },
    'vote': {
      'getList': {
        success: true,
        data: {
          destinations: [
            {
              id: 1,
              name: '通州国际都市农业科技园',
              image: 'https://mmbiz.qpic.cn/mmbiz_jpg/demo1.jpg',
              activities: '体验智能温室、水培组装、组培室、美食制作等活动',
              votes: 0
            },
            {
              id: 2,
              name: '北京大兴野生动物园',
              image: 'https://mmbiz.qpic.cn/mmbiz_jpg/demo2.jpg',
              activities: '体验丰容制作、营养配餐、模拟兽医等活动',
              votes: 0
            },
            {
              id: 3,
              name: '北京艺云数字艺术中心',
              image: 'https://mmbiz.qpic.cn/mmbiz_jpg/demo3.jpg',
              activities: '体验超验之躯、敦煌宇宙、光与色、敦煌花灯、飞天星座、时间机器、出神入画等活动',
              votes: 0
            },
            {
              id: 4,
              name: '北京陶瓷艺术馆',
              image: 'https://mmbiz.qpic.cn/mmbiz_jpg/demo4.jpg',
              activities: '体验指尖陶瓷制作、泥塑成型、釉下绘画、拉坯体验和扎染技艺等活动',
              votes: 0
            },
            {
              id: 5,
              name: '国家中影数字制作基地',
              image: 'https://mmbiz.qpic.cn/mmbiz_jpg/demo5.jpg',
              activities: '体验拟音车间、绿幕摄影棚、特效化妆、光影魔术等活动',
              votes: 0
            },
            {
              id: 6,
              name: '北京国际青年营',
              image: 'https://mmbiz.qpic.cn/mmbiz_jpg/demo6.jpg',
              activities: '体验安营扎寨、生命之源、荒野定位、急救互助、埋锅造饭等活动',
              votes: 0
            }
          ],
          maxSelect: 2,
          deadline: '2026-03-15',
          hasVoted: false,
          showResult: false
        }
      }
    },
    'preview': {
      'getTasks': {
        success: true,
        data: {
          identity: '野外生存小专家',
          challenge: '当我们去野外游玩时，如果一不小心与朋友或家人走散，一时找不到回家的路，我们该如何在野外生存呢？',
          skills: '我们即将体验安营扎寨、生命之源、荒野定位、急救互助、埋锅造饭等项目，帮助你完成挑战！',
          questions: [
            {
              id: 1,
              question: '你解锁的新身份是（   ）',
              options: [
                { label: 'A.环保志愿者', value: 'A' },
                { label: 'B.野外生存小专家', value: 'B' }
              ],
              answer: 'B'
            },
            {
              id: 2,
              question: '你面临的挑战是（   ）',
              options: [
                { label: 'A.如何在野外生存？', value: 'A' },
                { label: 'B.如何进行垃圾分类？', value: 'B' }
              ],
              answer: 'A'
            }
          ]
        }
      }
    },
    'process': {
      'getList': {
        success: true,
        data: {
          list: [
            {
              id: 1,
              time: '2026-03-10 09:30',
              title: '出发啦！',
              content: '同学们早上8点在学校集合，大家都很兴奋！',
              images: [],
              location: '学校门口'
            },
            {
              id: 2,
              time: '2026-03-10 10:30',
              title: '到达营地',
              content: '经过1小时的车程，我们顺利到达北京国际青年营，教练向我们介绍了今天的活动安排。',
              images: [],
              location: '北京国际青年营'
            },
            {
              id: 3,
              time: '2026-03-10 11:00',
              title: '安营扎寨',
              content: '在教练的指导下，同学们分组搭建帐篷，大家齐心协力，很快就搭好了！',
              images: [],
              location: '营地'
            }
          ],
          hasMore: false
        }
      }
    },
    'review': {
      'getArticle': {
        success: true,
        data: {
          title: '2026春季研学活动圆满结束',
          date: '2026-03-15',
          cover: 'https://mmbiz.qpic.cn/mmbiz_jpg/review_cover.jpg',
          views: 1286,
          content: '<p>经过一天精彩的研学活动，同学们收获满满...</p><p>在野外生存训练中，大家学会了搭建帐篷、寻找水源、野外定位等技能...</p>',
          images: []
        }
      }
    },
    'album': {
      'getList': {
        success: true,
        data: {
          list: [
            {
              id: 1,
              title: '2026春季·五年级博物馆研学',
              cover: 'https://mmbiz.qpic.cn/mmbiz_jpg/demo_cover.jpg',
              date: '2026-03-01',
              grade: '五年级',
              photoCount: 120
            }
          ]
        }
      }
    },
    'moment': {
      'getList': {
        success: true,
        data: {
          list: [
            {
              id: 1,
              userName: '张小明',
              userClass: '五(1)班',
              userAvatar: '',
              content: '今天的研学活动太有趣了！我们参观了智能温室，看到了很多先进的农业技术。',
              images: [],
              likeCount: 5,
              commentCount: 2,
              timeText: '2小时前',
              createTime: Date.now() - 2 * 60 * 60 * 1000
            }
          ],
          hasMore: false
        }
      }
    },
    'user': {
      'getActivities': {
        success: true,
        data: {
          list: [
            {
              id: 1,
              school_id: 'school001',
              act_id: 'act001',
              schoolName: '北京市实验小学',
              activityName: '2026春季研学活动',
              time: '2026-03-01',
              status: 'ongoing'
            }
          ]
        }
      }
    }
  };

  if (mockDataMap[name] && mockDataMap[name][data.action]) {
    return mockDataMap[name][data.action];
  }

  // 默认返回成功但数据为空
  return {
    success: true,
    data: {}
  };
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
