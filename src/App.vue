<template>
    <div id="app" class="app-container" >
        <DocumentList 
            class="menu"
            :documents="documents"
            :currentDocument="currentDocumentIndex"
            @createDocument="createDocument"
            @switchDocument="switchDocument"
            @deleteDocument="deleteDocument" />
        <TextEditor
            ref="textEditor"
            @updateContent="updateContent" 
            :content="contentToSave"
            class="text-editor" />
    </div>
</template>

<script>
import TextEditor from './TextEditor.vue';
import DocumentList from './DocumentList.vue';

export default {
    name: 'App',
    components: {
        TextEditor,
        DocumentList
    },
    data() {
        return {
            documents: JSON.parse(localStorage.getItem('documents')) || [{content: '', lastChange: Date.now()}],
            autosaveTimerId: null,
            contentToSave: '', //К сожалению, как бы я не пытался избавиться от этой "лишней" переменной, сделать этого не удалось, она овтечает за корректное сохранение документов при переключении, если вдруг автосохранение еще не выполнилось.
            currentDocumentIndex: 0,
        }
    },
    computed: {
        currentDocument() {
            return this.documents[this.currentDocumentIndex] || { content: '', lastChange: Date.now() };
        },
        currentContent() {
            return this.currentDocument.content;
        }
    },
    watch: {
        currentDocumentIndex(newIndex) {
            this.setContent(this.documents[newIndex].content || '');
            localStorage.setItem('latestDocumentIndex', newIndex);
        }
    },
    mounted() {
        const savedIndex = Number(localStorage.getItem('latestDocumentIndex')) || 0;
        this.currentDocumentIndex = Math.min(savedIndex, this.documents.length - 1);
        this.setContent(this.currentContent);
    },
    methods: {
        updateContent(documentContent) {
            this.contentToSave = documentContent;
            this.autoSave(documentContent);
        },
        autoSave(documentContent) {
            if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
            this.autosaveTimerId = setTimeout(() => {
                this.saveContent(documentContent);
            }, 2000);
        },
        saveContent(documentContent) {
            if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
            this.$set(this.documents, this.currentDocumentIndex, {
                content: documentContent,
                lastChange: Date.now()
            });
            localStorage.setItem('documents', JSON.stringify(this.documents));
        },
        setContent(newContent) {
            this.contentToSave = newContent;
            this.$nextTick(() => {
                this.$refs.textEditor.resetEditor(); //Костыль для переключения документов. Я хотел использовать реактивность, но никак.
            });
        },
        switchDocument (index)  {
            if (index !== this.currentDocumentIndex) {
                this.saveContent(this.contentToSave);
                this.currentDocumentIndex = index;
            }
        },
        createDocument() {
            this.documents.push({ content: '', lastChange: Date.now() });
            this.switchDocument(this.documents.length - 1);
        },
        deleteDocument(index) {
            if (this.documents.length > 1) {
                this.documents.splice(index, 1);
                if (this.currentDocumentIndex >= index) {
                    this.currentDocumentIndex = Math.max(0, this.currentDocumentIndex - 1);
                    this.setContent(this.currentContent);
                }
            }
            this.saveContent(this.currentContent);
        },
    }
};
</script>

<style>
:root {
    /* Основные цвета */
    --black: #000;
    --white: #fff;

    /* Оттенки серого */
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;

    /* Оттенки голубого */
    --blue-50: #eff6ff;
    --blue-100: #dbeafe;
    --blue-200: #bfdbfe;
    --blue-300: #93c5fd;
    --blue-400: #60a5fa;
    --blue-500: #3b82f6;
    --blue-600: #2563eb;
    --blue-700: #1d4ed8;
    --blue-800: #1e40af;
    --blue-900: #1e3a8a;
}

.app-container {
    display: flex;
    height: 100vh;
    margin: 0;
    color: var(--white);
}

.text-editor {
    display: flex;
    justify-content: center;
    background-color: var(--gray-900);
    flex-grow: 1;
    overflow-y: auto;
}

.menu {
    width: 320px;
    border-right: 3px solid oklch(0.446 0.03 256.802);
    overflow-y: auto;
    background-color: var(--gray-800);
}
</style>