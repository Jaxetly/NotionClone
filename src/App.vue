<template>
    <div id="app" class="parent bg-gray-900" >
        <h1 class="top mx-4 pt-3 font-semibold text-white text-4xl">Текст Редактор</h1>
        <TextEditor :initContent="content" @updateContent="updateContent" class="bottom dark bg-gray-900 flex justify-center" />
    </div>
</template>

<script>
import TextEditor from './TextEditor.vue';

export default {
    name: 'App',
    components: {
        TextEditor,
    },
    data() {
        return {
            content: JSON.parse(localStorage.getItem('content')) || 'aboba',
            saveContent: '',
        }
    },
    methods: {
        updateContent(content) {
            this.saveContent = content;
            this.autoSave(this.saveContent);
            const match = content.match(/<([^>]+)>(.*?)<\/\1>/);
            if (match) {console.log(match[0]);}
        },
        autoSave(content) {
            if (this.autosaveTimerId) {clearTimeout(this.autosaveTimerId);}
            this.autosaveTimerId = setTimeout(() => {
                localStorage.setItem('content', JSON.stringify(content));
            }, 3000);
        },
    }
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