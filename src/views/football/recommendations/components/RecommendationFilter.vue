<template>
  <div class="filter-section">
    <el-form :inline="true" :model="form">
      <el-form-item label="联赛">
        <el-select
          v-model="form.league"
          placeholder="选择联赛"
          clearable
          filterable
          style="width: 150px"
        >
          <el-option
            v-for="league in leagueOptions"
            :key="league.abbreviation"
            :label="league.abbreviation"
            :value="league.abbreviation"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select
          v-model="form.status"
          placeholder="选择状态"
          clearable
          style="width: 150px"
        >
          <el-option label="待推荐" value="pending" />
          <el-option label="已推荐" value="recommended" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>

      <el-form-item label="日期范围">
        <el-date-picker
          v-model="form.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="球队">
        <el-input
          v-model="form.team"
          placeholder="搜索球队"
          clearable
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleFilter">筛选</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import type { FilterForm } from "../types";

interface Props {
  modelValue: FilterForm;
  leagueOptions: Array<{ abbreviation: string }>;
}

interface Emits {
  (e: "update:modelValue", value: FilterForm): void;
  (e: "filter"): void;
  (e: "reset"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = reactive<FilterForm>({ ...props.modelValue });

// 监听表单变化，同步到父组件
watch(
  form,
  newVal => {
    emit("update:modelValue", { ...newVal });
  },
  { deep: true }
);

// 监听props变化，同步到表单
watch(
  () => props.modelValue,
  newVal => {
    Object.assign(form, newVal);
  },
  { deep: true }
);

const handleFilter = () => {
  emit("filter");
};

const handleReset = () => {
  form.league = "";
  form.status = "";
  form.dateRange = [];
  form.team = "";
  emit("reset");
};
</script>

<style lang="scss" scoped>
.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
