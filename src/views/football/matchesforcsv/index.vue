<template>
  <div class="matches-container">
    <div class="header-section">
      <h1>赛事安排</h1>
      <div class="header-buttons">
        <el-upload
          ref="uploadRef"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :before-upload="beforeUpload"
          :on-success="onUploadSuccess"
          :on-error="onUploadError"
          :show-file-list="false"
          accept=".csv,.xlsx,.xls"
        >
          <el-button type="success" :loading="uploading">
            <el-icon>
              <Upload />
            </el-icon>
            {{ uploading ? "上传中..." : "上传CSV文件" }}
          </el-button>
        </el-upload>
      </div>
    </div>

    <!-- 过滤区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="联赛">
          <el-select
            v-model="filterForm.league"
            placeholder="选择或输入联赛"
            clearable
            filterable
            allow-create
            default-first-option
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

        <el-form-item label="导入状态">
          <el-select
            v-model="filterForm.status"
            placeholder="选择导入状态"
            clearable
            style="width: 150px"
          >
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="处理中" value="processing" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="球队">
          <el-select
            v-model="filterForm.team"
            placeholder="选择或输入球队"
            clearable
            filterable
            allow-create
            default-first-option
            style="width: 200px"
          >
            <el-option
              v-for="team in teamOptions"
              :key="team.id"
              :label="team.name"
              :value="team.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 导入记录列表 -->
    <div class="table-container">
      <el-table
        v-loading="importLoading"
        :data="filteredImportRecords"
        border
        stripe
        style="width: 100%"
        class="with-shadow"
      >
        <!-- 竞彩编号 -->
        <el-table-column label="竞彩编号" prop="jingcai_number" width="100" />
        <!-- 北单编号 -->
        <el-table-column label="北单编号" prop="beidan_number" width="100" />
        <!-- 开赛时间 -->
        <el-table-column
          label="开赛时间"
          prop="match_time"
          width="140"
          sortable
        />
        <!-- 赛事 -->
        <el-table-column label="赛事" prop="league" width="120" />
        <!-- 主队 -->
        <el-table-column label="主队" prop="home_team" width="120" />
        <!-- 客队 -->
        <el-table-column label="客队" prop="away_team" width="120" />
        <!-- 北单让球 -->
        <el-table-column label="北单让球" prop="beidan_handicap" width="100">
          <template #default="{ row }">
            {{ row.beidan_handicap !== null ? row.beidan_handicap : "-" }}
          </template>
        </el-table-column>
        <!-- 竞彩让球 -->
        <el-table-column label="竞彩让球" prop="jingcai_handicap" width="100">
          <template #default="{ row }">
            {{ row.jingcai_handicap !== null ? row.jingcai_handicap : "-" }}
          </template>
        </el-table-column>
        <!-- 胜 -->
        <el-table-column label="胜" prop="win" width="80">
          <template #default="{ row }">
            {{ row.win !== null ? row.win : "-" }}
          </template>
        </el-table-column>
        <!-- 平 -->
        <el-table-column label="平" prop="draw" width="80">
          <template #default="{ row }">
            {{ row.draw !== null ? row.draw : "-" }}
          </template>
        </el-table-column>
        <!-- 负 -->
        <el-table-column label="负" prop="lose" width="80">
          <template #default="{ row }">
            {{ row.lose !== null ? row.lose : "-" }}
          </template>
        </el-table-column>
        <!-- 主队额外信息 -->
        <el-table-column label="主队" prop="home_extra" width="100">
          <template #default="{ row }">
            {{ row.home_extra || "-" }}
          </template>
        </el-table-column>
        <!-- 客队额外信息 -->
        <el-table-column label="客队" prop="away_extra" width="100">
          <template #default="{ row }">
            {{ row.away_extra || "-" }}
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="info" size="small" @click="handleTeamInfo(row)"
                >球队信息引入</el-button
              >
              <el-button
                type="primary"
                size="small"
                @click="handlePushMatch(row)"
                >推送赛事安排</el-button
              >
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  ElMessage,
  ElMessageBox,
  ElLoading,
  FormInstance,
  UploadInstance
} from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import axios from "axios";
// 导入联赛数据
import leaguesData from "@/config/leagues.json";
import {
  getTeamNames,
  createTeam,
  getTeams,
  createMatch
} from "@/api/football";
import { Match, Team, ImportRecord, Pagination } from "./types";

