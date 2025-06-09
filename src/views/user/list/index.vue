<template>
    <div>
        <div class="container">
            <h1>User List</h1>
            <p>This is the user list page.</p>
        </div>
        <br />
        <div class="container">
            <el-table :data="[]" style="width: 100%" border stripe size="default" @row-click="(row, column, event) => {
                console.log(row, column, event)
            }">
                <el-table-column prop="name" label="用户名" ></el-table-column>
                
            </el-table>
        </div>

    </div>
</template>

<script setup lang="ts">

import { onMounted } from 'vue'
import { useRouter } from 'vue-router'



</script>

<style lang="scss" scoped>
.container {
   
}
</style>