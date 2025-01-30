<template>
    <div class="context-group">
        <h6 class="context-group-title">{{ title }}</h6>
        <button 
            v-for="(button, buttonIndex) in buttons" 
            :key="buttonIndex" 
            @click="doAction(button)"
            :disabled="isDisabled(button)" 
            :class="{ 'bg-blue-500': isActive(button), 'btn bg-gray-700 mr-1 mt-1 rounded': true }"
            :title="button.label"
        >
            <i :class="button.icon"></i>
        </button>
    </div>
</template>

<script>
export default {
    props: {
        title: String,
        buttons: Array,
        editor: Object
    },
    methods: {
        getAction(button) {
            const actions = {
                toggleHeading: () => this.editor.chain().focus()[button.action]({ level: button.level }).run,
                setLink: () => {
                    const url = window.prompt('URL');
                    if (url) {
                        return this.editor.chain().focus().extendMarkRange('link')[button.action]({ href: url }).run;
                    }
                },
                addImage: () => {
                    const url = window.prompt('URL');
                    if (url) {
                        return this.editor.chain().focus().setImage({ src: url }).run;
                    }
                },
                default: () => this.editor.chain().focus()[button.action]().run,
            };
            return (actions[button.action] || actions.default)();
        },
        doAction(button) {
            this.getAction(button)();
        },
        isDisabled(button) {
            if (button.isUndoRedo) {
                return !this.editor.can()[button.action]();
            }
            if (button.action === 'toggleHeading' && button.level !== undefined) {
                return !this.editor.can()[button.action]({ level: button.level });
            }
            if (button.isClear || ['setLink', 'addImage'].includes(button.action)) {
                return false;
            }
            return !this.editor.can()[button.action]();
        },
        isActive(button) {
            const activeChecks = {
                toggleBold: () => this.editor.isActive('bold'),
                toggleItalic: () => this.editor.isActive('italic'),
                toggleStrike: () => this.editor.isActive('strike'),
                toggleUnderline: () => this.editor.isActive('underline'),
                toggleCode: () => this.editor.isActive('code'),
                setLink: () => this.editor.isActive('link'),
                toggleHeading: () => this.editor.isActive('heading', { level: button.level }),
                default: () => this.editor.isActive(button.action),
            };
            return (activeChecks[button.action] || activeChecks.default)();
        },
    }
};
</script>