// 状态变量
const loading = ref(false);
const matches = ref<Match[]>([]);
const dialogVisible = ref(false);
const uploading = ref(false);
const uploadRef = ref<UploadInstance>();
const importDialogVisible = ref(false);
const importRecords = ref<ImportRecord[]>([]);
const importLoading = ref(false);
const dialogType = ref<"add" | "edit">("add");
const matchFormRef = ref<FormInstance>();
const scoreDialogVisible = ref(false);

// 分页相关状态
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasPrevious: false,
  hasNext: false
});

// 球队选项
const teamOptions = ref<any[]>([]);

// 联赛选项
const leagueOptions = ref(leaguesData.leagues);

// 上传配置
const uploadUrl = "/api/match-imports/upload";
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`
  // 移除Content-Type，让axios自动设置boundary
  // "Content-Type": "multipart/form-data"
};

// 表单数据 - 添加league字段
const matchForm = reactive<{
  id?: number;
  home_team: string;
  away_team: string;
  home_team_id: number | null;
  away_team_id: number | null;
  date: string;
  score_home: number | null;
  score_away: number | null;
  stadium: string;
  status: "未开始" | "进行中" | "已结束";
  league: string; // 添加联赛字段
}>({
  home_team: "",
  away_team: "",
  home_team_id: null,
  away_team_id: null,
  date: "",
  score_home: null,
  score_away: null,
  stadium: "",
  status: "未开始",
  league: "" // 添加联赛字段默认值
});

// 比分更新表单
const scoreForm = reactive({
  id: 0,
  home_team: "",
  away_team: "",
  score_home: 0,
  score_away: 0
});

// 过滤条件 - 添加league字段
const filterForm = reactive({
  team: "",
  status: "",
  dateRange: [] as string[],
  league: "" // 添加联赛筛选
});

// 过滤后的导入记录列表
const filteredImportRecords = computed(() => {
  let result = [...importRecords.value];

  // 按联赛过滤
  if (filterForm.league) {
    result = result.filter(record => record.league === filterForm.league);
  }

  // 按球队过滤
  if (filterForm.team) {
    result = result.filter(
      record =>
        record.home_team === filterForm.team ||
        record.away_team === filterForm.team
    );
  }

  // 按状态过滤（这里改为按导入状态过滤）
  if (filterForm.status) {
    result = result.filter(
      record => record.import_status === filterForm.status
    );
  }

  // 按日期范围过滤（这里改为按比赛时间过滤）
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = new Date(filterForm.dateRange[0]).getTime();
    const endDate = new Date(filterForm.dateRange[1]).getTime();

    result = result.filter(record => {
      const matchDate = new Date(record.match_time.replace(" ", "T")).getTime();
      return matchDate >= startDate && matchDate <= endDate;
    });
  }

  return result;
});

// =================================
// 引入球队信息
const handleTeamInfo = async (row: any) => {
  try {
    // 获取列表中的球队信息，添加到球队列表中,包括联赛
    console.log("处理球队信息:", row);
    const { home_team, away_team, league, match_time } = row;

    // 显示处理中提示
    const loadingInstance = ElLoading.service({
      text: "正在处理球队信息...",
      background: "rgba(0, 0, 0, 0.7)"
    });

    // 处理主队信息
    try {
      // 获取主队LOGO
      const homeTeamResponse = await getTeamNames({ search: home_team });
      const homeTeamLogo = homeTeamResponse?.data?.[0]?.staticUrl || "";

      // 创建主队
      await createTeam({
        name: home_team,
        coach: "-",
        stadium: "-",
        league: league || "未知联赛",
        // 日期切掉时分秒
        established_at: match_time.slice(0, 10),
        logo_url: homeTeamLogo
      });

      console.log(`主队 ${home_team} 创建成功`);
      ElMessage.success(`主队 ${home_team} 创建成功`);
    } catch (error: any) {
      // 如果是已存在的错误，显示提示但继续处理
      if (error.response?.data?.message?.includes("already exists")) {
        console.warn(`主队 ${home_team} 已存在，跳过创建`);
        ElMessage.warning(`主队 ${home_team} 已存在，跳过创建`);
      } else {
        console.error(`创建主队 ${home_team} 失败1:`, error.message);
        ElMessage.error(
          `创建主队 ${home_team} 失败2: ${error.response.data.message || "未知错误"}`
        );
      }
    }

    // 处理客队信息
    try {
      // 获取客队LOGO
      const awayTeamResponse = await getTeamNames({ search: away_team });
      const awayTeamLogo = awayTeamResponse?.data?.[0]?.staticUrl || "";

      // 创建客队
      await createTeam({
        name: away_team,
        coach: "-",
        stadium: "-",
        league: league || "未知联赛",
        // 日期切掉时分秒
        established_at: match_time.slice(0, 10),
        logo_url: awayTeamLogo
      });

      console.log(`客队 ${away_team} 创建成功`);
      ElMessage.success(`客队 ${away_team} 创建成功`);
    } catch (error: any) {
      // 如果是已存在的错误，显示提示但继续处理
      if (error.response?.data?.message?.includes("already exists")) {
        console.warn(`客队 ${away_team} 已存在，跳过创建`);
        ElMessage.warning(`客队 ${away_team} 已存在，跳过创建`);
      } else {
        console.error(`创建客队 ${away_team} 失败:`, error);
        ElMessage.error(
          `创建客队 ${away_team} 失败: ${error.response.data.message || "未知错误"}`
        );
      }
    }

    // 关闭加载提示
    loadingInstance.close();

    // 刷新球队列表
    fetchTeams();

    ElMessage.success("球队信息处理完成");
  } catch (error: any) {
    console.error("处理球队信息失败:", error);
    ElMessage.error(`处理球队信息失败: ${error.message || "未知错误"}`);
  }
};

// =================================

/**
 * 推送赛事安排
 * @param row 赛事数据行
 */
const handlePushMatch = async (row: any) => {
  // 显示处理中提示
  const loadingInstance = ElLoading.service({
    text: "正在推送赛事安排...",
    background: "rgba(0, 0, 0, 0.7)"
  });
  try {
    // 获取赛事信息
    console.log("推送赛事安排:", row);
    const { home_team, away_team, league, match_time, stadium = "-" } = row;

    // 格式化比赛时间
    let formattedDate = match_time;
    // 检查时间格式，如果需要格式化
    if (
      match_time &&
      !match_time.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    ) {
      // 处理可能的格式，例如 "2025-06-11 09-30"
      formattedDate = match_time.replace(/-/g, (match, offset) => {
        // 只替换时间部分的连字符
        return offset > 10 ? ":" : "-";
      });
      // 确保有秒数
      if (!formattedDate.match(/:\d{2}$/)) {
        formattedDate += ":00";
      }
    }

    // 获取主队ID
    const homeTeamResponse = await getTeams({
      search: home_team,
      sortBy: "name",
      limit: 1,
      page: 1
    });
    const homeTeamId = homeTeamResponse?.data?.[0]?.id;
    if (!homeTeamId) {
      throw new Error(`未找到主队 ${home_team} 的ID`);
    }

    // 获取客队ID
    const awayTeamResponse = await getTeams({
      search: away_team,
      sortBy: "name",
      limit: 1,
      page: 1
    });
    const awayTeamId = awayTeamResponse?.data?.[0]?.id;
    if (!awayTeamId) {
      throw new Error(`未找到客队 ${away_team} 的ID`);
    }

    // 创建比赛
    await createMatch({
      home_team: homeTeamId,
      away_team: awayTeamId,
      date: formattedDate,
      stadium: stadium || "-",
      status: "未开始",
      league: league || "未知联赛",
      importID: row.id
    });

    // 关闭加载提示
    loadingInstance.close();

    ElMessage.success(`赛事 ${home_team} vs ${away_team} 推送成功`);
  } catch (error: any) {
    console.error("推送赛事安排失败:", error);
    // 关闭加载提示
    // ✅ 无论成功失败，都需要关闭 loading
    if (loadingInstance) loadingInstance.close();
    ElMessage.error(
      `推送赛事安排失败: ${error.response.data.message || "未知错误"}`
    );
  }
};

// 生命周期
onMounted(() => {
  fetchImportRecords();
  fetchTeams();
});

// 获取比赛列表
const fetchMatches = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/api/matches");
    matches.value = response.data.matches;

    // 如果API返回的数据没有league字段，为每个比赛添加默认联赛
    matches.value.forEach(match => {
      if (!match.league) {
        match.league = "中超"; // 默认联赛
      }
    });
  } catch (error) {
    console.error("获取比赛列表失败:", error);
    ElMessage.error("获取比赛列表失败");

    // 模拟数据
    matches.value = [
      {
        id: 1,
        home_team: "泰山金钢",
        away_team: "广州城",
        date: "2025-05-26 11:00:00",
        score_home: null,
        score_away: null,
        stadium: "泰山体育场",
        status: "未开始",
        league: "中超"
      },
      {
        id: 2,
        home_team: "上海港",
        away_team: "北京国安",
        date: "2025-05-27 19:30:00",
        score_home: 2,
        score_away: 1,
        stadium: "上海体育场",
        status: "进行中",
        league: "中超"
      },
      {
        id: 3,
        home_team: "武汉三镇",
        away_team: "大连人",
        date: "2025-05-25 15:00:00",
        score_home: 3,
        score_away: 0,
        stadium: "武汉体育中心",
        status: "已结束",
        league: "中超"
      }
    ];
  } finally {
    loading.value = false;
  }
};

// 获取球队列表
const fetchTeams = async () => {
  try {
    const response = await axios.get("/api/teams/all");
    // 直接使用完整的球队对象数组
    teamOptions.value = response.data.teams;
  } catch (error) {
    console.error("获取球队列表失败:", error);
    ElMessage.error("获取球队列表失败");

    // 模拟数据（仅在API调用失败时使用）
    teamOptions.value = [
      { id: 1, name: "泰山金钢", stadium: "泰山体育场" },
      { id: 2, name: "广州城", stadium: "天河体育场" },
      { id: 3, name: "上海港", stadium: "浦东足球场" },
      { id: 4, name: "北京国安", stadium: "工人体育场" },
      { id: 5, name: "武汉三镇", stadium: "武汉体育中心" },
      { id: 6, name: "大连人", stadium: "大连体育场" },
      { id: 7, name: "成都蓉城", stadium: "成都体育中心" },
      { id: 8, name: "长春亚泰", stadium: "长春体育场" }
    ];
  }
};

// 重置表单
const resetMatchForm = () => {
  matchForm.id = undefined;
  matchForm.home_team = "";
  matchForm.away_team = "";
  matchForm.home_team_id = null;
  matchForm.away_team_id = null;
  matchForm.date = "";
  matchForm.score_home = null;
  matchForm.score_away = null;
  matchForm.stadium = "";
  matchForm.status = "未开始";
  matchForm.league = "";
};

// 添加比赛
const handleAddMatch = () => {
  dialogType.value = "add";
  resetMatchForm();
  dialogVisible.value = true;
};

// 编辑比赛
const handleEditMatch = (row: Match) => {
  dialogType.value = "edit";
  matchForm.id = row.id;

  // 设置名称和联赛
  matchForm.home_team = row.home_team;
  matchForm.away_team = row.away_team;
  matchForm.league = row.league || "";

  // 找到对应的球队ID
  const homeTeam = teamOptions.value.find(team => team.name === row.home_team);
  const awayTeam = teamOptions.value.find(team => team.name === row.away_team);

  matchForm.home_team_id = homeTeam ? homeTeam.id : null;
  matchForm.away_team_id = awayTeam ? awayTeam.id : null;

  matchForm.date = row.date;
  matchForm.score_home = row.score_home;
  matchForm.score_away = row.score_away;
  matchForm.stadium = row.stadium;
  matchForm.status = row.status;
  dialogVisible.value = true;
};

// 开始比赛
const handleStartMatch = async (row: Match) => {
  try {
    // await axios.patch(`/api/matches/${row.id}/start`);

    // 模拟更新
    const index = matches.value.findIndex(match => match.id === row.id);
    if (index !== -1) {
      matches.value[index].status = "进行中";
      matches.value[index].score_home = 0;
      matches.value[index].score_away = 0;
    }
    ElMessage.success("比赛已开始");
  } catch (error) {
    console.error("开始比赛失败:", error);
    ElMessage.error("开始比赛失败");
  }
};

// 更新比分
const handleUpdateScore = (row: Match) => {
  scoreForm.id = row.id;
  scoreForm.home_team = row.home_team;
  scoreForm.away_team = row.away_team;
  scoreForm.score_home = row.score_home || 0;
  scoreForm.score_away = row.score_away || 0;
  scoreDialogVisible.value = true;
};

// 提交比分更新
const submitScoreUpdate = async () => {
  try {
    // await axios.patch(`/api/matches/${scoreForm.id}/score`, {
    //   score_home: scoreForm.score_home,
    //   score_away: scoreForm.score_away
    // });

    // 模拟更新
    const index = matches.value.findIndex(match => match.id === scoreForm.id);
    if (index !== -1) {
      matches.value[index].score_home = scoreForm.score_home;
      matches.value[index].score_away = scoreForm.score_away;
    }

    scoreDialogVisible.value = false;
    ElMessage.success("比分已更新");
  } catch (error) {
    console.error("更新比分失败:", error);
    ElMessage.error("更新比分失败");
  }
};

// 结束比赛
const handleFinishMatch = async (row: Match) => {
  try {
    // await axios.patch(`/api/matches/${row.id}/finish`);

    // 模拟更新
    const index = matches.value.findIndex(match => match.id === row.id);
    if (index !== -1) {
      matches.value[index].status = "已结束";
    }
    ElMessage.success("比赛已结束");
  } catch (error) {
    console.error("结束比赛失败:", error);
    ElMessage.error("结束比赛失败");
  }
};

// 删除比赛
const handleDeleteMatch = (row: Match) => {
  ElMessageBox.confirm(
    `确定要删除${row.home_team} vs ${row.away_team}的比赛吗?`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      try {
        await axios.delete(`/api/matches/${row.id}`);

        // 模拟删除
        matches.value = matches.value.filter(match => match.id !== row.id);
        ElMessage.success("删除成功");
      } catch (error) {
        console.error("删除失败:", error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 筛选
const handleFilter = () => {
  // 筛选时重置分页到第一页
  pagination.page = 1;
  fetchImportRecords(1, pagination.limit);
  console.log("筛选条件:", filterForm);
};

// 重置筛选
const resetFilter = () => {
  filterForm.team = "";
  filterForm.status = "";
  filterForm.dateRange = [];
  filterForm.league = "";
  // 重置筛选时也重置分页
  pagination.page = 1;
  fetchImportRecords(1, pagination.limit);
};

// 上传相关方法
/**
 * 上传前的验证
 * @param file 上传的文件
 * @returns 是否允许上传
 */
const beforeUpload = (file: File) => {
  const isValidType = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ].includes(file.type);
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isValidType) {
    ElMessage.error("只能上传 CSV、XLS、XLSX 格式的文件!");
    return false;
  }
  if (!isLt10M) {
    ElMessage.error("上传文件大小不能超过 10MB!");
    return false;
  }

  uploading.value = true;
  return true;
};

/**
 * 上传成功回调
 * @param response 服务器响应
 */
const onUploadSuccess = (response: any) => {
  uploading.value = false;
  ElMessage.success("文件上传成功!");
  // 刷新比赛列表
  fetchMatches();
  // 刷新导入记录
  fetchImportRecords();
};

/**
 * 上传失败回调
 * @param error 错误信息
 */
const onUploadError = (error: any) => {
  uploading.value = false;
  console.error("上传失败:", error);
  ElMessage.error("文件上传失败，请重试!");
};

/**
 * 查看导入记录
 */
const handleViewImports = () => {
  importDialogVisible.value = true;
  fetchImportRecords();
};

/**
 * 获取导入记录列表
 * @param page 页码
 * @param limit 每页数量
 */
const fetchImportRecords = async (
  page: number = pagination.page,
  limit: number = pagination.limit
) => {
  importLoading.value = true;
  try {
    const response = await axios.get("/api/match-imports", {
      params: { page, limit }
    });

    importRecords.value = response.data.data || [];

    // 更新分页信息
    if (response.data.meta) {
      pagination.page = response.data.meta.page;
      pagination.limit = response.data.meta.limit;
      pagination.total = response.data.meta.total;
      pagination.totalPages = response.data.meta.totalPages;
      pagination.hasPrevious = response.data.meta.hasPrevious;
      pagination.hasNext = response.data.meta.hasNext;
    }
  } catch (error) {
    console.error("获取导入记录失败:", error);
    ElMessage.error("获取导入记录失败");

    // 模拟分页数据
    pagination.page = 1;
    pagination.limit = 10;
    pagination.total = 18;
    pagination.totalPages = 2;
    pagination.hasPrevious = false;
    pagination.hasNext = true;
  } finally {
    importLoading.value = false;
  }
};

/**
 * 格式化导入状态
 * @param status 状态值
 * @returns 格式化后的状态
 */
const getImportStatusType = (status: string) => {
  switch (status) {
    case "success":
      return "success";
    case "failed":
      return "danger";
    case "processing":
      return "warning";
    default:
      return "info";
  }
};

/**
 * 格式化导入状态文本
 * @param status 状态值
 * @returns 状态文本
 */
const getImportStatusText = (status: string) => {
  switch (status) {
    case "success":
      return "成功";
    case "failed":
      return "失败";
    case "processing":
      return "处理中";
    default:
      return "未知";
  }
};

/**
 * 处理每页数量变化
 * @param size 新的每页数量
 */
const handleSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1; // 重置到第一页
  fetchImportRecords(1, size);
};

/**
 * 处理页码变化
 * @param page 新的页码
 */
const handleCurrentChange = (page: number) => {
  pagination.page = page;
  fetchImportRecords(page, pagination.limit);
};
</script>

<style lang="scss" scoped>
.matches-container {
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

  .filter-section {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .table-container {
    :deep(.el-table) {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }

    .pending-score {
      color: #909399;
      font-style: italic;
    }
  }

  .score-update-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 20px 0;

    .team-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      .team-name {
        font-weight: bold;
        margin-bottom: 5px;
      }
    }

    .score-separator {
      font-size: 24px;
      font-weight: bold;
      margin: 0 15px;
    }
  }

  // 导入记录对话框样式
  :deep(.el-dialog) {
    .file-name-text {
      display: inline-block;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }

    .analysis-doc-text {
      display: inline-block;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 20px 0;
  }
}
</style>
