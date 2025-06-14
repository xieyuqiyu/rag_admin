<template>
  <div class="team-management-container">
    <div class="header-section">
      <h1>球队管理</h1>
      <div>
        <el-button type="primary" @click="handleAddTeam">导入球队</el-button>
        <el-button type="primary" @click="handleAddTeam">添加球队</el-button>
      </div>

    </div>

    <!-- 球队列表 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="teamList" border stripe style="width: 100%; margin-top: 20px"
        class="with-shadow">
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="LOGO" width="100">
          <template #default="{ row }">
            <el-image class="team-logo" :src="row.logo_url" :preview-src-list="[row.logo_url]" fit="contain"
              :fallback-src="defaultLogo" />
          </template>
        </el-table-column>
        <el-table-column label="球队名称" prop="name" />
        <el-table-column label="教练" prop="coach" />
        <el-table-column label="主场" prop="stadium" />
        <el-table-column label="所属联赛" prop="league" />
        <el-table-column label="成立日期" prop="established_at" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEditTeam(row)">编辑</el-button>
            <el-button type="success" size="small" @click="handleViewDetails(row)">详情</el-button>
            <el-button type="danger" size="small" @click="handleDeleteTeam(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑球队对话框 -->
    <el-dialog :title="dialogType === 'add' ? '添加球队' : '编辑球队'" v-model="dialogVisible" width="600px">
      <el-form ref="teamFormRef" :model="teamForm" :rules="teamFormRules" label-width="100px">
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
          <el-select v-model="teamForm.league" placeholder="选择联赛" style="width: 100%">
            <el-option label="中超" value="中超" />
            <el-option label="中甲" value="中甲" />
            <el-option label="中乙" value="中乙" />
            <el-option label="中冠" value="中冠" />
          </el-select>
        </el-form-item>
        <el-form-item label="成立日期" prop="established_at">
          <el-date-picker v-model="teamForm.established_at" type="date" placeholder="选择日期" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="球队LOGO" prop="logo_url">
          <el-input v-model="teamForm.logo_url" placeholder="输入LOGO图片URL" />
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
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import axios from 'axios';

interface Team {
  id: number;
  name: string;
  coach: string;
  stadium: string;
  league: string;
  established_at: string;
  logo_url: string;
}

// 默认LOGO图片
const defaultLogo = 'https://via.placeholder.com/150?text=No+Logo';

// 状态变量
const router = useRouter();
const loading = ref(false);
const teamList = ref<Team[]>([]);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const teamFormRef = ref<FormInstance>();

// 表单数据
const teamForm = reactive({
  id: 0,
  name: '',
  coach: '',
  stadium: '',
  league: '',
  established_at: '',
  logo_url: ''
});

// 表单验证规则
const teamFormRules = {
  name: [{ required: true, message: '请输入球队名称', trigger: 'blur' }],
  coach: [{ required: true, message: '请输入教练姓名', trigger: 'blur' }],
  stadium: [{ required: true, message: '请输入主场名称', trigger: 'blur' }],
  league: [{ required: true, message: '请选择所属联赛', trigger: 'change' }],
  established_at: [{ required: true, message: '请选择成立日期', trigger: 'change' }]
};

// 生命周期
onMounted(() => {
  fetchTeamList();
});

// 获取球队列表
const fetchTeamList = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/teams');
    teamList.value = response.data.teams;
  } catch (error) {
    console.error('获取球队列表失败:', error);
    ElMessage.error('获取球队列表失败');

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
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  teamForm.id = 0;
  teamForm.name = '';
  teamForm.coach = '';
  teamForm.stadium = '';
  teamForm.league = '';
  teamForm.established_at = '';
  teamForm.logo_url = '';
};

// 添加球队
const handleAddTeam = () => {
  dialogType.value = 'add';
  resetForm();
  dialogVisible.value = true;
};

// 编辑球队
const handleEditTeam = (row: Team) => {
  dialogType.value = 'edit';
  Object.assign(teamForm, row);
  dialogVisible.value = true;
};

// 查看详情
const handleViewDetails = (row: Team) => {
  router.push(`/football/teams/detail/${row.id}`);
};

// 删除球队
const handleDeleteTeam = (row: Team) => {
  ElMessageBox.confirm(`确定要删除"${row.name}"球队吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 实际接口调用
      // await axios.delete(`/api/teams/${row.id}`);

      // 模拟成功删除
      teamList.value = teamList.value.filter(item => item.id !== row.id);
      ElMessage.success('删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 提交表单
const submitTeamForm = async () => {
  if (!teamFormRef.value) return;

  await teamFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          // 添加球队
          // const response = await axios.post('/api/teams', teamForm);

          // 模拟添加
          const newTeam = {
            ...teamForm,
            id: Math.max(...teamList.value.map(t => t.id), 0) + 1
          };
          teamList.value.push(newTeam);
          ElMessage.success('添加球队成功');
        } else {
          // 编辑球队
          // await axios.put(`/api/teams/${teamForm.id}`, teamForm);

          // 模拟编辑
          const index = teamList.value.findIndex(team => team.id === teamForm.id);
          if (index !== -1) {
            teamList.value[index] = { ...teamForm };
          }
          ElMessage.success('更新球队成功');
        }

        dialogVisible.value = false;
      } catch (error) {
        console.error('保存失败:', error);
        ElMessage.error('操作失败');
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
}
</style>