<template>
  <div class="match-recommendations-container">
    <div class="header-section">
      <h1>赛事推荐</h1>
      <div class="header-buttons">
        <el-button type="primary" @click="() => fetchRecommendations()">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 过滤区域 -->
    <RecommendationFilter
      v-model="filterForm"
      :league-options="leagueOptions"
      @filter="handleFilter"
      @reset="resetFilter"
    />

    <!-- 赛事推荐列表 -->
    <RecommendationTable
      :table-data="tableData"
      :pagination="pagination"
      :loading="loading"
      @edit="handleEditBetting"
      @confirm="handleConfirmRecommendation"
      @delete="handleDeleteBetting"
      @delete-match="handleDeleteMatch"
      @add="handleAddBetting"
      @recommend="handleRecommend"
      @bold-recommendation-change="handleBoldRecommendationChange"
      @probability-change="handleProbabilityChange"
      @rate-change="handleRateChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 编辑投注详情对话框 -->
    <EditBettingDialog
      v-model="editDialogVisible"
      :loading="editLoading"
      :row-data="currentEditRow"
      @save="handleSaveEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
// 导入联赛数据
import leaguesData from "@/config/leagues.json";
import type { TableRowData } from "./types";
// 导入API
import { updateMatchRecommendation } from "@/api/football";
// 导入组件
import RecommendationFilter from "./components/RecommendationFilter.vue";
import RecommendationTable from "./components/RecommendationTable.vue";
import EditBettingDialog from "./components/EditBettingDialog.vue";
// 导入composable
import { useRecommendations } from "./composables/useRecommendations";

// 使用composable
const {
  loading,
  tableData,
  pagination,
  filterForm,
  fetchRecommendations,
  saveBettingDetail,
  handleConfirmRecommendation,
  handleDeleteBetting,
  handleDeleteMatch,
  handleRecommend,
  handleBoldRecommendationChange,
  handleProbabilityChange,
  handleFilter,
  resetFilter,
  handleSizeChange,
  handleCurrentChange
} = useRecommendations();

// 状态变量
const editLoading = ref(false);
const editDialogVisible = ref(false);
const currentEditRow = ref<TableRowData | null>(null);

// 联赛选项
const leagueOptions = ref(leaguesData.leagues);

// 生命周期
onMounted(() => {
  fetchRecommendations();
});

/**
 * 处理编辑投注详情
 */
const handleEditBetting = (row: TableRowData) => {
  currentEditRow.value = row;
  editDialogVisible.value = true;
};

/**
 * 保存编辑
 */
const handleSaveEdit = async (formData: any) => {
  editLoading.value = true;
  try {
    await saveBettingDetail(formData);
    editDialogVisible.value = false;
  } finally {
    editLoading.value = false;
  }
};

/**
 * 添加投注详情
 */
const handleAddBetting = (row: TableRowData) => {
  currentEditRow.value = null; // 新增模式
  editDialogVisible.value = true;
};

/**
 * 处理胜率变化
 */
const handleRateChange = async (row: TableRowData, type: "home" | "away", value: number) => {
  try {
    // 构建更新数据
    const updateData = {
      [type === 'home' ? 'home_win_rate' : 'away_win_rate']: value
    };
    
    // 调用API更新胜率数据
    await updateMatchRecommendation(row.matchId, updateData);
    
    // 更新本地数据
    if (type === 'home') {
      row.home_win_rate = value;
    } else {
      row.away_win_rate = value;
    }
    
    console.log(`更新${type === 'home' ? '主队' : '客队'}胜率:`, {
      matchId: row.matchId,
      type,
      value: (value * 100).toFixed(1) + '%'
    });
    
    // 显示成功提示
    ElMessage.success(`${type === 'home' ? '主队' : '客队'}胜率已更新为 ${(value * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('更新胜率失败:', error);
    ElMessage.error('更新胜率失败，请重试');
    
    // 刷新数据以恢复原始值
    await fetchRecommendations();
  }
};
</script>

<style lang="scss" scoped>
.match-recommendations-container {
  padding: 20px;

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-buttons {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }
}
</style>
