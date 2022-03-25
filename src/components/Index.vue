<template>
	<a-layout id="components-layout-demo-side" style="min-height: 100vh">
		<a-layout-sider class="sider" :style="{overflow: 'auto', height: '100vh', position: 'fixed', left: 0,    display: none }">
			<div class="logo">
				启奥科技 V2.1.0
			</div>
			<a-menu theme="dark" mode="inline" :inlineIndent="40">
				<a-menu-item v-for="(item,index) in module" :key="index" class="item" :title=item.title>
					<router-link :to=item.id>
						<div class="menuItem">
							<a-icon type="appstore" theme="filled"/>
							<span>{{ item.title }}</span>
						</div>
					</router-link>
				</a-menu-item>
				<a-menu-item key="Setting" title="设置">
					<router-link to="/Setting">
						<div class="menuItem">
							<a-icon type="appstore" theme="filled"/>
							<span>设置</span>
						</div>
					</router-link>
				</a-menu-item>
			</a-menu>
		</a-layout-sider>
		<a-layout style="margin-bottom: 16px">
			<a-layout-content style="margin-left: 216px ;margin-right: 16px;margin-bottom: 16px">
				<div :style="{ margin:'16px 0', padding: '24px', background: '#fff', minHeight: '560px'}">
					<router-view></router-view>
				</div>
				<a-modal
						title="Title"
						:visible="visible"
						:confirm-loading="confirmLoading"
						@ok="handleOk"
						:cancel-button-props="null"
				>
					<p>检测到可升级版本，请点击确认升级</p>
				</a-modal>
			</a-layout-content>
			<a-layout-footer style="text-align: center">
				唐山启奥科技股份有限公司
			</a-layout-footer>
		</a-layout>
	</a-layout>

</template>

<script>
import {ipcRenderer} from "electron";

export default {
	name: "Index",
	data() {
		return {
			visible: false,
			confirmLoading: false,
			module: []
		};
	},
	created() {
		// ipcRenderer.send('readyToUpdate');
		ipcRenderer.send('getModuleStore', {name: "getModule"});
		ipcRenderer.on("getModule", (event, arg) => {
			this.module = arg.module;
		});
		ipcRenderer.send("requiredModules")
		ipcRenderer.on("updateMessage",(event, args)=>{
			console.log("updateMessage")
			if (args.status===1){
				const h = this.$createElement;
				this.$info({
					title: '采集服务升级',
					content: h('div', {}, [
						h('p', '检测到可升级版本，请点击确认升级'),
					]),
					okText:'确认',
					onOk() {
						ipcRenderer.send("isUpdateNow");
						this.confirmLoading = true;
						this.visible = false;
					}
				});
			}
		})
	},
	methods: {
	}
}
</script>

<style scoped>
#components-layout-demo-side .logo {
	height: 32px;
	margin-top: 16px;
	color: #ffffff;

}
.menuItem {
	float: left;
}


::-webkit-scrollbar {
	display: none;
}
</style>
