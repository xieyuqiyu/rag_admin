<template>
  <div class="table-container">
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      style="width: 100%"
      class="with-shadow merged-table"
      :span-method="handleSpanMethod"
      :row-key="getRowKey"
    >
      <!-- 比赛时间 -->
      <el-table-column label="比赛时间" prop="match_time" width="140" sortable>
        <template #default="{ row }">
          {{ formatDateTime(row.match_time) }}
        </template>
      </el-table-column>

      <!-- 联赛 -->
      <el-table-column label="联赛" prop="league" width="120" />

      <!-- 主队 -->
      <el-table-column label="主队" prop="home_team" width="120" />

      <!-- 客队 -->
      <el-table-column label="客队" prop="away_team" width="120" />

      <!-- 主队胜率 -->
      <!-- <el-table-column label="主队胜率" prop="home_win_rate" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.home_win_rate !== undefined" type="info">
            {{ (row.home_win_rate * 100).toFixed(1) }}%
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column> -->

      <!-- 客队胜率 -->
      <!-- <el-table-column label="客队胜率" prop="away_win_rate" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.away_win_rate !== undefined" type="info">
            {{ (row.away_win_rate * 100).toFixed(1) }}%
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column> -->

      <!-- 比赛状态 -->
      <el-table-column label="比赛状态" prop="match_status" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.match_status)">
            {{ getStatusText(row.match_status) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 比赛备注 -->
      <!-- <el-table-column
        label="比赛备注"
        prop="match_notes"
        width="150"
        show-overflow-tooltip
      /> -->

      <!-- 竞彩编号 -->
      <el-table-column label="竞彩编号" prop="jingcai_number" width="100">
        <template #default="{ row }">
          {{ row.jingcai_number || "-" }}
        </template>
      </el-table-column>

      <!-- 北单编号 -->
      <el-table-column label="北单编号" prop="beidan_number" width="100">
        <template #default="{ row }">
          {{ row.beidan_number || "-" }}
        </template>
      </el-table-column>

      <!-- 竞彩让球 -->
      <el-table-column label="竞彩让球" prop="jingcai_handicap" width="100">
        <template #default="{ row }">
          {{ row.jingcai_handicap !== undefined ? row.jingcai_handicap : "-" }}
        </template>
      </el-table-column>

      <!-- 北单让球 -->
      <el-table-column label="北单让球" prop="beidan_handicap" width="100">
        <template #default="{ row }">
          {{ row.beidan_handicap !== undefined ? row.beidan_handicap : "-" }}
        </template>
      </el-table-column>

      <!-- 胜 -->
      <el-table-column label="胜" prop="win" width="120">
        <template #default="{ row }">
          <div class="odds-cell">
            <div class="odds-value">
              {{ row.win !== undefined ? row.win : "-" }}
            </div>
            <el-button
              v-if="row.betting_id && row.win !== undefined"
              :type="isRecommended(row, 'win') ? 'success' : 'primary'"
              size="small"
              class="recommend-btn"
              :title="isRecommended(row, 'win') ? '点击取消' : '点击选择'"
              @click="handleRecommend(row, 'win')"
            >
              <template v-if="isRecommended(row, 'win')">
                <i class="el-icon-check" style="margin-right: 2px" />已选
              </template>
              <template v-else>选择</template>
            </el-button>
          </div>
        </template>
      </el-table-column>

      <!-- 平 -->
      <el-table-column label="平" prop="draw" width="120">
        <template #default="{ row }">
          <div class="odds-cell">
            <div class="odds-value">
              {{ row.draw !== undefined ? row.draw : "-" }}
            </div>
            <el-button
              v-if="row.betting_id && row.draw !== null"
              :type="isRecommended(row, 'draw') ? 'success' : 'primary'"
              size="small"
              class="recommend-btn"
              :title="isRecommended(row, 'draw') ? '点击取消' : '点击选择'"
              @click="handleRecommend(row, 'draw')"
            >
              <template v-if="isRecommended(row, 'draw')">
                <i class="el-icon-check" style="margin-right: 2px" />已选
              </template>
              <template v-else>选择</template>
            </el-button>
            <span v-else>-</span>
          </div>
        </template>
      </el-table-column>

      <!-- 负 -->
      <el-table-column label="负" prop="lose" width="120">
        <template #default="{ row }">
          <div class="odds-cell">
            <div class="odds-value">
              {{ row.lose !== undefined ? row.lose : "-" }}
            </div>
            <el-button
              v-if="row.betting_id && row.lose !== undefined"
              :type="isRecommended(row, 'lose') ? 'success' : 'primary'"
              size="small"
              class="recommend-btn"
              :title="isRecommended(row, 'lose') ? '点击取消' : '点击选择'"
              @click="handleRecommend(row, 'lose')"
            >
              <template v-if="isRecommended(row, 'lose')">
                <i class="el-icon-check" style="margin-right: 2px" />已选
              </template>
              <template v-else>选择</template>
            </el-button>
          </div>
        </template>
      </el-table-column>

      <!-- 投注主队胜率 -->
      <el-table-column
        label="投注主队胜率"
        prop="betting_home_win_rate"
        width="180"
      >
        <template #default="{ row }">
          <div v-if="row.betting_id" class="editable-cell">
            <!-- 编辑状态 -->
            <div v-if="row.editingHomeRate" class="editing-state">
              <el-input-number
                ref="homeRateInput"
                :model-value="
                  row.betting_home_win_rate
                    ? row.betting_home_win_rate * 100
                    : 0
                "
                :precision="1"
                :step="0.1"
                :min="0"
                :max="100"
                size="small"
                style="width: 100px"
                @change="
                  val => handleProbabilityChange(row, 'home_win_rate', val)
                "
                @blur="row.editingHomeRate = false"
                @keyup.enter="row.editingHomeRate = false"
              />
              <span class="percentage">%</span>
            </div>
            <!-- 显示状态 -->
            <div
              v-else
              class="display-state"
              @click="startEditing(row, 'home')"
            >
              <span class="rate-value">
                {{
                  row.betting_home_win_rate
                    ? (row.betting_home_win_rate * 100).toFixed(1)
                    : "0.0"
                }}%
              </span>
              <i class="el-icon-edit edit-icon" />
            </div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 投注客队胜率 -->
      <el-table-column
        label="投注客队胜率"
        prop="betting_away_win_rate"
        width="180"
      >
        <template #default="{ row }">
          <div v-if="row.betting_id" class="editable-cell">
            <!-- 编辑状态 -->
            <div v-if="row.editingAwayRate" class="editing-state">
              <el-input-number
                ref="awayRateInput"
                :model-value="
                  row.betting_away_win_rate
                    ? row.betting_away_win_rate * 100
                    : 0
                "
                :precision="1"
                :step="0.1"
                :min="0"
                :max="100"
                size="small"
                style="width: 100px"
                @change="
                  val => handleProbabilityChange(row, 'away_win_rate', val)
                "
                @blur="row.editingAwayRate = false"
                @keyup.enter="row.editingAwayRate = false"
              />
              <span class="percentage">%</span>
            </div>
            <!-- 显示状态 -->
            <div
              v-else
              class="display-state"
              @click="startEditing(row, 'away')"
            >
              <span class="rate-value">
                {{
                  row.betting_away_win_rate
                    ? (row.betting_away_win_rate * 100).toFixed(1)
                    : "0.0"
                }}%
              </span>
              <i class="el-icon-edit edit-icon" />
            </div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 推荐胆 -->
      <el-table-column label="胆" prop="bold_recommendation" width="180">
        <template #default="{ row }">
          <div v-if="row.isFirstRow" class="bold-recommendation-cell">
            <el-radio-group
              :model-value="row.bold_recommendation || 'none'"
              size="small"
              @change="value => handleBoldRecommendationChange(row, value)"
            >
              <el-radio-button label="none">无推荐</el-radio-button>
              <el-radio-button label="recommend">推荐</el-radio-button>
              <el-radio-button label="recommend_bold">推荐胆</el-radio-button>
              <el-radio-button label="recommend_stable"
                >推荐稳胆</el-radio-button
              >
            </el-radio-group>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 推荐结果 -->
      <el-table-column label="推荐结果" prop="recommended_result" width="150">
        <template #default="{ row }">
          <div
            v-if="
              row.recommended_result &&
              (!Array.isArray(row.recommended_result) ||
                row.recommended_result.length > 0)
            "
            class="recommended-results"
          >
            <!-- 多选显示 -->
            <template v-if="Array.isArray(row.recommended_result)">
              <el-tag
                v-for="result in row.recommended_result"
                :key="result"
                :type="getRecommendationType(result)"
                size="small"
                class="result-tag"
              >
                {{ getResultLabel(result) }}
              </el-tag>
            </template>
            <!-- 单选显示 -->
            <template v-else>
              <el-tag :type="getRecommendationType(row.recommended_result)">
                {{ getResultLabel(row.recommended_result) }}
              </el-tag>
            </template>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 投注状态 -->
      <el-table-column label="投注状态" prop="betting_status" width="100">
        <template #default="{ row }">
          <el-tag
            v-if="row.betting_status"
            :type="getStatusType(row.betting_status)"
          >
            {{ getStatusText(row.betting_status) }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 投注备注 -->
      <el-table-column
        label="投注备注"
        prop="betting_notes"
        width="150"
        show-overflow-tooltip
      />

      <!-- 操作列 -->
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <!-- 只有当该行有投注详情时才显示操作按钮 -->
          <div v-if="row.betting_id">
            <el-button-group>
              <el-button
                type="primary"
                size="small"
                @click="$emit('edit', row)"
              >
                编辑
              </el-button>
              <el-button
                type="success"
                size="small"
                :disabled="row.betting_status === 'completed'"
                @click="$emit('confirm', row)"
              >
                确认推荐
              </el-button>
              <!-- 删除按钮只在该比赛的第一行显示，删除的是整个比赛推荐记录 -->
              <el-button
                v-if="row.isFirstRow"
                type="danger"
                size="small"
                @click="$emit('delete-match', row)"
              >
                删除
              </el-button>
            </el-button-group>
          </div>
          <!-- 如果是比赛的第一行且没有投注详情，显示添加和删除按钮 -->
          <div v-else-if="row.isFirstRow">
            <el-button-group>
              <el-button type="success" size="small" @click="$emit('add', row)">
                添加投注
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="$emit('delete-match', row)"
              >
                删除
              </el-button>
            </el-button-group>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('current-change', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from "vue";
import type { TableRowData, Pagination } from "../types";
import {
  formatDateTime,
  getStatusType,
  getStatusText,
  getRecommendationType
} from "../utils";

interface Props {
  tableData: TableRowData[];
  pagination: Pagination;
  loading?: boolean;
}

interface Emits {
  (e: "edit", row: TableRowData): void;
  (e: "confirm", row: TableRowData): void;
  (e: "delete", row: TableRowData): void;
  (e: "delete-match", row: TableRowData): void;
  (e: "add", row: TableRowData): void;
  (e: "size-change", size: number): void;
  (e: "current-change", page: number): void;
  (e: "recommend", row: TableRowData, result: string): void;
  (
    e: "probability-change",
    row: TableRowData,
    field: string,
    value: number
  ): void;
  (e: "bold-recommendation-change", matchId: number, value: string): void;
}

const emit = defineEmits<Emits>();
defineProps<Props>();

/**
 * 处理推荐选择
 */
const handleRecommend = (row: TableRowData, result: string) => {
  emit("recommend", row, result);
};

/**
 * 检查是否已推荐某个选项
 */
const isRecommended = (row: TableRowData, result: string): boolean => {
  if (!row.recommended_result) {
    return false;
  }

  if (Array.isArray(row.recommended_result)) {
    return row.recommended_result.includes(result);
  }

  return row.recommended_result === result;
};

/**
 * 获取推荐结果的中文标签
 */
const getResultLabel = (result: string): string => {
  const labels: Record<string, string> = {
    win: "胜",
    draw: "平",
    lose: "负"
  };
  return labels[result] || result;
};

/**
 * 处理概率变化
 */
const handleProbabilityChange = (
  row: TableRowData,
  field: string,
  value: number | null
) => {
  if (value !== null) {
    emit("probability-change", row, field, value);
  }
};

/**
 * 开始编辑胜率
 */
const startEditing = (row: TableRowData, type: "home" | "away") => {
  if (type === "home") {
    row.editingHomeRate = true;
  } else {
    row.editingAwayRate = true;
  }

  // 下一个tick后聚焦输入框
  nextTick(() => {
    const inputRef = type === "home" ? "homeRateInput" : "awayRateInput";
    // 这里可以添加聚焦逻辑，但需要考虑ref的处理方式
  });
};

/**
 * 处理胆推荐变更
 */
const handleBoldRecommendationChange = (row: TableRowData, value: string) => {
  if (row.matchId) {
    emit("bold-recommendation-change", row.matchId, value);
  }
};

/**
 * 处理表格合并单元格
 */
const handleSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  // 需要合并单元格的列（比赛基本信息列）
  // 0: 比赛时间, 1: 联赛, 2: 主队, 3: 客队, 4: 比赛状态, 5: 竞彩编号, 6: 北单编号,
  // 7: 竞彩让球, 8: 北单让球, 9: 胜, 10: 平, 11: 负, 12: 投注主队胜率, 13: 投注客队胜率, 14: 胆
  const mergeColumns = [0, 1, 2, 3, 4, 14];

  if (mergeColumns.includes(columnIndex)) {
    if (row.isFirstRow && row.rowSpan > 1) {
      return {
        rowspan: row.rowSpan,
        colspan: 1
      };
    } else if (!row.isFirstRow) {
      return {
        rowspan: 0,
        colspan: 0
      };
    }
  }

  return {
    rowspan: 1,
    colspan: 1
  };
};

/**
 * 获取行的唯一标识
 */
const getRowKey = (row: TableRowData) => {
  return `${row.matchId}_${row.betting_id || "no_betting"}`;
};
</script>

<style lang="scss" scoped>
.table-container {
  :deep(.el-table) {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  // 合并单元格表格样式
  .merged-table {
    :deep(.el-table__body) {
      .el-table__row {
        &:hover {
          background-color: #f5f7fa;
        }
      }
    }

    // 合并单元格边框处理
    :deep(.el-table__cell) {
      border-right: 1px solid #ebeef5;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

// 状态标签样式
:deep(.el-tag) {
  font-weight: 500;
}

// 按钮组样式
:deep(.el-button-group) {
  .el-button {
    padding: 5px 8px;
    font-size: 12px;
  }
}

// 胜平负操作单元格样式
.odds-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .odds-value {
    font-weight: 600;
    color: #303133;
  }

  .recommend-btn {
    width: 60px;
    padding: 2px 8px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -22px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      white-space: nowrap;
      z-index: 10;
    }
  }
}

// 可编辑单元格样式
.editable-cell {
  display: flex;
  align-items: center;
  gap: 4px;

  .editing-state {
    display: flex;
    align-items: center;
    gap: 4px;

    :deep(.el-input-number) {
      width: 100px;

      .el-input__inner {
        text-align: center;
        padding: 0 8px;
      }
    }

    .percentage {
      color: #909399;
      font-size: 12px;
    }
  }

  .display-state {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    width: 100%;

    &:hover {
      background-color: #f5f7fa;

      .edit-icon {
        opacity: 1;
      }
    }

    .rate-value {
      font-weight: 500;
      color: #303133;
    }

    .edit-icon {
      font-size: 12px;
      color: #909399;
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  :deep(.el-input-number) {
    width: 80px;

    .el-input__inner {
      text-align: center;
      padding: 0 8px;
    }
  }

  .percentage {
    color: #909399;
    font-size: 12px;
  }
}

// 胆推荐单元格样式
.bold-recommendation-cell {
  padding: 4px 0;

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;

    .el-radio-button {
      margin-bottom: 4px;

      &:first-child .el-radio-button__inner {
        border-radius: 4px 0 0 4px;
      }

      &:last-child .el-radio-button__inner {
        border-radius: 0 4px 4px 0;
      }

      .el-radio-button__inner {
        padding: 6px 8px;
        font-size: 11px;
        line-height: 1;
      }

      &.is-active {
        .el-radio-button__inner {
          // 设置选中的样式
          background-color: #67c23a;
          border-color: #67c23a;
          box-shadow: -1px 0 0 0 #67c23a;
        }
      }
    }
  }
}

// 多选推荐结果样式
.recommended-results {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .result-tag {
    margin-right: 2px;
  }
}
</style>
