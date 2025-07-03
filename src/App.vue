<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
    <StagewiseToolbar :config="stagewiseConfig" />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import { ReDialog } from "@/components/ReDialog";
import { StagewiseToolbar } from "@stagewise/toolbar-vue";
import { VuePlugin } from "@stagewise-plugins/vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog,
    StagewiseToolbar
  },
  computed: {
    currentLocale() {
      return zhCn;
    },
    stagewiseConfig() {
      return {
        plugins: [VuePlugin]
      };
    }
  }
});
</script>
