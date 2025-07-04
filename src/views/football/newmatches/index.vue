<template>
  <div class="new-matches-container">
    <div class="header-section">
      <h1>新赛事导入</h1>
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

    <!-- 新赛事记录列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="filteredMatchRecords"
        border
        stripe
        style="width: 100%"
        class="with-shadow"
        :expand-row-keys="expandedRows"
        row-key="id"
        @expand-change="handleExpandChange"
      >
        <!-- 展开行 -->
        <el-table-column type="expand" width="50">
          <template #default="{ row }">
            <div class="betting-details-container">
              <h4>投注详情 ({{ row.betting_count }}条)</h4>
              <el-table
                :data="row.bettingDetails"
                border
                size="small"
                style="margin: 10px 0"
              >
                <el-table-column
                  label="竞彩编号"
                  prop="jingcai_number"
                  width="100"
                />
                <el-table-column
                  label="北单编号"
                  prop="beidan_number"
                  width="100"
                />
                <el-table-column
                  label="竞彩让球"
                  prop="jingcai_handicap"
                  width="100"
                >
                  <template #default="{ row: detail }">
                    {{
                      detail.jingcai_handicap !== null
                        ? detail.jingcai_handicap
                        : "-"
                    }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="北单让球"
                  prop="beidan_handicap"
                  width="100"
                >
                  <template #default="{ row: detail }">
                    {{
                      detail.beidan_handicap !== null
                        ? detail.beidan_handicap
                        : "-"
                    }}
                  </template>
                </el-table-column>
                <el-table-column label="胜" prop="win" width="80">
                  <template #default="{ row: detail }">
                    {{ detail.win !== null ? detail.win : "-" }}
                  </template>
                </el-table-column>
                <el-table-column label="平" prop="draw" width="80">
                  <template #default="{ row: detail }">
                    {{ detail.draw !== null ? detail.draw : "-" }}
                  </template>
                </el-table-column>
                <el-table-column label="负" prop="lose" width="80">
                  <template #default="{ row: detail }">
                    {{ detail.lose !== null ? detail.lose : "-" }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="投注方案"
                  prop="betting_type_desc"
                  width="120"
                />
                <el-table-column label="排序" prop="sort_order" width="80" />
                <el-table-column label="备注" prop="remark" width="100">
                  <template #default="{ row: detail }">
                    {{ detail.remark || "-" }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <!-- 比赛时间 -->
        <el-table-column
          label="比赛时间"
          prop="match_time"
          width="140"
          sortable
        />

        <!-- 联赛 -->
        <el-table-column label="联赛" prop="league" width="120" />

        <!-- 主队 -->
        <el-table-column label="主队" prop="home_team" width="120" />

        <!-- 客队 -->
        <el-table-column label="客队" prop="away_team" width="120" />

        <!-- 比赛唯一标识 -->
        <el-table-column
          label="比赛标识"
          prop="match_unique_key"
          width="200"
          show-overflow-tooltip
        />

        <!-- 主队附加信息 -->
        <el-table-column label="主队附加" prop="home_extra" width="100">
          <template #default="{ row }">
            {{ row.home_extra || "-" }}
          </template>
        </el-table-column>

        <!-- 客队附加信息 -->
        <el-table-column label="客队附加" prop="away_extra" width="100">
          <template #default="{ row }">
            {{ row.away_extra || "-" }}
          </template>
        </el-table-column>

        <!-- 投注数量 -->
        <el-table-column label="投注数量" prop="betting_count" width="100" />

        <!-- 文件名 -->
        <el-table-column
          label="文件名"
          prop="file_name"
          width="150"
          show-overflow-tooltip
        />

        <!-- 导入状态 -->
        <el-table-column label="导入状态" prop="import_status" width="100">
          <template #default="{ row }">
            <el-tag :type="getImportStatusType(row.import_status)">
              {{ getImportStatusText(row.import_status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column
          label="创建时间"
          prop="created_at"
          width="160"
          sortable
        >
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="info" size="small" @click="handleTeamInfo(row)">
                球队信息引入
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="handleEditMatch(row)"
              >
                修改
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="handlePushMatch(row)"
              >
                推送赛事
              </el-button>
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

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑比赛记录"
      width="800px"
      :before-close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="比赛时间" prop="match_time">
              <el-date-picker
                v-model="editForm.match_time"
                type="datetime"
                placeholder="选择比赛时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联赛" prop="league">
              <el-select
                v-model="editForm.league"
                placeholder="选择联赛"
                filterable
                allow-create
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
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主队" prop="home_team">
              <el-input
                v-model="editForm.home_team"
                placeholder="请输入主队名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客队" prop="away_team">
              <el-input
                v-model="editForm.away_team"
                placeholder="请输入客队名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主队附加" prop="home_extra">
              <el-input
                v-model="editForm.home_extra"
                placeholder="主队附加信息"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客队附加" prop="away_extra">
              <el-input
                v-model="editForm.away_extra"
                placeholder="客队附加信息"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="比赛标识" prop="match_unique_key">
          <el-input
            v-model="editForm.match_unique_key"
            placeholder="比赛唯一标识"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="editLoading"
            @click="handleSaveEdit"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
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
  createMatch,
  createMatchRec
} from "@/api/football";
import {
  NewMatchRecord,
  BettingDetail,
  Pagination,
  FilterForm,
  Team
} from "./types";
import { de } from "element-plus/es/locale/index.mjs";

// 状态变量
const loading = ref(false);
const uploading = ref(false);
const editLoading = ref(false);
const uploadRef = ref<UploadInstance>();
const editFormRef = ref<FormInstance>();
const editDialogVisible = ref(false);
const expandedRows = ref<string[]>([]);

// 数据列表
const matchRecords = ref<NewMatchRecord[]>([]);
const teamOptions = ref<Team[]>([]);

// 联赛选项
const leagueOptions = ref(leaguesData.leagues);

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
  team: "",
  status: "",
  dateRange: [],
  league: ""
});

// 编辑表单
const editForm = reactive({
  id: 0,
  match_time: "",
  league: "",
  home_team: "",
  away_team: "",
  match_unique_key: "",
  home_extra: "",
  away_extra: ""
});

// 表单验证规则
const editFormRules = {
  match_time: [
    { required: true, message: "请选择比赛时间", trigger: "change" }
  ],
  league: [{ required: true, message: "请输入联赛名称", trigger: "blur" }],
  home_team: [{ required: true, message: "请输入主队名称", trigger: "blur" }],
  away_team: [{ required: true, message: "请输入客队名称", trigger: "blur" }]
};

// 上传配置
const uploadUrl = "/api/new-matches/upload";
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`
};

// 过滤后的赛事记录列表
const filteredMatchRecords = computed(() => {
  let result = [...matchRecords.value];

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

  // 按状态过滤
  if (filterForm.status) {
    result = result.filter(
      record => record.import_status === filterForm.status
    );
  }

  // 按日期范围过滤
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

// 生命周期
onMounted(() => {
  fetchMatchRecords();
  fetchTeams();
});

/**
 * 获取新赛事记录列表
 */
const fetchMatchRecords = async (
  page: number = pagination.page,
  limit: number = pagination.limit
) => {
  loading.value = true;
  try {
    const response = await axios.get("/api/new-matches", {
      params: { page, limit }
    });

    matchRecords.value = response.data.data || [];

    // 更新分页信息
    pagination.page = response.data.page;
    pagination.limit = response.data.limit;
    pagination.total = response.data.total;
    pagination.totalPages = Math.ceil(
      response.data.total / response.data.limit
    );
    pagination.hasPrevious = response.data.page > 1;
    pagination.hasNext = response.data.page < pagination.totalPages;
  } catch (error) {
    console.error("获取新赛事记录失败:", error);
    ElMessage.error("获取新赛事记录失败");

    // 模拟数据
    const mockData: NewMatchRecord[] = [
      {
        id: 1,
        match_time: "2025-07-15 20:00",
        league: "中超",
        home_team: "山东泰山",
        away_team: "上海海港",
        match_unique_key: "2025-07-15_中超_山东泰山_上海海港",
        home_extra: "主场优势",
        away_extra: "客场作战",
        file_name: "matches_2025_07_15.csv",
        import_status: "success",
        betting_count: 3,
        created_at: "2025-07-02T10:30:00Z",
        bettingDetails: [
          {
            jingcai_number: "001",
            beidan_number: "B001",
            jingcai_handicap: 0.5,
            beidan_handicap: 0,
            win: 1.85,
            draw: 3.2,
            lose: 4.5,
            betting_type_desc: "胜平负",
            sort_order: 1,
            remark: ""
          },
          {
            jingcai_number: "002",
            beidan_number: "B002",
            jingcai_handicap: -0.5,
            beidan_handicap: -1,
            win: 2.1,
            draw: 3.0,
            lose: 3.8,
            betting_type_desc: "让球胜平负",
            sort_order: 2,
            remark: ""
          }
        ]
      },
      {
        id: 2,
        match_time: "2025-07-16 19:30",
        league: "中超",
        home_team: "北京国安",
        away_team: "广州城",
        match_unique_key: "2025-07-16_中超_北京国安_广州城",
        home_extra: "",
        away_extra: "",
        file_name: "matches_2025_07_16.csv",
        import_status: "processing",
        betting_count: 2,
        created_at: "2025-07-02T11:00:00Z",
        bettingDetails: [
          {
            jingcai_number: "003",
            beidan_number: "B003",
            jingcai_handicap: 1,
            beidan_handicap: 0.5,
            win: 1.65,
            draw: 3.4,
            lose: 5.2,
            betting_type_desc: "胜平负",
            sort_order: 1,
            remark: ""
          }
        ]
      }
    ];

    matchRecords.value = mockData;
    pagination.total = mockData.length;
    pagination.totalPages = 1;
  } finally {
    loading.value = false;
  }
};

/**
 * 获取球队列表
 */
const fetchTeams = async () => {
  try {
    const response = await axios.get("/api/teams/all");
    teamOptions.value = response.data.teams || [];
  } catch (error) {
    console.error("获取球队列表失败:", error);
    ElMessage.error("获取球队列表失败");

    // 模拟数据
    teamOptions.value = [
      { id: 1, name: "山东泰山", stadium: "泰山体育场" },
      { id: 2, name: "上海海港", stadium: "浦东足球场" },
      { id: 3, name: "北京国安", stadium: "工人体育场" },
      { id: 4, name: "广州城", stadium: "天河体育场" }
    ];
  }
};

/**
 * 处理展开/收起行
 */
const handleExpandChange = (row: NewMatchRecord, expanded: boolean) => {
  const rowKey = row.id.toString();
  if (expanded) {
    if (!expandedRows.value.includes(rowKey)) {
      expandedRows.value.push(rowKey);
    }
  } else {
    const index = expandedRows.value.indexOf(rowKey);
    if (index > -1) {
      expandedRows.value.splice(index, 1);
    }
  }
};

/**
 * 处理球队信息引入
 */
const handleTeamInfo = async (row: NewMatchRecord) => {
  try {
    const { home_team, away_team, league, match_time } = row;

    const loadingInstance = ElLoading.service({
      text: "正在处理球队信息...",
      background: "rgba(0, 0, 0, 0.7)"
    });

    // 处理主队信息
    try {
      const homeTeamResponse = await getTeamNames({ search: home_team });
      const homeTeamLogo = homeTeamResponse?.data?.[0]?.logo_url || "";

      await createTeam({
        name: home_team,
        coach: "-",
        stadium: "-",
        league: league || "未知联赛",
        established_at: match_time.slice(0, 10),
        logo_url: homeTeamLogo
      });

      ElMessage.success(`主队 ${home_team} 创建成功`);
    } catch (error: any) {
      if (error.response?.data?.message?.includes("already exists")) {
        ElMessage.warning(`主队 ${home_team} 已存在，跳过创建`);
      } else {
        ElMessage.error(
          `创建主队 ${home_team} 失败: ${error.response?.data?.message || "未知错误"}`
        );
      }
    }

    // 处理客队信息
    try {
      const awayTeamResponse = await getTeamNames({ search: away_team });
      const awayTeamLogo = awayTeamResponse?.data?.[0]?.logo_url || "";

      await createTeam({
        name: away_team,
        coach: "-",
        stadium: "-",
        league: league || "未知联赛",
        established_at: match_time.slice(0, 10),
        logo_url: awayTeamLogo
      });

      ElMessage.success(`客队 ${away_team} 创建成功`);
    } catch (error: any) {
      if (error.response?.data?.message?.includes("already exists")) {
        ElMessage.warning(`客队 ${away_team} 已存在，跳过创建`);
      } else {
        ElMessage.error(
          `创建客队 ${away_team} 失败: ${error.response?.data?.message || "未知错误"}`
        );
      }
    }

    loadingInstance.close();
    fetchTeams();
    ElMessage.success("球队信息处理完成");
  } catch (error: any) {
    console.error("处理球队信息失败:", error);
    ElMessage.error(`处理球队信息失败: ${error.message || "未知错误"}`);
  }
};

/**
 * 处理编辑比赛
 */
const handleEditMatch = (row: NewMatchRecord) => {
  editForm.id = row.id;
  editForm.match_time = row.match_time;
  editForm.league = row.league;
  editForm.home_team = row.home_team;
  editForm.away_team = row.away_team;
  editForm.match_unique_key = row.match_unique_key;
  editForm.home_extra = row.home_extra;
  editForm.away_extra = row.away_extra;
  editDialogVisible.value = true;
};

/**
 * 保存编辑
 */
const handleSaveEdit = async () => {
  if (!editFormRef.value) return;

  try {
    await editFormRef.value.validate();
    editLoading.value = true;

    // 调用API更新数据
    await axios.put(`/api/new-matches/${editForm.id}`, {
      match_time: editForm.match_time,
      league: editForm.league,
      home_team: editForm.home_team,
      away_team: editForm.away_team,
      match_unique_key: editForm.match_unique_key,
      home_extra: editForm.home_extra,
      away_extra: editForm.away_extra
    });

    // 更新本地数据
    const index = matchRecords.value.findIndex(
      record => record.id === editForm.id
    );
    if (index > -1) {
      matchRecords.value[index] = {
        ...matchRecords.value[index],
        match_time: editForm.match_time,
        league: editForm.league,
        home_team: editForm.home_team,
        away_team: editForm.away_team,
        match_unique_key: editForm.match_unique_key,
        home_extra: editForm.home_extra,
        away_extra: editForm.away_extra
      };
    }

    editDialogVisible.value = false;
    ElMessage.success("编辑成功");
  } catch (error) {
    console.error("编辑失败:", error);
    ElMessage.error("编辑失败");
  } finally {
    editLoading.value = false;
  }
};

/**
 * 关闭编辑对话框
 */
const handleEditDialogClose = () => {
  editFormRef.value?.resetFields();
  editDialogVisible.value = false;
};

// 裁切函数
function transformRowToPayload(row) {
  return {
    match_time: row.match_time,
    league: row.league,
    home_team: row.home_team,
    away_team: row.away_team,
    // home_win_rate: 0.55, // 需要用户输入或你的逻辑生成
    // away_win_rate: 0.45,
    betting_details: (row.bettingDetails || []).map(item => ({
      jingcai_number: item.jingcai_number,
      beidan_number: item.beidan_number,
      jingcai_handicap: item.jingcai_handicap,
      beidan_handicap: item.beidan_handicap,
      win: item.win,
      draw: item.draw,
      lose: item.lose
    }))
  };
}

/**
 * 推送赛事安排
 */
const handlePushMatch = async (row: NewMatchRecord) => {
  const loadingInstance = ElLoading.service({
    text: "正在推送赛事安排...",
    background: "rgba(0, 0, 0, 0.7)"
  });

  try {
    const { home_team, away_team, league, match_time } = row;

    // 格式化比赛时间
    let formattedDate = match_time;
    if (
      match_time &&
      !match_time.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    ) {
      formattedDate = match_time.replace(/-/g, (match, offset) => {
        return offset > 10 ? ":" : "-";
      });
      if (!formattedDate.match(/:\d{2}$/)) {
        formattedDate += ":00";
      }
    }

    // 获取主队信息（包含队标）
    const homeTeamResponse = await getTeamNames({
      search: home_team,
      limit: 1,
      page: 1
    });
    console.log("主队API响应:", homeTeamResponse);
    const homeTeamData = homeTeamResponse?.data?.[0];
    if (!homeTeamData) {
      throw new Error(`未找到主队 ${home_team} 的信息`);
    }
    console.log("主队数据:", homeTeamData);

    // 获取客队信息（包含队标）
    const awayTeamResponse = await getTeamNames({
      search: away_team,
      limit: 1,
      page: 1
    });
    console.log("客队API响应:", awayTeamResponse);
    const awayTeamData = awayTeamResponse?.data?.[0];
    if (!awayTeamData) {
      throw new Error(`未找到客队 ${away_team} 的信息`);
    }
    console.log("客队数据:", awayTeamData);

    // 创建比赛数据，包含球队队标
    const home_team_logo =
      homeTeamData.logo_url || homeTeamData.staticUrl || "";
    const away_team_logo =
      awayTeamData.logo_url || awayTeamData.staticUrl || "";

    console.log("主队队标:", home_team_logo);
    console.log("客队队标:", away_team_logo);

    const matchData = {
      ...transformRowToPayload(row),
      home_team_logo,
      away_team_logo
    };

    console.log("最终推送数据:", matchData);

    await createMatchRec(matchData);

    loadingInstance.close();
    ElMessage.success(
      `赛事 ${home_team} vs ${away_team} 推送成功，已包含球队队标信息`
    );
  } catch (error: any) {
    console.error("推送赛事安排失败:", error);
    loadingInstance.close();
    ElMessage.error(
      `推送赛事安排失败: ${error.response?.data?.message || "未知错误"}`
    );
  }
};

/**
 * 筛选
 */
const handleFilter = () => {
  pagination.page = 1;
  // 由于使用computed，筛选会自动应用
  console.log("筛选条件:", filterForm);
};

/**
 * 重置筛选
 */
const resetFilter = () => {
  filterForm.team = "";
  filterForm.status = "";
  filterForm.dateRange = [];
  filterForm.league = "";
  pagination.page = 1;
};

/**
 * 上传前的验证
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
 */
const onUploadSuccess = (response: any) => {
  uploading.value = false;
  ElMessage.success("文件上传成功!");
  fetchMatchRecords();
};

/**
 * 上传失败回调
 */
const onUploadError = (error: any) => {
  uploading.value = false;
  console.error("上传失败:", error);
  ElMessage.error("文件上传失败，请重试!");
};

/**
 * 格式化导入状态类型
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
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

/**
 * 处理每页数量变化
 */
const handleSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  fetchMatchRecords(1, size);
};

/**
 * 处理页码变化
 */
const handleCurrentChange = (page: number) => {
  pagination.page = page;
  fetchMatchRecords(page, pagination.limit);
};
</script>

<style lang="scss" scoped>
.new-matches-container {
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

    .betting-details-container {
      padding: 10px 20px;
      background-color: #fafafa;
      border-radius: 4px;

      h4 {
        margin: 0 0 10px 0;
        color: #606266;
        font-size: 14px;
        font-weight: 600;
      }

      .el-table {
        border-radius: 4px;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 20px 0;
  }

  // 编辑对话框样式
  :deep(.el-dialog) {
    border-radius: 8px;

    .el-dialog__header {
      padding: 20px 20px 10px;
      border-bottom: 1px solid #ebeef5;
    }

    .el-dialog__body {
      padding: 20px;
    }

    .el-dialog__footer {
      padding: 10px 20px 20px;
      text-align: right;
    }
  }

  // 状态标签样式
  :deep(.el-tag) {
    font-weight: 500;
  }

  // 按钮组样式
  :deep(.el-button-group) {
    .el-button {
      padding: 5px 10px;
      font-size: 12px;
    }
  }

  // 表格展开行样式
  :deep(.el-table__expand-column) {
    .el-table__expand-icon {
      color: #409eff;
    }
  }
}
</style>
