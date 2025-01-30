export const documentService = {
    documents: JSON.parse(localStorage.getItem('documents')) || [{ content: '', lastChange: Date.now() }],
    currentDocument: Number(localStorage.getItem('latestDocimentIndex')) || 0,

    get currentDocumentContent() {
        return this.documents[this.currentDocument]?.content || '';
    },

    updateContent(content) {
        this.documents[this.currentDocument].content = content;
        this.documents[this.currentDocument].lastChange = Date.now();
        localStorage.setItem('documents', JSON.stringify(this.documents));
    },

    createDocument() {
        this.documents.push({ content: '', lastChange: Date.now() });
        this.switchDocument(this.documents.length - 1);
    },

    switchDocument(index) {
        if (index === this.currentDocument) return;
        this.currentDocument = index;
        localStorage.setItem('latestDocimentIndex', index);
    },

    deleteDocument(index) {
        if (this.documents.length > 1) {
            this.documents.splice(index, 1);
            if (this.currentDocument >= index) {
                this.currentDocument = Math.max(this.currentDocument - 1, 0);
            }
        } else {
            this.documents[0] = { content: '', lastChange: Date.now() };
        }
        localStorage.setItem('documents', JSON.stringify(this.documents));
    },

    getTitle(document) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(document.content, 'text/html');
        const firstElement = doc.body.firstChild;

        if (firstElement && firstElement.textContent.trim()) {
            return firstElement.textContent;
        }
        return 'Новый документ';
    }
};