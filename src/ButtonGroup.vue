<template>
    <div class="context-group">
        <h6 class="context-group-title">{{ title }}</h6>
        <button 
            v-for="(button, buttonIndex) in buttons"
            @click.stop="(event) => doAction(button, event)"
            :disabled="isDisabled(button)" 
            :class="[{ 'active': isActive(button)}, 'btn btn-context']"
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
        doAction(button, event) {
            const { action, level } = button;
            const actions = {
                toggleHeading: () => this.editor.chain().focus()[action]({ level }).run(),
                setLink: () => this.promptUrl(url => this.editor.chain().focus().extendMarkRange('link')[action]({ href: url }).run()),
                addImage: () => this.promptUrl(url => this.editor.chain().focus().setImage({ src: url }).run()),
                toggleSelect: () => this.$emit('toggleSelect', event),
                default: () => this.editor.chain().focus()[action]().run(),
            };
            (actions[action] || actions.default)();
        },
        promptUrl(callback) {
            const url = window.prompt('URL');
            if (url) callback(url);
        },
        isDisabled(button) {
            const { action, level, isUndoRedo, isClear } = button;
            if (isUndoRedo) {
                return !this.editor.can()[button.action]();
            }
            if (action === 'toggleHeading' && level) {
                return !this.editor.can()[button.action]({ level: button.level });
            }
            if (isClear || ['setLink', 'addImage', 'toggleSelect'].includes(action)) {
                return false;
            }
            return !this.editor.can()[button.action]();
        },
        isActive(button) {
            const { action, level } = button;
            const activeChecks = {
                toggleBold: () => this.editor.isActive('bold'),
                toggleItalic: () => this.editor.isActive('italic'),
                toggleStrike: () => this.editor.isActive('strike'),
                toggleUnderline: () => this.editor.isActive('underline'),
                toggleCode: () => this.editor.isActive('code'),
                setLink: () => this.editor.isActive('link'),
                toggleHeading: () => this.editor.isActive('heading', { level }),
                default: () => this.editor.isActive(action),
            };
            return (activeChecks[action] || activeChecks.default)();
        },
    }
};
</script>