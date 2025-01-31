<template>
    <div ref="contextMenu" class="context-menu" :style="contextMenuStyle">
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
        <ButtonGroup 
            v-for="(group, groupIndex) in buttonGroups" 
            :key="groupIndex" 
            :title="group.title" 
            :buttons="group.buttons" 
            :editor="editor"
            @toggleSelect="toggleColorSelect"
        />
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
        }
    },
    data() {
        return {
            isSelectVisible: false,
            contextMenuVisible: false,
            contextMenuStyle: {top:'-100px', left:'320px'},
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
            selectColorStyle: {top: '0px', left: '0px'},
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
                        { action: 'addImage', label: 'Image from URL', icon: 'bi bi-image'},
                    ]
                },
                {
                    title: 'Un/Re',
                    buttons: [
                        { action: 'undo', label: 'Undo', icon: 'bi bi-arrow-counterclockwise', isUndoRedo: true },
                        { action: 'redo', label: 'Redo', icon: 'bi bi-arrow-clockwise', isUndoRedo: true },
                    ]
                },
                {
                    title: 'Color',
                    buttons: [
                        { action: 'toggleSelect', label: 'Color the text', icon: 'bi bi-paint-bucket'},
                    ]
                }
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
        toggleColorSelect(event) {
            this.isSelectVisible = !this.isSelectVisible;
            if (this.isSelectVisible) this.enableColorSelect(event)
        },
        enableColorSelect(event) {
            this.$nextTick(() => {
                const button = event.currentTarget;
                const contextMenu = button.parentNode.parentNode;
                const rectButton = button.getBoundingClientRect();
                const rectMenu = contextMenu.getBoundingClientRect();
                const colorSelectHeight = this.$refs.colorSelect.offsetHeight;

                const isCursorNearBottom = rectButton.bottom + colorSelectHeight > window.innerHeight;
                this.selectColorStyle = {
                    top: isCursorNearBottom ? `${rectButton.top - colorSelectHeight - rectMenu.top - 2}px` : `${rectButton.bottom - rectMenu.top + 2}px`,
                    right: `14px`, //Все что бы оно было ровно, подсчитано эксперементальным путем. Нет, rectButton.right не сработает
                };
            });
        },
        enableContextMenu(clientY, clientX) {
            const menuOffset = 50;
            const contextMenuElement = this.$refs.contextMenu;
            this.contextMenuVisible = true;

            if (this.isSelectVisible) this.isSelectVisible = false;

            this.$nextTick(() => {
                const contextMenuHeight = contextMenuElement.offsetHeight;
                const isCursorNearTop = clientY - contextMenuHeight - menuOffset < 0;

                const topPosition = isCursorNearTop ? 10 : (clientY - contextMenuHeight - menuOffset);
                const leftPosition = this.calculateLeftPosition(clientX, contextMenuElement);

                this.contextMenuStyle = {
                    top: `${topPosition}px`,
                    left: `${leftPosition}px`,
                };
            });
        },
        calculateLeftPosition(clientX, contextMenuElement) {
            const menuWidth = contextMenuElement.getBoundingClientRect().width;
            let left = clientX - menuWidth / 2;
            if (left + menuWidth > window.innerWidth - 10) {
                left = window.innerWidth - menuWidth - 10;
            } else if (left < 320 + 10) {
                left = 320 + 10;
            }
            return left;
        },
        disableContextMenu() {
            this.contextMenuVisible = false;
            if (this.isSelectVisible) this.isSelectVisible = false;
            this.contextMenuStyle.top = '-100px';
        },
    }
};
</script>

<style>
.context-menu {
    position: fixed;
    display: inline-flex;
    z-index: 1000;
    transition: top 0.3s ease, left 0.2s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.color-options {
    position: absolute;
    z-index: 1;
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
    padding: 0.15rem 0.525rem;
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