<template>
	<a-layout>
		<a-layout-header class="steps">
			<a-steps v-model="current" type="navigation">
				<a-step v-for="(item,index) in steps" :title="'Step '+(index+1)" :key="item.id" :disabled="true"/>
			</a-steps>
		</a-layout-header>
		<a-layout-content class="steps-content">
			<a-page-header :title="steps[current].title"/>
			<div v-if="current === 0">
				<div :style="{ marginTop: '16px' }">
					<a-radio-group :style="{ marginLeft:'100px'}" name="radioGroup" v-model="form.system">
						<a-radio :style="{ marginBottom:'20px'}" value="iei">
							智能设备一体化管理系统
						</a-radio>
						<br/>
						<a-radio value="shinow">
							Shinow9.0采供血业务系统
						</a-radio>
					</a-radio-group>
				</div>
			</div>
			<div v-if="current === 1">
				<div :style="{ paddingBottom:'15px',borderBottom: '1px solid #E9E9E9' }">
					<a-checkbox :style="{ marginLeft:'100px'}" :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">
						全选
					</a-checkbox>
				</div>
				<br/>
				<a-checkbox-group :style="{ marginLeft:'100px'}" v-model="checkedList" :options="authorityData" @change="onChange"/>
			</div>
			<div v-if="current === 2">
				<a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
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
						<a-input type="password" v-model="form.password"/>
					</a-form-model-item>
					<a-form-model-item label="采集服务升级地址" >
						<a-input v-model="form.updateAddress"/>
					</a-form-model-item>
				</a-form-model>
			</div>
		</a-layout-content>

		<a-layout-footer class="steps-action">
			<a-button v-if="current > 0" @click="prev">上一步</a-button>
			<a-button v-if="current < steps.length - 1" type="primary" @click="next" style="margin-left: 30px" :disabled="nextDisabled">下一步
			</a-button>
			<a-button v-if="current === steps.length - 1" type="primary" @click=finish() style="margin-left: 30px" :disabled="finishDisabled">完成
			</a-button>
		</a-layout-footer>

	</a-layout>
</template>

<script>
import {ipcRenderer} from "electron";
import authority from '../../authority/authority'

const authorityData = [];
const checkedAllList = [];
export default {
	name: "SettingPage",
	computed: {
		nextDisabled() {
			if (this.current === 1) {
				return !this.checkedList.length
			}
			return false;
		},
		finishDisabled() {
			if (this.current === 2) {
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
			return false
		},
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
			current: 0,
			steps: [
				{
					title: '请选择直接对接的业务系统',
				},
				{
					title: '请选择需要安装的模块',
				},

				{
					title: '请填写相关配置',
				},
			],
			indeterminate: true,
			checkAll: false,
			authorityData,
			checkedList: [],
			labelCol: {span: 6},
			wrapperCol: {span: 14},
			form: {system: 'iei', ieiUrl: '', url: '', userName: '', password: '',updateAddress:''},
		};
	},
	methods: {
		next() {
			if (this.current === 0) {
				let temp = [];
				let all = [];
				for (let i = 0; i < authority.length; i++) {
					if ((authority[i].system === 1 || authority[i].system === 3) && this.form.system === 'iei') {
						temp.push({
							label: authority[i].title,
							value: authority[i].id,
						})
						all.push(authority[i].id)
					}
					if ((authority[i].system === 2 || authority[i].system === 3) && this.form.system === 'shinow') {
						temp.push({
							label: authority[i].title,
							value: authority[i].id,
						})
						all.push(authority[i].id)
					}
				}
				this.checkedAllList = all
				this.authorityData = temp;
			}
			this.current++;
		},
		prev() {
			if (this.current === 1) {
				this.checkedList = [];
			}
			this.current--;
		},
		finish() {
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
			this.$emit("changePage");
			ipcRenderer.send('setStore', this.form);
			ipcRenderer.send('setModuleStore', checkedData);
      ipcRenderer.send('relaunch');
		},
		onChange(checkedList) {
			this.checkedList = checkedList;
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

	}
}
</script>

<style scoped>
.steps {
	display: flex;
	align-items: center;
	background: #f3f3f3;
	margin-top: 10px;
}

.steps-content {
	margin: 10px 50px;
	border: 1px dashed #e9e9e9;
	border-radius: 6px;
	background-color: #fafafa;
	min-height: 200px;
	padding: 0 20px;
}

.steps-action {
	display: flex;
	justify-content: center;
}
</style>
