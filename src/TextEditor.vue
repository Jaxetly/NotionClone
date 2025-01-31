<template>
    <div @contextmenu.prevent="toggleContextMenu" @click="focus" ref="editor">
        <EditorContent />
        <ContextButtons 
            v-if="editor"
            :editor="editor"
            ref="contextMenu"
        />
    </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import Code from '@tiptap/extension-code';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import ContextButtons from './ContextButtons.vue';

export default {
    components: {
        EditorContent,
        ContextButtons,
    },
    props: {
        content: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            editor: null,
            contextMenuCall: 0,
        };
    },
    mounted() {
        this.setEditor();
    },
    methods: {
        setEditor() {
            this.editor = new Editor({
                element: this.$refs.editor,
                extensions: [
                    StarterKit.configure({ code: false }),
                    Underline,
                    Color,
                    Image,
                    TextStyle.configure({ types: [ListItem.name] }),
                    Link.configure({ HTMLAttributes: { class: 'link' } }),
                    Code.configure({ HTMLAttributes: { class: 'code-selection text-slate-100 bg-gray-700 font-normal' } })
                ],
                editorProps: {
                    attributes: {
                        class: 'h-100 prose-invert prose prose-lg xl:prose-2xl m-5 py-10 focus:outline-none max-w-screen-xl block w-full strong',
                    },
                },
                content: this.content,
                onUpdate: ({ editor }) => {
                    this.$emit('updateContent', editor.getHTML());
                },
                onSelectionUpdate: ({editor}) => {
                    if(this.contextMenuCall > 0) {
                        this.contextMenuCall -= 1;
                        return;
                    }
                    this.handleSelectionUpdate(editor);
                }
            });
        },
        resetEditor() {
            this.editor.destroy();
            this.setEditor();
        },
        focus(event) {
            this.editor.chain().focus();
            if(this.contextMenuCall > 0) { 
                this.contextMenuCall -= 1;
                this.disableContextButtons();
            }
        },
        handleSelectionUpdate(editor) {
            this.$nextTick(() => {
                const { from, to } = editor.state.selection;
                if (from === to) {
                    this.disableContextButtons();
                    return;
                }

                const selectedNodes = [];
                editor.state.doc.nodesBetween(from, to, (node) => {
                    selectedNodes.push(node);
                });
                if (selectedNodes.some(node => node.type.name === 'image')) { 
                    return; //Почему-то при нажатии на картинку она именно выделяется, и нерпавильно отрабатывает вызов контекстного меню, этот кусочек - предотвращение такого поведения
                }

                const coords = editor.view.coordsAtPos(from);
                if (coords) this.enableContextButtons(coords.top, coords.left);
            });
        },
        handleContextButtonClick(event) {
            event.stopPropagation();
        },
        toggleContextMenu(event) {
            this.contextMenuCall = 2; //Интересный факт! onSelectionUpdate обрабатывается значительно раньше @click="focus", из-за этого contextMenuCall не boolean, а int.
            this.enableContextButtons(event.clientY, event.clientX);
        },
        disableContextButtons() {
            this.$refs.contextMenu.disableContextMenu();
        },
        enableContextButtons(top, left) {
            this.$refs.contextMenu.enableContextMenu(top, left);
        }
    },
    beforeDestroy() {
        this.editor.destroy();
    },
};
</script>

<style>
img {
    display: block;
    height: auto;
    margin: 1.5rem 0;
    max-width: 100%;
}

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