import Vue from 'vue'
import App from './App.vue'
import 'ant-design-vue/dist/antd.css';
import Antd from 'ant-design-vue';
import router from "@/router";
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import ipc from "@/ipc/ipc"

Vue.config.productionTip = false
Vue.use(Antd);
Vue.use(VueRouter)
Vue.use(Vuex)
const store = new Vuex.Store({
    modules: {

    }
})
ipc(store);

new Vue({
    render: h => h(App),
    router,
    store
}).$mount('#app')
