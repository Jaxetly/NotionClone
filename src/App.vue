<template>
  <div id="app" class="parent bg-gray-900" >
    <h1 class="top mx-4 pt-3 font-semibold text-white text-4xl" >Текст Редактор</h1>
    <TextEditor class="bottom dark bg-gray-900 flex justify-center" />
  </div>
</template>

<script>
import TextEditor from './TextEditor.vue';

export default {
  name: 'App',
  components: {
    TextEditor,
  },
};
</script>

<style>
.parent {
  display: flex;
  flex-direction: column;
  height: 100%; /* или любая другая высота */
}

.top {
  height: 100px; /* фиксированная высота для верхнего элемента */
}

.bottom {
  flex: 1; /* занимает оставшееся пространство */
  padding-bottom: 200px;
}
</style>