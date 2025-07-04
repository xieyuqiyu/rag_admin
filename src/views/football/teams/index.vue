<template>
  <div class="team-management-container">
    <div class="header-section">
      <h1>球队管理</h1>
      <div>
        <el-button type="primary" @click="handleAddTeam">导入球队</el-button>
        <el-button type="primary" @click="handleAddTeam">添加球队</el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索球队名称"
        clearable
        style="width: 300px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 球队列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="teamList"
        border
        stripe
        style="width: 100%; margin-top: 20px"
        class="with-shadow"
      >
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="LOGO" width="100">
          <template #default="{ row }">
            <el-image
              class="team-logo"
              :src="`http://110.41.141.96:3001` + row.logo_url"
              :preview-src-list="[row.logo_url]"
              fit="contain"
              :fallback-src="defaultLogo"
            />
          </template>
        </el-table-column>
        <el-table-column label="球队名称" prop="name" />

        <el-table-column label="所属联赛" prop="league" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEditTeam(row)"
              >编辑</el-button
            >
            <el-button
              type="success"
              size="small"
              @click="handleViewDetails(row)"
              >详情</el-button
            >
            <el-button type="danger" size="small" @click="handleDeleteTeam(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加/编辑球队对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加球队' : '编辑球队'"
      width="600px"
    >
      <el-form
        ref="teamFormRef"
        :model="teamForm"
        :rules="teamFormRules"
        label-width="100px"
      >
        <el-form-item label="球队名称" prop="name">
          <el-input v-model="teamForm.name" />
        </el-form-item>
        <el-form-item label="教练" prop="coach">
          <el-input v-model="teamForm.coach" />
        </el-form-item>
        <el-form-item label="主场" prop="stadium">
          <el-input v-model="teamForm.stadium" />
        </el-form-item>
        <el-form-item label="所属联赛" prop="league">
          <el-select
            v-model="teamForm.league"
            placeholder="选择联赛"
            style="width: 100%"
          >
            <el-option label="中超" value="中超" />
            <el-option label="中甲" value="中甲" />
            <el-option label="中乙" value="中乙" />
            <el-option label="中冠" value="中冠" />
          </el-select>
        </el-form-item>
        <el-form-item label="成立日期" prop="established_at">
          <el-date-picker
            v-model="teamForm.established_at"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <!-- 修改编辑球队对话框中的 LOGO 选择部分 -->
        <el-form-item label="球队LOGO" prop="logo_url">
          <el-select
            v-model="teamForm.logo_url"
            filterable
            remote
            reserve-keyword
            placeholder="搜索并选择球队LOGO"
            :remote-method="remoteSearchLogos"
            :loading="logosLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in logoOptions"
              :key="item.url"
              :label="item.filename"
              :value="item.url"
            >
              <div style="display: flex; align-items: center">
                <el-image
                  style="width: 30px; height: 30px; margin-right: 10px"
                  :src="item.url"
                  fit="contain"
                  :preview-src-list="[item.url]"
                />
                <span>{{ item.filename.replace(".png", "") }}</span>
              </div>
            </el-option>
          </el-select>

          <!-- LOGO 预览 -->
          <div v-if="teamForm.logo_url" class="logo-preview">
            <span class="preview-label">LOGO 预览:</span>
            <el-image
              :src="teamForm.logo_url"
              fit="contain"
              :preview-src-list="[teamForm.logo_url]"
              class="logo-preview-image"
              :fallback-src="defaultLogo"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTeamForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  getTeams,
  getTeamNames,
  createTeam,
  updateTeam,
  deleteTeam
} from "@/api/football"; // 使用导入的API函数

interface Team {
  id: number;
  name: string;
  coach: string;
  stadium: string;
  league: string;
  established_at: string;
  logo_url: string;
}
// 添加 LOGO 选择相关状态
interface LogoOption {
  filename: string;
  path: string;
  url: string;
  staticUrl: string;
}

// 添加分页和搜索相关状态
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchQuery = ref("");
const sortBy = ref("name");
// LOGO 选择相关状态
const logoOptions = ref<LogoOption[]>([]);
const logosLoading = ref(false);

// 默认LOGO图片
const defaultLogo = "https://via.placeholder.com/150?text=No+Logo";

// 状态变量
const router = useRouter();
const loading = ref(false);
const teamList = ref<Team[]>([]);
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const teamFormRef = ref<FormInstance>();

// 表单数据
const teamForm = reactive({
  id: 0,
  name: "",
  coach: "",
  stadium: "",
  league: "",
  established_at: "",
  logo_url: "",
  staticUrl: ""
});

// 表单验证规则
const teamFormRules = {
  name: [{ required: true, message: "请输入球队名称", trigger: "blur" }],
  coach: [{ required: true, message: "请输入教练姓名", trigger: "blur" }],
  stadium: [{ required: true, message: "请输入主场名称", trigger: "blur" }],
  league: [{ required: true, message: "请选择所属联赛", trigger: "change" }],
  established_at: [
    { required: true, message: "请选择成立日期", trigger: "change" }
  ]
};

// 生命周期
onMounted(() => {
  fetchTeamList();
});

/**
 * 获取球队列表
 * @param page 页码
 * @param limit 每页数量
 */
