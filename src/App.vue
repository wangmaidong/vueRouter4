<script setup></script>

<template>
  <div class="nav">
    <router-link to="/home">首页</router-link>
    <span class="span">|</span>
    <router-link to="/about">关于</router-link>
  </div>
  <div class="content">
    <router-view></router-view>
  </div>
</template>

<style scoped>
.nav {
  display: flex;
  justify-content: center;
  align-items: center;
}
.span {
  margin: 0 20px;
}
.content {
  padding-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
