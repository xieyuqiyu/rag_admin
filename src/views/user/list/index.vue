<template>
    <div>
        <div>
            <h1>RAGFLOW 用户列表</h1>
        </div>
        <br />
        <div class="table-container">
            <el-table class="with-shadow" :data="tableData" style="width: 100%" border stripe size="default" @row-click="(row, column, event) => {
                console.log(row, column, event)
            }">
                <el-table-column prop="nickname" label="用户名"></el-table-column>
                <el-table-column prop="email" label="用户名"></el-table-column>
                <el-table-column prop="phone" label="手机号">
                    <template #default="scope">
                        <span>{{ scope.row.phone || '-' }}</span>
                    </template>
                </el-table-column>
                <!-- 操作 -->
                <el-table-column label="操作" width="180px">
                    <template #default="scope">
                        <el-button type="primary" size="small"
                            @click="router.push({ path: `/user/edit/${scope.row.id}` })">编辑</el-button>
                        <el-button type="danger" size="small"
                            @click="() => { console.log('删除', scope.row.id) }">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

    </div>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// 获取用户信息
import { getUserList } from '@/api/user'
import { useUserStoreHook } from '@/store/modules/user'
const userStore = useUserStoreHook()
const router = useRouter()
const tableData = ref([])
onMounted(async () => {
    userList()
})


// 新建一个方法获取用户列表
async function userList() {
    // 获取用户列表
    const res = await getUserList()
    // 这里可以处理获取到的用户列表数据
    if (res.code === 0) {
        // 假设 res.data 是用户列表
        tableData.value = Array.isArray(res.data) ? res.data : []
        console.log('用户列表:', res.data)
    } else {
        console.error('获取用户列表失败:', res.message)
    }
}


</script>

<style lang="scss" scoped>
.table-container {
    :deep(.el-table) {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }
}
</style>