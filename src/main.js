import Vue from 'vue'
import App from './App'
import './styles/public.css'
import './styles/iconfont.css'

Vue.config.productionTip = false

// 挂载封装的网络请求封装函数
Vue.prototype.request = (params)=>{
  // 加载中
  uni.showLoading({
    title: '加载中',
    mask: true
  });
  let baseUrl = 'https://autumnfish.cn'

  return new Promise((resolve,reject) => {
    
    uni.request({
      ...params,
      url:baseUrl+params.url,
      success(res){ 
          resolve(res.data);
      },
      fail(err){
          reject(err);
      },
      complete(){
        uni.hideLoading();
      }
    })
})
};

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
