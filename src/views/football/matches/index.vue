<template>
  <div class="matches-container">
    <div class="header-section">
      <h1>赛事安排</h1>
      <el-button type="primary" @click="handleAddMatch">创建新比赛</el-button>
    </div>

    <!-- 过滤区域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="联赛">
          <el-select
            v-model="filterForm.league"
            placeholder="选择联赛"
            clearable
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
            v-model="filterForm.status"
            placeholder="选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="未开始" value="未开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
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
            placeholder="选择球队"
            clearable
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

    <!-- 比赛列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="filteredMatches"
        border
        stripe
        style="width: 100%"
        class="with-shadow"
      >
        <el-table-column label="ID" prop="id" width="60" />
        <el-table-column label="日期时间" prop="date" sortable />
        <!-- 所属联赛 -->
        <el-table-column label="所属联赛" prop="league" width="120">
          <template #default="{ row }">
            <span>{{ row.league || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="主队" prop="home_team">
          <template #default="{ row }">
            <span>{{ row.homeTeam.name || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="比分" width="100">
          <template #default="{ row }">
            <template v-if="row.score_home !== null && row.score_away !== null">
              {{ row.score_home }} - {{ row.score_away }}
            </template>
            <template v-else>
              <span class="pending-score">-- : --</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="客队" prop="away_team">
          <template #default="{ row }">
            <span>{{ row.awayTeam.name || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="场地" prop="stadium" />
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                size="small"
                @click="handleEditMatch(row)"
                >编辑</el-button
              >
              <el-button
                v-if="row.status === '未开始'"
                type="success"
                size="small"
                @click="handleStartMatch(row)"
                >开始比赛</el-button
              >
              <el-button
                v-if="row.status === '进行中'"
                type="info"
                size="small"
                @click="handleUpdateScore(row)"
                >更新比分</el-button
              >
              <el-button
                v-if="row.status === '进行中'"
                type="warning"
                size="small"
                @click="handleFinishMatch(row)"
                >结束比赛</el-button
              >
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteMatch(row)"
                >删除</el-button
              >
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建/编辑比赛对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '创建新比赛' : '编辑比赛信息'"
      width="600px"
    >
      <el-form
        ref="matchFormRef"
        :model="matchForm"
        :rules="matchFormRules"
        label-width="100px"
      >
        <!-- 添加联赛选择 -->
        <el-form-item label="联赛" prop="league">
          <el-select
            v-model="matchForm.league"
            placeholder="选择联赛"
            style="width: 100%"
          >
            <el-option
              v-for="league in leagueOptions"
              :key="league.abbreviation"
              :label="league.abbreviation"
              :value="league.abbreviation"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="主队" prop="home_team_id">
          <el-select
            v-model="matchForm.home_team_id"
            placeholder="选择主队"
            style="width: 100%"
          >
            <el-option
              v-for="team in teamOptions"
              :key="`home_${team.id}`"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客队" prop="away_team_id">
          <el-select
            v-model="matchForm.away_team_id"
            placeholder="选择客队"
            style="width: 100%"
          >
            <el-option
              v-for="team in teamOptions.filter(
                t => t.name !== matchForm.home_team
              )"
              :key="`away_${team.id}`"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="比赛日期" prop="date">
          <el-date-picker
            v-model="matchForm.date"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="比赛场地" prop="stadium">
          <el-input v-model="matchForm.stadium" placeholder="输入比赛场地" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="matchForm.status"
            placeholder="选择状态"
            style="width: 100%"
          >
            <el-option label="未开始" value="未开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
        <template v-if="matchForm.status !== '未开始'">
          <el-form-item label="主队比分" prop="score_home">
            <el-input-number
              v-model="matchForm.score_home"
              :min="0"
              :max="99"
            />
          </el-form-item>
          <el-form-item label="客队比分" prop="score_away">
            <el-input-number
              v-model="matchForm.score_away"
              :min="0"
              :max="99"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMatchForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 更新比分对话框 -->
    <el-dialog v-model="scoreDialogVisible" title="更新比分" width="400px">
      <el-form ref="scoreFormRef" :model="scoreForm" label-width="100px">
        <div class="score-update-container">
          <div class="team-score">
            <div class="team-name">{{ scoreForm.home_team }}</div>
            <el-input-number
              v-model="scoreForm.score_home"
              :min="0"
              :max="99"
            />
          </div>
          <div class="score-separator">:</div>
          <div class="team-score">
            <div class="team-name">{{ scoreForm.away_team }}</div>
            <el-input-number
              v-model="scoreForm.score_away"
              :min="0"
              :max="99"
            />
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="scoreDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitScoreUpdate">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import axios from "axios";
// 导入联赛数据
import leaguesData from "@/config/leagues.json";

// 类型定义 - 更新Match接口包含league字段
interface Match {
  id: number;
  home_team: string;
  away_team: string;
  date: string;
  score_home: number | null;
  score_away: number | null;
  stadium: string;
  status: "未开始" | "进行中" | "已结束";
  league: string; // 添加联赛字段
}

// 球队选项
interface Team {
  id: number;
  name: string;
  coach?: string;
  stadium?: string;
  league?: string;
  established_at?: string;
  logo_url?: string;
}

// 状态变量
const loading = ref(false);
const matches = ref<Match[]>([]);
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const matchFormRef = ref<FormInstance>();
const scoreDialogVisible = ref(false);

// 球队选项
const teamOptions = ref<any[]>([]);

// 联赛选项
const leagueOptions = ref(leaguesData.leagues);

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

// 表单验证规则 - 添加league字段验证
const matchFormRules = {
  league: [{ required: true, message: "请选择联赛", trigger: "change" }],
  home_team_id: [{ required: true, message: "请选择主队", trigger: "change" }],
  away_team_id: [{ required: true, message: "请选择客队", trigger: "change" }],
  date: [{ required: true, message: "请选择比赛日期时间", trigger: "change" }],
  stadium: [{ required: true, message: "请输入比赛场地", trigger: "blur" }],
  status: [{ required: true, message: "请选择比赛状态", trigger: "change" }]
};

// 过滤后的比赛列表 - 添加按联赛过滤
const filteredMatches = computed(() => {
  let result = [...matches.value];

  // 按联赛过滤
  if (filterForm.league) {
    result = result.filter(match => match.league === filterForm.league);
  }

  // 按球队过滤
  if (filterForm.team) {
    result = result.filter(
      match =>
        match.home_team === filterForm.team ||
        match.away_team === filterForm.team
    );
  }

  // 按状态过滤
  if (filterForm.status) {
    result = result.filter(match => match.status === filterForm.status);
  }

  // 按日期范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = new Date(filterForm.dateRange[0]).getTime();
    const endDate = new Date(filterForm.dateRange[1]).getTime();

    result = result.filter(match => {
      const matchDate = new Date(match.date).getTime();
      return matchDate >= startDate && matchDate <= endDate;
    });
  }

  return result;
});

// 根据状态获取标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case "未开始":
      return "info";
    case "进行中":
      return "success";
    case "已结束":
      return "";
    default:
      return "";
  }
};

// 生命周期
onMounted(() => {
  fetchMatches();
  fetchTeams();
});

// 获取比赛列表
const fetchMatches = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/api/matches/all");
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

// 提交比赛表单
const submitMatchForm = async () => {
  if (!matchFormRef.value) return;

  await matchFormRef.value.validate(async valid => {
    if (valid) {
      try {
        // 当主队和客队ID都有效时才继续
        if (!matchForm.home_team_id || !matchForm.away_team_id) {
          ElMessage.warning("请选择有效的主队和客队");
          return;
        }

        // 准备API提交数据
        const payload = {
          home_team: matchForm.home_team_id,
          away_team: matchForm.away_team_id,
          date: matchForm.date,
          stadium: matchForm.stadium,
          status: matchForm.status,
          league: matchForm.league // 添加联赛字段
        };

        if (matchForm.status !== "未开始") {
          payload.score_home = matchForm.score_home;
          payload.score_away = matchForm.score_away;
        }

        if (dialogType.value === "add") {
          // 添加比赛
          // const response = await axios.post('/api/matches', payload);

          // 找到对应的球队名称用于显示
          const homeTeam = teamOptions.value.find(
            t => t.id === matchForm.home_team_id
          );
          const awayTeam = teamOptions.value.find(
            t => t.id === matchForm.away_team_id
          );

          // 模拟添加
          const newMatch = {
            id: Math.max(...matches.value.map(m => m.id), 0) + 1,
            home_team: homeTeam ? homeTeam.name : "Unknown",
            away_team: awayTeam ? awayTeam.name : "Unknown",
            date: matchForm.date,
            score_home: matchForm.score_home,
            score_away: matchForm.score_away,
            stadium: matchForm.stadium,
            status: matchForm.status,
            league: matchForm.league
          };
          matches.value.push(newMatch);
          ElMessage.success("创建比赛成功");
        } else {
          // 编辑比赛代码类似，添加league字段...
          // ...
        }

        dialogVisible.value = false;
      } catch (error) {
        console.error("保存失败:", error);
        ElMessage.error("操作失败");
      }
    } else {
      return false;
    }
  });
};

// 筛选
const handleFilter = () => {
  // 已通过计算属性实现
};

// 重置筛选
const resetFilter = () => {
  filterForm.team = "";
  filterForm.status = "";
  filterForm.dateRange = [];
  filterForm.league = "";
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
}
</style>
