import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type {
  MatchRecommendation,
  TableRowData,
  Pagination,
  FilterForm
} from "../types";
import {
  fetchMatchRecommendations as apiFetchRecommendations,
  updateBettingDetail,
  createBettingDetail,
  confirmRecommendation,
  deleteBettingDetail,
  deleteMatchRecommendation,
  updateBoldRecommendation,
  getMockData
} from "../api";

export function useRecommendations() {
  const loading = ref(false);
  const recommendations = ref<MatchRecommendation[]>([]);
  const tableData = ref<TableRowData[]>([]);

  // 分页相关状态
  const pagination = reactive<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false
  });

  // 过滤条件
  const filterForm = reactive<FilterForm>({
    league: "",
    status: "",
    dateRange: [],
    team: ""
  });

  /**
   * 获取赛事推荐列表
   */
  const fetchRecommendations = async (
    page: number = pagination.page,
    limit: number = pagination.limit
  ) => {
    loading.value = true;
    try {
      const response = await apiFetchRecommendations(page, limit);

      recommendations.value = response.data || [];

      // 更新分页信息
      pagination.page = response.page;
      pagination.limit = response.limit;
      pagination.total = response.total;
      pagination.totalPages = Math.ceil(response.total / response.limit);
      pagination.hasPrevious = response.page > 1;
      pagination.hasNext = response.page < pagination.totalPages;

      // 转换数据为表格显示格式
      convertToTableData();
    } catch {
      ElMessage.error("获取赛事推荐列表失败");

      // 使用模拟数据
      recommendations.value = getMockData();
      pagination.total = recommendations.value.length;
      pagination.totalPages = 1;
      convertToTableData();
    } finally {
      loading.value = false;
    }
  };

  /**
   * 将推荐数据转换为表格显示格式（扁平化并支持合并单元格）
   */
  const convertToTableData = () => {
    const result: TableRowData[] = [];

    recommendations.value.forEach(match => {
      if (match.betting_details && match.betting_details.length > 0) {
        // 有投注详情的情况
        match.betting_details.forEach((betting, index) => {
          const row: TableRowData = {
            // 比赛基本信息
            matchId: match.id,
            match_time: match.match_time,
            league: match.league,
            home_team: match.home_team,
            away_team: match.away_team,
            home_win_rate: match.home_win_rate,
            away_win_rate: match.away_win_rate,
            match_status: match.status,
            match_notes: match.notes,
            bold_recommendation: match.bold_recommendation,
            match_created_at: match.created_at,
            match_updated_at: match.updated_at,

            // 投注详情信息
            betting_id: betting.id,
            jingcai_number: betting.jingcai_number,
            beidan_number: betting.beidan_number,
            jingcai_handicap: betting.jingcai_handicap,
            beidan_handicap: betting.beidan_handicap,
            win: betting.win,
            draw: betting.draw,
            lose: betting.lose,
            betting_home_win_rate: betting.home_win_rate,
            betting_away_win_rate: betting.away_win_rate,
            recommended_result: betting.recommended_result,
            betting_status: betting.status,
            betting_notes: betting.notes,
            betting_created_at: betting.created_at,
            betting_updated_at: betting.updated_at,

            // 合并单元格标记
            isFirstRow: index === 0,
            rowSpan: index === 0 ? match.betting_details.length : 0
          };
          result.push(row);
        });
      } else {
        // 没有投注详情的情况
        const row: TableRowData = {
          matchId: match.id,
          match_time: match.match_time,
          league: match.league,
          home_team: match.home_team,
          away_team: match.away_team,
          home_win_rate: match.home_win_rate,
          away_win_rate: match.away_win_rate,
          match_status: match.status,
          match_notes: match.notes,
          bold_recommendation: match.bold_recommendation,
          match_created_at: match.created_at,
          match_updated_at: match.updated_at,
          isFirstRow: true,
          rowSpan: 1
        };
        result.push(row);
      }
    });

    tableData.value = result;
  };

  /**
   * 保存投注详情（编辑或新增）
   */
  const saveBettingDetail = async (formData: any) => {
    try {
      if (formData.id > 0) {
        // 编辑模式
        await updateBettingDetail(formData.id, {
          jingcai_number: formData.jingcai_number,
          beidan_number: formData.beidan_number,
          jingcai_handicap: formData.jingcai_handicap,
          beidan_handicap: formData.beidan_handicap,
          win: formData.win,
          draw: formData.draw,
          lose: formData.lose,
          home_win_rate: formData.home_win_rate,
          away_win_rate: formData.away_win_rate,
          recommended_result: formData.recommended_result,
          status: formData.status,
          notes: formData.notes
        });
        ElMessage.success("编辑成功");
      } else {
        // 新增模式
        await createBettingDetail(formData);
        ElMessage.success("添加成功");
      }
      await fetchRecommendations();
    } catch (error) {
      ElMessage.error(formData.id > 0 ? "编辑失败" : "添加失败");
      throw error;
    }
  };

  /**
   * 确认推荐
   */
  const handleConfirmRecommendation = async (row: TableRowData) => {
    if (!row.betting_id) return;

    try {
      await ElMessageBox.confirm(
        `确定要确认推荐 ${row.recommended_result} 吗？`,
        "确认推荐",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );

      await confirmRecommendation(row.betting_id);
      ElMessage.success("推荐确认成功");
      await fetchRecommendations();
    } catch (error) {
      if (error !== "cancel") {
        ElMessage.error("确认推荐失败");
      }
    }
  };

  /**
   * 删除投注详情
   */
  const handleDeleteBetting = async (row: TableRowData) => {
    if (!row.betting_id) return;

    try {
      await ElMessageBox.confirm("确定要删除这条投注详情吗？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      });

      await deleteBettingDetail(row.betting_id);
      ElMessage.success("删除成功");
      await fetchRecommendations();
    } catch (error) {
      if (error !== "cancel") {
        ElMessage.error("删除失败");
      }
    }
  };

  /**
   * 删除比赛推荐记录（主数据）
   */
  const handleDeleteMatch = async (row: TableRowData) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除 ${row.home_team} vs ${row.away_team} 的比赛推荐记录吗？\n删除后该比赛的所有投注详情都将被删除！`,
        "删除确认",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: false
        }
      );

      await deleteMatchRecommendation(row.matchId);
      ElMessage.success("删除成功");
      await fetchRecommendations();
    } catch (error) {
      if (error !== "cancel") {
        ElMessage.error("删除失败");
      }
    }
  };

  /**
   * 筛选
   */
  const handleFilter = () => {
    pagination.page = 1;
    fetchRecommendations(1, pagination.limit);
  };

  /**
   * 重置筛选
   */
  const resetFilter = () => {
    filterForm.league = "";
    filterForm.status = "";
    filterForm.dateRange = [];
    filterForm.team = "";
    pagination.page = 1;
    fetchRecommendations(1, pagination.limit);
  };

  /**
   * 处理每页数量变化
   */
  const handleSizeChange = (size: number) => {
    pagination.limit = size;
    pagination.page = 1;
    fetchRecommendations(1, size);
  };

  /**
   * 处理页码变化
   */
  const handleCurrentChange = (page: number) => {
    pagination.page = page;
    fetchRecommendations(page, pagination.limit);
  };

  /**
   * 处理推荐选择（支持多选）
   */
  const handleRecommend = async (row: TableRowData, result: string) => {
    if (!row.betting_id) return;

    try {
      let newRecommendedResult: string | string[];

      // 获取当前推荐结果
      const currentResult = row.recommended_result;

      if (
        !currentResult ||
        (Array.isArray(currentResult) && currentResult.length === 0)
      ) {
        // 如果没有推荐结果或之前是空数组，直接设置为数组
        newRecommendedResult = [result];
      } else if (Array.isArray(currentResult)) {
        // 如果是数组（多选状态）
        if (currentResult.includes(result)) {
          // 如果已包含该结果，则移除
          newRecommendedResult = currentResult.filter(r => r !== result);
          // 保持数组格式，即使是空数组
        } else {
          // 如果不包含该结果，则添加
          newRecommendedResult = [...currentResult, result];
        }
      } else {
        // 如果是字符串（单选状态）
        if (currentResult === result) {
          // 如果点击的是同一个，则取消推荐
          newRecommendedResult = []; // 取消时发送空数组
        } else {
          // 如果点击的是不同的，则变成多选
          newRecommendedResult = [currentResult, result];
        }
      }

      await updateBettingDetail(row.betting_id, {
        recommended_result: newRecommendedResult
      });

      const resultLabels: Record<string, string> = {
        win: "胜",
        draw: "平",
        lose: "负"
      };

      if (
        Array.isArray(newRecommendedResult) &&
        newRecommendedResult.length > 0
      ) {
        const labels = newRecommendedResult
          .map(r => resultLabels[r] || r)
          .join("、");
        ElMessage.success(`已推荐：${labels}`);
      } else if (
        typeof newRecommendedResult === "string" &&
        newRecommendedResult
      ) {
        ElMessage.success(
          `已推荐：${resultLabels[newRecommendedResult] || newRecommendedResult}`
        );
      } else {
        ElMessage.success("已取消推荐");
      }

      await fetchRecommendations();
    } catch {
      ElMessage.error("推荐失败");
    }
  };

  /**
   * 处理概率变化
   */
  const handleProbabilityChange = async (
    row: TableRowData,
    field: string,
    value: number
  ) => {
    if (!row.betting_id) return;

    try {
      const updateData: any = {};
      // 将百分比转换为小数
      updateData[field] = value / 100;

      await updateBettingDetail(row.betting_id, updateData);
      ElMessage.success("概率更新成功");
      await fetchRecommendations();
    } catch {
      ElMessage.error("概率更新失败");
    }
  };

  /**
   * 处理胆推荐变更
   */
  const handleBoldRecommendationChange = async (
    matchId: number,
    value: string
  ) => {
    if (!matchId) return;

    try {
      await updateBoldRecommendation(matchId, value);

      // 更新本地数据，避免重新拉取
      tableData.value.forEach(row => {
        if (row.matchId === matchId) {
          row.bold_recommendation = value;
        }
      });

      const labels: Record<string, string> = {
        none: "无推荐",
        recommend: "推荐",
        recommend_bold: "推荐胆",
        recommend_stable: "推荐稳胆"
      };

      ElMessage.success(`已将比赛设置为: ${labels[value]}`);
    } catch (error) {
      ElMessage.error("更新胆推荐失败");
      console.error(error);
    }
  };

  return {
    loading,
    recommendations,
    tableData,
    pagination,
    filterForm,
    fetchRecommendations,
    saveBettingDetail,
    handleConfirmRecommendation,
    handleDeleteBetting,
    handleDeleteMatch,
    handleRecommend,
    handleProbabilityChange,
    handleBoldRecommendationChange,
    handleFilter,
    resetFilter,
    handleSizeChange,
    handleCurrentChange
  };
}
