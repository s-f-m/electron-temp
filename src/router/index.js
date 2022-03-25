import VueRouter from 'vue-router'
import authority from "@/authority/authority";
import Setting from "@/components/setting/Setting";

const routes = []
for (let i = 0; i < authority.length; i++) {
    routes.push({
        path: '/' + authority[i].id,
        component: authority[i].component
    })
}
routes.push({path: '/Setting', component: Setting})
const router = new VueRouter({
    routes
})

export default router;
