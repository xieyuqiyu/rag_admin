// filepath: d:\Development\Ragflow全套\rag_admin\src\router\modules\user.ts

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/user",
  name: "User",
  component: Layout,
  redirect: "/user/profile",
  meta: {
    icon: "ep/home-filled",
    title: "用户管理",
    rank: 1
  },
  children: [
    {
      path: "/user/profile",
      name: "UserProfile",
      component: () => import("@/views/user/profile/index.vue"),
      meta: {
        title: "用户资料",
        showLink: true
      }
    },
    {
      path: "/user/list",
      name: "UserList",
      component: () => import("@/views/user/list/index.vue"),
      meta: {
        title: "用户列表",
        showLink: true
      }
    },
    {
      path: "/user/settings",
      name: "UserSettings",
      component: () => import("@/views/user/settings/index.vue"),
      meta: {
        title: "用户设置",
        showLink: true
      }
    }
  ]
} satisfies RouteConfigsTable;