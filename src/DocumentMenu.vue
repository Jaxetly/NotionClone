<template>
  <div class="menu">
    <button @click="addDocument">Добавить документ</button>
    <ul>
      <li v-for="document in documents" :key="document.id">
        <button @click="selectDocument(document.id)">{{ document.id }}</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    documents: Array,
  },
  methods: {
    selectDocument(id) {
      this.$emit('selectDocument', id);
    },
    addDocument() {
      this.$emit('addDocument');
    },
  },
};
</script>

<style>
.menu {
  width: 200px;
  background-color: #333;
  color: white;
  padding: 10px;
}
.menu button {
  width: 100%;
  margin: 5px 0;
}
</style>
