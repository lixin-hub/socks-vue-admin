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
// 导入表格树
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.config.productionTip = false
// 配置请求根路径
axios.defaults.baseURL = 'http://localhost:10010/'
// 挂在到Vue实例，后面可通过this调用
Vue.prototype.$http = axios
// 组件全局注册 表格树
Vue.component('tree-table', TreeTable)
// 全局注册富文本编辑器
Vue.use(VueQuillEditor)
// 在request 拦截器中, 展示进度条 NProgress.start()
// 请求在到达服务器之前，先会调用use中的这个回调函数来添加请求头信息

axios.interceptors.request.use(config => {
    NProgress.start()
    // 为请求头对象，添加token验证的Authorization字段
    var item = window.sessionStorage.getItem('token')
    console.log("token",item)
    config.headers.Authorization = item
    // 在最后必须 return config
    return config
})
// response 拦截器中,  隐藏进度条NProgress.done()
axios.interceptors.response.use(response => {
        console.log(response)
        NProgress.done()
        return response
    },
    error => {
        console.log(error)
        switch (error.response.status) {
            case 401:
                this.v.$router.push('/login')
                this.v.$message.warning("认证失败,请重新登录")
                break;
        }
        return Promise.reject(error)
    })
//全局的时间格式过滤器

Vue.filter('dataFormat', function (originVal) {
    const dt = new Date(originVal)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
    // yyyy-mm-dd hh:mm:ss
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
    // return originVal
})
// eslint-disable-next-line no-unused-vars
var v = new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
