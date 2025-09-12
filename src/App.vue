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
<script setup>
import { ref, shallowRef } from 'vue'
const obj1 = ref({
  name: 'obj1',
  pesrson: {
    child: {
      name: 'hhhh'
    }
  }
})
const obj2 = shallowRef({
  name: 'obj2',
  pesrson: {
    child: {
      name: '3333'
    }
  }
})
// console.log(obj1)
// console.log(obj2)
</script>
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
