<template>
    <div ref="contextMenu" class="context-menu" :style="contextMenuStyle">
        <ButtonGroup 
            v-for="(group, groupIndex) in buttonGroups" 
            :key="groupIndex" 
            :title="group.title" 
            :buttons="group.buttons" 
            :editor="editor"
        />
        <div class="context-group color-picker">
            <h6 class="context-group-title">Color</h6>
            <div class="btn bg-gray-700 m-1 p-2 rounded" @click="toggleSelect">
                <i class="bi bi-paint-bucket"></i>
            </div>
            <div ref="colorSelect" v-show="isSelectVisible" class="color-options" :style="selectColorStyle">
                <div 
                    v-for="color in colors" 
                    :key="color.value" 
                    class="color-option bg-gray-900" 
                    :style="{ color: color.value }" 
                    @click="setColor(color.value, color.label)"
                >
                    {{ color.label }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ButtonGroup from './ButtonGroup.vue';

export default {
    components: {
        ButtonGroup
    },
    props: {
        editor: {
            type: Object,
            required: true
        },
        editorElement: {
            type: HTMLDivElement,
            required: true
        },
    },
    data() {
        return {
            isSelectVisible: false,
            contextMenuVisible: false,
            contextMenuStyle: {top:'-100px'},
            colors: [
                { value: '#FF5733', label: 'Red' },
                { value: '#2ECC71', label: 'Green' },
                { value: '#3357FF', label: 'Blue' },
                { value: '#F1C40F', label: 'Yellow' },
                { value: '#958DF1', label: 'Purple' },
                { value: '#E67E22', label: 'Orange' },
                { value: '#8E44AD', label: 'Violet' },
                { value: '#3498DB', label: 'Sky Blue' },
                { value: '#16A085', label: 'Sea Green' },
                { value: '#FF6F92', label: 'Pink' },
            ],
            selectColorStyle: {top: '0px',left: '0px'},
            buttonGroups: [
                {
                    title: 'Text Formatting',
                    buttons: [
                        { action: 'toggleBold', label: 'Bold', icon: 'bi bi-type-bold' },
                        { action: 'toggleItalic', label: 'Italic', icon: 'bi bi-type-italic' },
                        { action: 'toggleStrike', label: 'Strike', icon: 'bi bi-type-strikethrough' },
                        { action: 'toggleUnderline', label: 'Underline', icon: 'bi bi-type-underline' },
                        { action: 'toggleCode', label: 'Code', icon: 'bi bi-code-slash' },
                        { action: 'setLink', label: 'Set Link', icon: 'bi bi-box-arrow-up-right' },
                    ]
                },
                {
                    title: 'Clear',
                    buttons: [
                        { action: 'unsetAllMarks', label: 'Clear marks', icon: 'bi bi-eraser', isClear: true },
                        { action: 'clearNodes', label: 'Clear nodes', icon: 'bi bi-trash', isClear: true },
                    ]
                },
                {
                    title: 'Headings',
                    buttons: [
                        { action: 'toggleHeading', label: 'H1', icon: 'bi bi-type-h1', level: 1 },
                        { action: 'toggleHeading', label: 'H2', icon: 'bi bi-type-h2', level: 2 },
                        { action: 'toggleHeading', label: 'H3', icon: 'bi bi-type-h3', level: 3 },
                        { action: 'toggleHeading', label: 'H4', icon: 'bi bi-type-h4', level: 4 },
                    ]
                },
                {
                    title: 'Lists',
                    buttons: [
                        { action: 'toggleBulletList', label: 'Bullet list', icon: 'bi bi-list-ul' },
                        { action: 'toggleOrderedList', label: 'Ordered list', icon: 'bi bi-list-ol' },
                    ]
                },
                {
                    title: 'Blocks',
                    buttons: [
                        { action: 'toggleCodeBlock', label: 'Code block', icon: 'bi bi-code-square' },
                        { action: 'toggleBlockquote', label: 'Blockquote', icon: 'bi-chat-left-quote' },
                        { action: 'setHorizontalRule', label: 'Horizontal rule', icon: 'bi bi-dash', isClear: true },
                        { action: 'setHardBreak', label: 'Hard break', icon: 'bi bi-arrow-down', isClear: true },
                    ]
                },
                {
                    title: 'Undo/Redo',
                    buttons: [
                        { action: 'undo', label: 'Undo', icon: 'bi bi-arrow-counterclockwise', isUndoRedo: true },
                        { action: 'redo', label: 'Redo', icon: 'bi bi-arrow-clockwise', isUndoRedo: true },
                    ]
                },
            ]
        }
    },
    mounted() {      
    },
    methods: {
        setColor(color) {
            this.editor.chain().focus().setColor(color).run();
            this.isSelectVisible = false;
        },
        toggleSelect(event) {
            this.isSelectVisible = !this.isSelectVisible;
            const colorSelect = this.$refs.colorSelect;
                        
            if(colorSelect && this.isSelectVisible) {
                this.$nextTick(() => {
                    const button = event.currentTarget;
                    const contextMenu = button.parentNode.parentNode;
                    const rectButton = button.getBoundingClientRect();
                    const rectMenu = contextMenu.getBoundingClientRect();
                    const colorSelectHeight = colorSelect.offsetHeight;

                    const isCursorNearBottom = rectButton.bottom + colorSelectHeight > window.innerHeight;
                    this.selectColorStyle = {
                        top: isCursorNearBottom ? `${rectButton.top - colorSelectHeight - rectMenu.top - 2}px` : `${rectButton.bottom - rectMenu.top + 2}px`,
                        right: `14px`,
                    };
                });
            }
        },
        toggleContextMenu(event) {
            if(!this.contextMenuVisible) {
                this.enableContextMenu(event.clientY);
            } else {
                this.disableContextMenu();
            }
        },
        enableContextMenu(clientY) {
            const menuOffset = 50;
            const contextMenuElement = this.$refs.contextMenu;
            this.contextMenuVisible = true;

            this.$nextTick(() => {
                const contextMenuHeight = contextMenuElement.offsetHeight;
                const isCursorNearBottom = clientY + contextMenuHeight + menuOffset > window.innerHeight;
                const isCursorNearTop = clientY - contextMenuHeight - menuOffset < 0;

                const contextMenuRect = contextMenuElement.getBoundingClientRect();
                const editorRect = this.editorElement.getBoundingClientRect();

                const topPositionToTop = isCursorNearTop
                    ? `${10}px`
                    : `${clientY - contextMenuHeight - menuOffset}px`;

                const topPositionToBottom = isCursorNearBottom 
                    ? `${clientY - contextMenuHeight - menuOffset}px` 
                    : `${clientY + menuOffset}px`

                this.contextMenuStyle = {
                    top: topPositionToTop,
                    left: `${(editorRect.width - contextMenuRect.width) / 2 + 295}px`,
                };
            });
        },
        disableContextMenu() {
            this.contextMenuVisible = false;
            if (this.isSelectVisible) this.toggleSelect();
            this.contextMenuStyle = {
                top: '-100px',
                left: this.contextMenuStyle.left,
            };
        },
    }
};
</script>

<style>
.context-menu {
    position: fixed;
    display: inline-flex;
    z-index: 1000;
    transition: top 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.color-options {
    position: absolute;
    width: 100px;
}

.color-option:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}

.color-option:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
}

.color-option {
    text-align: right;
    cursor: pointer;
    padding: 2px;
    border-width: 1px;
    border-color: rgb(55 65 81);
}

.btn {
    padding: 0.375rem 0.75rem;
}

.btn:disabled, .btn.disabled {
    opacity: 0.65;
}

.context-group {
    border-right: 2px solid #ccc;
    padding: 10px;
}

.context-group:last-child {
    border-right: none;
}

</style>