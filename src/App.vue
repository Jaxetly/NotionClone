<template>
    <div id="app" class="bg-gray-900 text-white">
        <DocumentList
            id="menu"
            :documents="documents"
            :currentDocument="currentDocument"
            @createDocument="createDocument"
            @switchDocument="switchDocument"
            @deleteDocument="deleteDocument"
        />
        <TextEditor
            id="content"
            ref="textEditor"
            @updateContent="updateContent"
            class="bg-gray-900 flex justify-center"
        />
    </div>
</template>

<script>
import TextEditor from './TextEditor.vue';
import DocumentList from './DocumentList.vue';

export default {
    name: 'App',
    components: {
        TextEditor,
        DocumentList,
    },
    data() {
        return {
            documents: JSON.parse(localStorage.getItem('documents')) || [{ content: '', lastChange: Date.now() }],
            currentDocument: Number(localStorage.getItem('latestDocimentIndex')) || 0,
            autosaveTimerId: null,
        };
    },
    watch: {
        currentDocument(newIndex) {
            this.setContent(this.documents[newIndex].content || '');
            localStorage.setItem('latestDocimentIndex', newIndex);
        },
    },
    mounted() {
        this.setContent(this.documents[this.currentDocument].content);
    },
    methods: {
        // Обновление контента и запуск автосохранения
        updateContent(documentContent) {
            this.autoSave(documentContent);
        },

        // Автосохранение с задержкой
        autoSave(documentContent) {
            if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
            this.autosaveTimerId = setTimeout(() => {
                this.saveContent(documentContent);
            }, 3000);
        },

        // Сохранение контента в текущий документ
        saveContent(documentContent) {
            this.$set(this.documents, this.currentDocument, {
                content: documentContent,
                lastChange: Date.now(),
            });
            localStorage.setItem('documents', JSON.stringify(this.documents));
        },

        // Установка контента в редактор
        setContent(newContent) {
            this.$refs.textEditor.editor.commands.setContent(newContent);
        },

        // Переключение на другой документ
        switchDocument(index) {
            if (index === this.currentDocument) return;
            if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
            this.saveContent(this.content);
            this.currentDocument = index;
        },

        // Создание нового документа
        createDocument() {
            this.documents.push({ content: '', lastChange: Date.now() });
            this.switchDocument(this.documents.length - 1);
        },

        // Удаление документа
        deleteDocument(index) {
            if (this.documents.length > 1) {
                this.documents.splice(index, 1);
                if (this.currentDocument >= index) {
                    this.currentDocument = Math.max(this.currentDocument - 1, 0);
                }
            } else {
                this.documents[0] = { content: '', lastChange: Date.now() };
                this.setContent('');
            }
            localStorage.setItem('documents', JSON.stringify(this.documents));
        },
    },
};
</script>

<style>
.parent {
    display: flex;
    flex-direction: column;
    height: 100%; /* или любая другая высота */
}

#app {
    display: flex;
    height: 100vh;
    margin: 0;
}

#menu {
    width: 320px; /* Ширина меню */
    border-right: 3px solid oklch(0.446 0.03 256.802);
    overflow-y: auto; /* Вертикальная прокрутка для меню */
}
#content {
    flex-grow: 1; /* Занимает оставшееся пространство */
    overflow-y: auto; /* Вертикальная прокрутка для контента */
}
</style>