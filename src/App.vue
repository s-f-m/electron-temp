<template>
  <div>
      <div id="app">
         <a-locale-provider :locale="zh_CN">
             <Index v-if="showComponents" />
          </a-locale-provider>
      </div>
      <setting-page v-if="!showComponents" />
  </div>

</template>

<script>
    import {ipcRenderer} from "electron";
    import Index from './components/Index.vue'
    import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN';
    import 'moment/locale/zh-cn';
    import SettingPage from "@/components/setting_page/SettingPage";

    export default {
        name: 'App',
        components: {
          Index,
          SettingPage
        },
        created() {
            ipcRenderer.send('getSettingFinish', { name: "getSettingFinishIPC"});
            ipcRenderer.on("getSettingFinishIPC", (event, arg) => {
                this.showComponents = arg.settingFinish===1;
            });
        },
        data() {
            return {
                showComponents:false,
                zh_CN,
            };
        },
        methods:{
            changePage(){
                this.showComponents = true
            }
        }
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }
</style>
