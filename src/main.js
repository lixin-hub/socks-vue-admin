import Vue from 'vue'
import App from './App.vue'
import router from "./router";
// 导入NProgress, 包对应的JS和CSS
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import axios from 'axios'

Vue.config.productionTip = false
// 配置请求根路径
axios.defaults.baseURL = 'http://42.193.22.5:8887/api/private/v1/'
// 挂在到Vue实例，后面可通过this调用
Vue.prototype.$http = axios

// 在request 拦截器中, 展示进度条 NProgress.start()
// 请求在到达服务器之前，先会调用use中的这个回调函数来添加请求头信息
axios.interceptors.request.use(config => {
    NProgress.start()
    // console.log(config)
    // 为请求头对象，添加token验证的Authorization字段
    config.headers.Authorization = window.sessionStorage.getItem('token')
    // 在最后必须 return config
    return config
})
// response 拦截器中,  隐藏进度条NProgress.done()
axios.interceptors.response.use(config => {
    NProgress.done()
    return config
})
new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