const fetchTeamList = async (
  page: number = currentPage.value,
  limit: number = pageSize.value
) => {
  loading.value = true;
  try {
    // 使用导入的API函数，传入查询参数
    const response = await getTeams({
      page,
      limit,
      search: searchQuery.value,
      sortBy: sortBy.value
    });

    // 更新球队列表数据
    teamList.value = response.data;

    // 更新分页信息
    if (response.meta) {
      currentPage.value = response.meta.page;
      pageSize.value = response.meta.limit;
      total.value = response.meta.total;
    }
  } catch (error) {
    console.error("获取球队列表失败:", error);
    ElMessage.error("获取球队列表失败");

    // 模拟数据（实际生产环境应移除这部分）
    teamList.value = [
      {
        id: 1,
        name: "泰山金钢",
        coach: "王指导",
        stadium: "泰山体育场",
        league: "中乙",
        established_at: "1995-01-01",
        logo_url: "https://example.com/logo1.png"
      },
      {
        id: 2,
        name: "大连人足球俱乐部",
        coach: "李教练",
        stadium: "大连体育中心",
        league: "中超",
        established_at: "1997-05-15",
        logo_url: "https://example.com/logo2.png"
      }
    ];

    // 模拟分页数据
    currentPage.value = 1;
    pageSize.value = 10;
    total.value = 2;
  } finally {
    loading.value = false;
  }
};

/**
 * 处理页码变化
 * @param page 新的页码
 */
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchTeamList(page, pageSize.value);
};

/**
 * 处理每页数量变化
 * @param size 新的每页数量
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
  fetchTeamList(1, size);
};

/**
 * 处理搜索
 */
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  fetchTeamList(1, pageSize.value);
};

// 远程搜索球队 LOGO
const remoteSearchLogos = async (query: string) => {
  if (query !== "") {
    logosLoading.value = true;
    try {
      const response = await getTeamNames({
        search: query,
        limit: 10,
        page: 1
      });
      logoOptions.value = response.data;
    } catch (error) {
      console.error("获取球队LOGO失败:", error);
      ElMessage.error("获取球队LOGO列表失败");
    } finally {
      logosLoading.value = false;
    }
  } else {
    logoOptions.value = [];
  }
};

// 在组件挂载时加载初始 LOGO 列表
const loadInitialLogos = async () => {
  logosLoading.value = true;
  try {
    const response = await getTeamNames({
      limit: 10,
      page: 1
    });
    logoOptions.value = response.data;
  } catch (error) {
    console.error("获取初始球队LOGO失败:", error);
  } finally {
    logosLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  teamForm.id = 0;
  teamForm.name = "";
  teamForm.coach = "";
  teamForm.stadium = "";
  teamForm.league = "";
  teamForm.established_at = "";
  teamForm.logo_url = "";
};

// 添加球队
const handleAddTeam = () => {
  dialogType.value = "add";
  resetForm();
  loadInitialLogos(); // 加载初始 LOGO 列表
  dialogVisible.value = true;
};

// 编辑球队
const handleEditTeam = (row: Team) => {
  dialogType.value = "edit";
  Object.assign(teamForm, row);
  loadInitialLogos(); // 加载初始 LOGO 列表
  dialogVisible.value = true;
};

// 查看详情
const handleViewDetails = (row: Team) => {
  router.push(`/football/teams/detail/${row.id}`);
};

// 删除球队
const handleDeleteTeam = (row: Team) => {
  ElMessageBox.confirm(`确定要删除"${row.name}"球队吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        // 调用删除API
        await deleteTeam(row.id);

        // 刷新球队列表
        fetchTeamList();

        ElMessage.success("删除成功");
      } catch (error) {
        console.error("删除失败:", error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 提交表单
const submitTeamForm = async () => {
  if (!teamFormRef.value) return;

  await teamFormRef.value.validate(async valid => {
    if (valid) {
      try {
        // 处理logo_url中可能包含的反引号
        if (teamForm.logo_url) {
          teamForm.logo_url = teamForm.logo_url.replace(/`/g, "").trim();
        }

        if (dialogType.value === "add") {
          // 添加球队
          await createTeam({
            name: teamForm.name,
            coach: teamForm.coach,
            stadium: teamForm.stadium,
            league: teamForm.league,
            established_at: teamForm.established_at,
            logo_url: teamForm.staticUrl
          });
          ElMessage.success("添加球队成功");
          // 刷新球队列表
          fetchTeamList();
        } else {
          // 编辑球队
          await updateTeam(teamForm.id, {
            name: teamForm.name,
            coach: teamForm.coach,
            stadium: teamForm.stadium,
            league: teamForm.league,
            established_at: teamForm.established_at,
            logo_url: teamForm.logo_url
          });
          ElMessage.success("更新球队成功");
          // 刷新球队列表
          fetchTeamList();
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
</script>

<style lang="scss" scoped>
.team-management-container {
  padding: 20px;

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .table-container {
    :deep(.el-table) {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }
  }

  .team-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .search-section {
    margin-bottom: 20px;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 20px 0;
  }

  // 在现有样式中添加
  .logo-preview {
    margin-top: 10px;
    display: flex;
    align-items: center;

    .preview-label {
      margin-right: 10px;
      color: #606266;
      font-size: 14px;
    }

    .logo-preview-image {
      width: 60px;
      height: 60px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 5px;
      background-color: #f5f7fa;
    }
  }
}
</style>
