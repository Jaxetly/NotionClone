<template>
    <div @contextmenu.prevent="toggleContextMenu" @click="focus" ref="editor">
        <editor-content  />
        <div v-if="editor != null">
            <ContextButtons 
                :editor="editor"
                :editorElement="$refs.editor.__vue__.$el"
                ref="contextMenu"
                class="rounded-lg bg-gray-800 text-white"
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
            debounceTimerId: null,
            content: '',
            contextMenuCall: false,
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
                })
            ],
            editorProps: {
                attributes: {
                    class: 'h-100 prose-invert prose prose-lg xl:prose-2xl m-5 py-10 focus:outline-none max-w-screen-xl block w-full strong',
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
            },
            onSelectionUpdate: ({editor}) => {
                if (this.debounceTimerId) clearTimeout(this.debounceTimeout);

                this.debounceTimerId = setTimeout(() => {
                    if(this.contextMenuCall) {
                        this.contextMenuCall = false;
                        return;
                    }

                    const { from, to } = editor.state.selection;
                    if (from === to) {
                        this.$refs.contextMenu.disableContextMenu();
                    } else {

                        try {
                            const coords = editor.view.coordsAtPos(from);
                            if (coords) {
                                this.$refs.contextMenu.enableContextMenu(coords.top);
                            } else {
                                console.error('coords is undefined');
                                this.$refs.contextMenu.disableContextMenu();
                            }
                        } catch (error) {
                            console.error('Error handling selection update:', error);
                            this.$refs.contextMenu?.disableContextMenu();
                        }
                    }
                }, 110);
            }
        });
    },
    watch: {
        initContent(newContent) {
            this.editor.commands.setContent(newContent);
        },
    },
    methods: {
        focus(event) {
            this.editor.chain().focus();
        },
        toggleContextMenu(event) {
            this.contextMenuCall = true;
            this.$refs.contextMenu.enableContextMenu(event.clientY);
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

.py-10 {
    padding: 10rem 0;
}

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