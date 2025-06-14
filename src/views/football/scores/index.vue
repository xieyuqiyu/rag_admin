<template>
  <div>
    <h1>每日推荐</h1>
    <div class="container">
      上传比分
    </div>
    <div class="container">
      更新预测结果
    </div>
    <div class="container">
      修正比分
    </div>
    <div class="container">
      当前前端展示内容
    </div>
  </div>
</template>
<script setup lang="ts">

</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 0 10px rgba(51, 16, 187, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-top: 2rem;
  transition: .6s all;
}

.container:hover {
  box-shadow: 0 0 10px rgba(27, 40, 229, 0.5);
  transition: .6s all;
  /* 鼠标悬浮往上移动点 */
  transform: translateY(-10px);
  /* 鼠标 */
  cursor: pointer;
}
</style>
