<template>
    <div id="app" class="bg-gray-900 text-white" >
        <DocumentList 
            id="menu"
            :documents="documents"
            :currentDocument="currentDocument"
            @createDocument="createDocument"
            @switchDocument="switchDocument" />
        <TextEditor 
            id="content" 
            :initContent="content"
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
            documents: JSON.parse(localStorage.getItem('documents')) || [],
            contentCopy: '',
            content: '',
            currentDocument: 0,
        }
    },
    watch: {
        currentDocument(newIndex) {
            this.content = this.documents[newIndex].content || '';
        }
    },
    created() {
        this.setCurrentDocumentToLatest();
    },
    methods: {
        updateContent(documentContent) {
            this.content = documentContent;
            this.autoSave(documentContent);
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

            this.currentDocument = latestIndex;
        },
        switchDocument(index) {
            if (index === this.currentDocument) return;
            if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);

            this.saveContent(this.content);
            this.currentDocument = index;
        },
        createDocument() {
            this.documents.push(
                {
                    content: '',
                    lastChange: Date.now(),
                }
            );
            this.switchDocument(this.documents.length - 1);
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

.top {
    height: 100px; /* фиксированная высота для верхнего элемента */
}

.bottom {
    flex: 1; /* занимает оставшееся пространство */
    padding-bottom: 200px;
}

#app {
    display: flex;
    height: 100vh;
    margin: 0;
}

#menu {
    min-width: 300px; /* Ширина меню */
    border-right: 3px solid rgb(209 213 219);
    overflow-y: auto; /* Вертикальная прокрутка для меню */
}
#content {
    flex-grow: 1; /* Занимает оставшееся пространство */
    overflow-y: auto; /* Вертикальная прокрутка для контента */
}
</style>