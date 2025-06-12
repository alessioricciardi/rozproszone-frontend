<template>
  <div class="editor-wrapper">
    <div class="toolbar">
      <IconBold
        @click="toggleBold"
        :active="editor?.isActive('bold')"
      />

      <IconItalic @click="toggleItalic" :class="{ active: editor?.isActive('italic') }"/>
      <IconHeading @click="toggleHeading(1)" :class="{ active: editor?.isActive('heading', { level: 1 }) }"/>
      <IconList @click="toggleBulletList" :class="{ active: editor?.isActive('bulletList') }"/>
      <IconUploadImg @click="triggerImageUpload"/>
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        @change="addImage"
        style="display: none"
      />
      <IconMiddle @click="toggleAlignCenter" :active="editor?.isActive({ textAlign: 'center' })"/>
      <IconLeft @click="setAlignLeft" :active="editor?.isActive({ textAlign: 'left' })" />
      <IconRight @click="setAlignRight" :active="editor?.isActive({textAlign:'right'})"/>

    </div>

    <editor-content :editor="editor" class="tiptap" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import IconBold from './Buttons/IconBold.vue'
import IconItalic from './Buttons/IconItalic.vue'
import IconHeading from './Buttons/IconHeading.vue'
import IconUploadImg from './Buttons/IconUploadImg.vue'
import IconList from './Buttons/IconList.vue'
import IconMiddle from './Buttons/IconMiddle.vue'
import IconLeft from './Buttons/IconLeft.vue'
import IconRight from './Buttons/IconRight.vue'
export default {
  components: {
    EditorContent,
    IconBold,
    IconItalic,
    IconHeading,
    IconUploadImg,
    IconList,
    IconMiddle,
    IconLeft,
    IconRight,
  },

  props: {
    modelValue: {
      type: [String, Object],
      default: '',
    },
    outputFormat: {
      type: String,
      default: 'html',
    },
    placeholder: {
      type: String,
      default: 'Write something amazing...',
    },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      editor: null,
    }
  },

  watch: {
    modelValue(value) {
      if (!this.editor) return

      const currentContent =
        this.outputFormat === 'json'
          ? this.editor.getJSON()
          : this.editor.getHTML()

      const isSame =
        this.outputFormat === 'json'
          ? JSON.stringify(currentContent) === JSON.stringify(value)
          : currentContent === value

      if (!isSame) {
        this.editor.commands.setContent(value, false)
      }
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        BulletList,
        ListItem,
        Placeholder.configure({ placeholder: this.placeholder }),
        Image,
         TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ],
      content: this.modelValue,
      onUpdate: () => {
        const output =
          this.outputFormat === 'json'
            ? this.editor.getJSON()
            : this.editor.getHTML()

        this.$emit('update:modelValue', output)
      },
    })
  },

  beforeUnmount() {
    this.editor?.destroy()
  },

  methods: {
    toggleBold() {
      this.editor.chain().focus().toggleBold().run()
    },
    toggleItalic() {
      this.editor.chain().focus().toggleItalic().run()
    },
    toggleHeading(level) {
      this.editor.chain().focus().toggleHeading({ level }).run()
    },
    toggleBulletList() {
    console.log('Is bulletList active:', this.editor.isActive('bulletList'))
    },
    addImage(event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        this.editor.chain().focus().setImage({ src: reader.result }).run()
      }
      reader.readAsDataURL(file)
    },
    triggerImageUpload() {
    this.$refs.imageInput.click()
    },
    toggleAlignCenter() {
    this.editor.chain().focus().setTextAlign('center').run()
    },
    setAlignLeft() {
    this.editor.chain().focus().setTextAlign('left').run()
    },
    setAlignRight(){
      this.editor.chain().focus().setTextAlign('right').run()
    }

  },
}
</script>

<style scoped>
.editor-wrapper {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  background: #f9f9f9;
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;

}

.toolbar button {
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  color: rgb(88, 88, 88);
}

.toolbar button.active {
  background: #333;
  color: white;
}

.tiptap {
  padding: 1rem;
  min-height: 200px;
  width: 100%;
}

.tiptap img {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
}

.tiptap ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  padding-left: 1rem;
}

.tiptap li {
  margin-bottom: 0.5rem;
}

</style>
