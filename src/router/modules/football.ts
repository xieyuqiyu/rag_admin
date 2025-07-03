const Layout = () => import("@/layout/index.vue");

export default {
  path: "/football",
  name: "FootBall",
  component: Layout,
  redirect: "/football/teams",
  meta: {
    icon: "ep/soccer", // 如果 Element Plus 图标集中有足球图标可以使用，否则可以换成其他合适的图标
    title: "足球管理",
    rank: 2 // 根据你的菜单排序需要调整此值
  },
  children: [
    {
      path: "/football/teams",
      name: "FootballTeams",
      component: () => import("@/views/football/teams/index.vue"),
      meta: {
        title: "球队管理",
        showLink: true
      }
    },
    {
      path: "/football/teams/detail/:id",
      name: "TeamDetail",
      component: () => import("@/views/football/teams/detail.vue"),
      meta: {
        title: "球队详情",
        showLink: false // 不在菜单中显示此页面，只能通过球队管理页面进入
      }
    },
    // {
    //   path: "/football/scores",
    //   name: "FootballScores",
    //   component: () => import("@/views/football/scores/index.vue"),
    //   meta: {
    //     title: "比分更新",
    //     showLink: true
    //   }
    // },
    // {
    //   path: "/football/matches",
    //   name: "FootballMatches",
    //   component: () => import("@/views/football/matches/index.vue"),
    //   meta: {
    //     title: "赛事安排",
    //     showLink: true
    //   }
    // },
    // {
    //   path: "/football/matchesforcsv",
    //   name: "FootballMatchesCsv",
    //   component: () => import("@/views/football/matchesforcsv/index.vue"),
    //   meta: {
    //     title: "赛事导入",
    //     showLink: true
    //   }
    // },

    {
      path: "/football/recommendations",
      name: "FootballRecommendations",
      component: () => import("@/views/football/recommendations/index.vue"),
      meta: {
        title: "赛事管理",
        showLink: true
      }
    },
    {
      path: "/football/newmatches",
      name: "FootballNewMatches",
      component: () => import("@/views/football/newmatches/index.vue"),
      meta: {
        title: "赛事安排",
        showLink: true
      }
    },
    {
      path: "/football/statistics",
      name: "FootballStatistics",
      component: () => import("@/views/football/statistics/index.vue"),
      meta: {
        title: "数据统计",
        showLink: true
      }
    }
  ]
} satisfies RouteConfigsTable;
