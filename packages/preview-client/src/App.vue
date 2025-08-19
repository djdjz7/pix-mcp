<script setup lang="ts">
import { onUnmounted, ref } from "vue";

const ws = new WebSocket("ws://" + window.location.host + "/ws");
const canvasData = ref<string[][]>([[]]);

ws.onmessage = (event) => {
  canvasData.value = JSON.parse(event.data);
};

onUnmounted(() => {
  ws.close();
});
</script>

<template>
  <div
    v-for="row in canvasData"
    :style="{
      display: 'flex',
      flexDirection: 'row',
    }"
  >
    <div
      v-for="cell in row"
      :style="{
        background: cell,
        width: '20px',
        height: '20px',
      }"
    ></div>
  </div>
</template>
