<template>
  <div>
    <a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item label="系统">
        <a-radio-group v-model="form.system">
          <a-radio value="iei">
            一体化
          </a-radio>
          <a-radio value="shinow">
            shinow 9.0
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item label="一体化地址" v-show="form.system==='iei'">
        <a-tooltip :trigger="['focus']" placement="topLeft" overlay-class-name="numeric-input">
          <template slot="title">
            例如：http://192.168.0.1:8080
          </template>
          <a-input v-model="form.ieiUrl"/>
        </a-tooltip>
      </a-form-model-item>
      <a-form-model-item label="扩展服务地址" v-show="form.system==='shinow'">
        <a-tooltip :trigger="['focus']" placement="topLeft" overlay-class-name="numeric-input">
          <template slot="title">
            例如：http://192.168.0.1:8080
          </template>
          <a-input v-model="form.url"/>
        </a-tooltip>
      </a-form-model-item>
      <a-form-model-item label="9.0用户名" v-show="form.system==='shinow'">
        <a-input v-model="form.userName"/>
      </a-form-model-item>
      <a-form-model-item label="9.0密码" v-show="form.system==='shinow'">
        <a-input-password :visibilityToggle="false" v-model="form.password"/>
      </a-form-model-item>
      <a-form-model-item label="采集服务升级地址">
        <a-input v-model="form.updateAddress"/>
      </a-form-model-item>
      <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit" :disabled="finishDisabled">
          确定
        </a-button>
        <a-button type="primary" @click="onOpen"  :style="{ marginLeft: '16px' }">
          模块选择
        </a-button>
      </a-form-model-item>
    </a-form-model>
    <a-drawer
        title="请选择模块"
        :width="300"
        :visible="showDraw"
        :body-style="{ paddingBottom: '80px' }"
        @close="onClose"
    >
      <div :style="{ paddingBottom:'15px',borderBottom: '1px solid #E9E9E9' }">
        <a-checkbox :style="{ marginLeft:'50px'}" :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">
          全选
        </a-checkbox>
      </div>
      <br/>
      <a-checkbox-group :style="{ marginLeft:'50px',marginRight:'100px'}" v-model="checkedList" :options="authorityData" @change="onChange"/>
    </a-drawer>
  </div>

</template>

<script>
import {ipcRenderer} from "electron";
import authority from "../../authority/authority";

const authorityData = [];
const checkedAllList = [];
export default {
	name: "Setting",
	computed: {
		finishDisabled() {
			let regex = "^(http|https|ftp)\\://([a-zA-Z0-9\\.\\-]+(\\:[a-zA-Z0-9\\.&amp;%\\$\\-]+)*@)?((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\\-]+\\.)*[a-zA-Z0-9\\-]+\\.[a-zA-Z]{2,4})(\\:[0-9]+)?(/[^/][a-zA-Z0-9\\.\\,\\?\\'\\\\/\\+&amp;%\\$#\\=~_\\-@]*)*$";
			let re = new RegExp(regex);
			if (!re.test(this.form.updateAddress)){
				return true;
			}
			if (this.form.system === "shinow") {
				return !re.test(this.form.url)
			} else {
				return !re.test(this.form.ieiUrl)
			}
		}
	},
	data() {
    for (let i = 0; i < authority.length; i++) {
      checkedAllList.push(authority[i].id)
      authorityData.push({
        label: authority[i].title,
        value: authority[i].id,
      })
    }
		return {
      checkAll: false,
      authorityData,
      checkedList: [],
      indeterminate: true,
      showDraw:false,
			labelCol: {span: 6},
			wrapperCol: {span: 14},
			form: {ieiUrl: '', url: '', userName: '', password: '',updateAddress:''},
		};
	},
	created() {
		ipcRenderer.send('getStore', {name: "getForm"});
		ipcRenderer.on("getForm", (event, arg) => {
			this.form = arg.form;
		});

	},
	methods: {
    onChange(checkedList) {
      this.checkedList = checkedList;
      console.log(checkedList)
      this.indeterminate = !!checkedList.length && checkedList.length < authorityData.length;
      this.checkAll = checkedList.length === authorityData.length;
    },
    onCheckAllChange(e) {
      Object.assign(this, {
        checkedList: e.target.checked ? checkedAllList : [],
        indeterminate: false,
        checkAll: e.target.checked,
      });
    },
    onOpen(){
      this.showDraw = true
      ipcRenderer.send('getModuleStore', {name:"getModuleStore"});
      ipcRenderer.on("getModuleStore", (event, arg) => {
        let moduleList = arg.module;
        this.checkedList = moduleList.map(data=>{
          return data.id.substr(1);
        })
      });
    },
    onClose(){
      this.showDraw = false
      const checkedData = [];
      for (let i = 0; i < authority.length; i++) {
        if (this.checkedList.includes(authority[i].id)) {
          checkedData.push({
            id: '/' + authority[i].id,
            title: authority[i].title,
            background: authority[i].background,
          })
        }
      }
      ipcRenderer.send('setModuleStore', checkedData);
      ipcRenderer.send('relaunch');
    },
		onSubmit() {
			this.$message.info('保存成功');
			ipcRenderer.send('setStore', this.form);
		},
	}
}
</script>

<style scoped>

</style>
