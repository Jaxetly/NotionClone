<template>
    <div @contextmenu.prevent="switchContextMenu" @click="focus" ref="editor">
        <editor-content  />
        <div v-if="editor != null">
            <ContextButtons 
                :editor="editor"
                ref="contextMenu"
                class="rounded-lg bg-gray-950 text-white"
            />
        </div>
    </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Code from '@tiptap/extension-code'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { keymap } from 'prosemirror-keymap';
import { insertText } from 'prosemirror-commands';
import ContextButtons from './ContextButtons.vue'

export default {
    components: {
        EditorContent,
        ContextButtons,
    },
    props: {
        initContent: String
    },
    data() {
        return {
            editor: null,
            autosaveTimerId: null,
            content: '',
            contextMenuVisible: false,
            contextMenuStyle: {
                top: '0px',
            }
        };
    },
    mounted() {
        this.editor = new Editor({
            element: this.$refs.editor,
            extensions: [
                StarterKit,
                Underline,
                Color,
                TextStyle.configure({ types: [ListItem.name] }),
                Link.configure({
                    HTMLAttributes: {
                        class: 'link',
                    }
                }),
                Code.configure({
                    HTMLAttributes: {
                        class: 'code-selection text-slate-100 bg-gray-700 font-normal',
                    }
                }),
                keymap({'Tab': (state, dispatch) => {
                    const { from, to } = state.selection;
                    const text = '    ';
                    if (dispatch) {
                        dispatch(state.tr.insertText(text, from, to));
                    }
                    return true;
                }}),
            ],
            editorProps: {
                attributes: {
                    class: 'h-100 prose-invert prose prose-lg xl:prose-2xl m-5 py-5 focus:outline-none max-w-screen-xl block w-full strong',
                },
            },
            content: this.content,
            onUpdate: ({ editor }) => {
                this.content = editor.getHTML();
                this.$emit('updateContent', this.content);
            },
            onCreate: () => {
                if (this.initContent) {
                    this.editor.commands.setContent(this.initContent);
                }
            }
        });
    },
    watch: {
        initContent: {
            handler(newContent) {
                this.editor.commands.setContent(newContent);
            },
        },
    },
    methods: {
        focus(event) {
            this.editor.chain().focus();
        },
        switchContextMenu(event) {
            this.$refs.contextMenu.switchContextMenu(event);
        },
    },
    beforeDestroy() {
        this.editor.destroy();
    },
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

.code-selection {
    border-radius: .4rem;
    padding: .25em .3em;
}

.code-selection:before, .code-selection:after {
    content: '';
}

.no-border {
    text-decoration: none;
    border: none;
    outline: none;
}

.link {
    color: #958DF1;
    cursor: pointer;
}

.strong strong {
    color: inherit;
}
</style>