<template>
    <div id="app" class="bg-gray-900 text-white" >
        <DocumentList 
            id="menu"
            :documents="documents"
            :currentDocument="currentDocument"
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
            content: '',
            autosaveTimerId: null,
            currentDocument: 0,
        }
    },
    watch: {
        currentDocument(newIndex) {
            this.setContent(this.documents[newIndex].content || '');
            localStorage.setItem('latestDocimentIndex', newIndex);
        }
    },
    mounted() {
        this.currentDocument = Number(localStorage.getItem('latestDocimentIndex'));
        if (this.currentDocument === 0) {
            this.setContent(this.documents[0].content);
        }
    },
    methods: {
        updateContent(documentContent) {
            this.content = documentContent;
            this.autoSave(this.content);
        },
        autoSave(documentContent) {
            if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
            this.autosaveTimerId = setTimeout(() => {
                this.saveContent(documentContent);
            }, 2000);
        },
        saveContent(documentContent) {
            this.$set(this.documents, this.currentDocument, {
                content: documentContent,
                lastChange: Date.now()
            });
            localStorage.setItem('documents', JSON.stringify(this.documents));
        },
        setContent(newContent) {
            this.content = newContent;
            this.saveContent(this.content);
            this.setContent(newContent); //Костыль для переключения документов. Я хотел использовать реактивность, но никак.
        },
        switchDocument (index)  {
            if (index === this.currentDocument) return;
            if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);

            this.saveContent(this.content);
            this.currentDocument = index;
            
        },
        createDocument() {
            this.documents.push({ content: '', lastChange: Date.now() });
            this.switchDocument(this.documents.length - 1);
        },
        deleteDocument(index) {
            if (this.documents.length > 1) {
                if (this.currentDocument === 0 && index === 0) {
                    this.currentDocument = 1;
                }
                this.$nextTick(() => {
                    this.documents.splice(index, 1);
                    if (this.currentDocument === index) {
                        if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
                    }
                    if (this.currentDocument >= index) {
                        this.currentDocument = this.currentDocument - 1;
                    }
                });
            } else {
                this.$set(this.documents, this.currentDocument, {
                    content: '',
                    lastChange: Date.now()
                });
                if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
                this.setContent('');
            }
        },
        setContent(newContent) {
            this.$refs.textEditor.editor.commands.setContent(newContent);
        }
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