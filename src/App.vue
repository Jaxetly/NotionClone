<template>
    <div id="app" class="bg-gray-900 text-white" >
        <DocumentList 
            id="menu"
            :documents="documents"
            :currentDocument="currentDocumentIndex"
            @createDocument="createDocument"
            @switchDocument="switchDocument"
            @deleteDocument="deleteDocument" />
        <TextEditor 
            id="content" 
            ref="textEditor"
            @updateContent="updateContent" 
            class="bg-gray-900 flex justify-center" />
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
            this.$refs.textEditor.editor.commands.setContent(newContent); //Костыль для переключения документов. Я хотел использовать реактивность, но никак.
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
#app {
    display: flex;
    height: 100vh;
    margin: 0;
}

#menu {
    width: 320px;
    border-right: 3px solid oklch(0.446 0.03 256.802);
    overflow-y: auto;
}
#content {
    flex-grow: 1;
    overflow-y: auto;
}
</style>