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
            if (this.autosaveTimerId) {clearTimeout(this.autosaveTimerId);}
            this.autosaveTimerId = setTimeout(() => {
                this.saveContent(documentContent);
            }, 3000);
        },
        saveContent(documentContent) {
            this.$set(this.documents, this.currentDocument, {
                content: documentContent,
                lastChange: Date.now()
            });
            localStorage.setItem('documents', JSON.stringify(this.documents));
        },
        setCurrentDocumentToLatest() {
            if (this.documents.length === 0) {return;}

            let latestIndex = 0;
            let latestChange = this.documents[0].lastChange;

            for (let index = 1; index < this.documents.length; index++) {
                const document = this.documents[index];
                if (document.lastChange > latestChange) {
                    latestChange = document.lastChange;
                    latestIndex = index;
                }
            }
            if (latestIndex === 0) {
                this.setContent(this.documents[0].content);
            }
            this.currentDocument = latestIndex;
        },
        setContent(newContent) {
            this.content = newContent;
            this.saveContent(this.content);
            this.$refs.textEditor.editor.commands.setContent(newContent); //Костыль для переключения документов. Я хотел использовать реактивность, но никак.
        },
        switchDocument (index)  {
            if (index === this.currentDocument) return;
            if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);

            this.saveContent(this.content);
            this.currentDocument = index;
            
        },
        createDocument() {
            this.$set(this.documents, this.documents.length, 
                {
                    content: '',
                    lastChange: Date.now(),
                });
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
        }
    }
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
    border-right: 3px solid rgb(209 213 219);
    overflow-y: auto; /* Вертикальная прокрутка для меню */
}
#content {
    flex-grow: 1; /* Занимает оставшееся пространство */
    overflow-y: auto; /* Вертикальная прокрутка для контента */
}
</style>