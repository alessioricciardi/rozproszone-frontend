<script setup lang="ts">
// Editor core
import { EditorContent, useEditor, VueNodeViewRenderer } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

// Extensions
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import SuperScript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import type { DropdownMenuItem } from '@nuxt/ui'
import { TiptapButton, UDropdownMenu } from '#components'
import ImageView from './ImageView.vue'


// Props & Emits
interface EditorData {
  html: string
  images: string[]
}

const props = defineProps<{ modelValue: EditorData; showImage?: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: EditorData): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const showLinkModal = ref(false)
const linkUrl = ref('')

const API_URL = useRuntimeConfig().public.API_URL

const uploadedImageNames = computed(() => props.modelValue.images)

const CustomImage = Image.extend({
  name: 'image',
  group: 'block',
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: 'auto',
        parseHTML: el => el.getAttribute('width') || 'auto',
        renderHTML: attrs => ({ width: attrs.width }),
      },
      height: {
        default: 'auto',
        parseHTML: el => el.getAttribute('height') || 'auto',
        renderHTML: attrs => ({ height: attrs.height }),
      },
      dataAlign: {
        default: 'left',
        renderHTML: attrs => ({
          'data-align': attrs.dataAlign,
          class: `align-${attrs.dataAlign}`,
        }),
        parseHTML: el => ({
          dataAlign: el.getAttribute('data-align') || 'left',
        }),
      },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageView) 
  },
})

const editor = useEditor({
  content: props.modelValue.html,
  extensions: [
    StarterKit,
    Underline,
    Highlight,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    SuperScript,
    Subscript,
    CustomImage,
    Dropcursor,
    Gapcursor,
    Link.configure({
      defaultProtocol: 'https',
      protocols: ['https', 'mailto', 'tel', 'http', 'ftp'],
      HTMLAttributes: { target: '_blank' },
    }),
    Table.configure({ resizable: true }),
    TableCell,
    TableHeader,
    TableRow,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', {
      html: editor.getHTML(),
      images: getCurrentImagesFromDocument(editor),
    })
  },
})

watch(
  () => props.modelValue.html,
  (newHtml) => {
    if (editor.value && newHtml.trim() !== editor.value.getHTML().trim()) {
      editor.value.commands.setContent(newHtml, false)
    }
  },
)

function getCurrentImagesFromDocument(editorInstance: typeof editor.value): string[] {
  const imageUrls: string[] = []
  editorInstance.state.doc.descendants((node) => {
    if (node.type.name === 'image' && node.attrs.src) {
      const src: string = node.attrs.src
      const fileName = src.split('/').pop()
      if (fileName) imageUrls.push(fileName)
    }
  })
  return imageUrls
}


const onImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !editor.value) return

  const formData = new FormData()
  formData.append('file', file)

  try {

    const response = await $fetch<{ fileName: string; url: string }>(
      `${API_URL}/api/Image/bulletin`,
      {
        method: 'POST',
        body: formData,
      },
    )

    const fullImageUrl = `${API_URL}${response.url}`

    editor.value.chain().focus().setImage({ src: fullImageUrl }).run()
    console.log(editor.value.getHTML())


    emit('update:modelValue', {
      html: editor.value.getHTML(),
      images: [...uploadedImageNames.value, response.fileName],
    })

    if (fileInput.value) fileInput.value.value = ''
  } catch (err) {
    console.error('Błąd podczas uploadu obrazka:', err)
  }
}

async function removeImage(fileName: string) {
  if (!editor.value) return

  const imageUrl = `${API_URL}/uploads/bulletins/${fileName}`

  const { state } = editor.value
  const tr = state.tr
  let updated = false

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'image' && node.attrs.src === imageUrl) {
      tr.delete(pos, pos + node.nodeSize)
      updated = true
    }
  })

  if (updated) {
    editor.value.view.dispatch(tr)

    const newHtml = editor.value.getHTML()
    
    emit('update:modelValue', {
      html: newHtml,
      images: getCurrentImagesFromDocument(editor.value),
    })

    editor.value.commands.setContent(newHtml, false)
  }

  //Usuń z backendu
  try {
    await $fetch(`${API_URL}/api/Image/bulletin`, {
      method: 'DELETE',
      query: { fileName },
    })
  } catch (e) {
    console.error('Błąd usuwania obrazu z backendu:', e)
    alert('Nie udało się usunąć obrazu z serwera.')
  }
}
defineExpose({
  removeImage,
})

// Link modal
const isLinkSelected = computed(() => !!editor.value?.isActive('link'))

function unsetLink() {
  if (!editor.value) return
  editor.value.chain().focus().unsetLink().run()
  closeLinkModal()
}

function closeLinkModal() {
  showLinkModal.value = false
  linkUrl.value = ''
}

function applyLink() {
  if (!editor.value) return
  const href = linkUrl.value.trim()
  if (!href) return unsetLink()

  const { state } = editor.value
  const { empty } = state.selection

  editor.value
    .chain()
    .focus()
    .insertContent(empty ? `<a href="${href}" target="_blank">${href}</a>` : '')
    .extendMarkRange('link')
    .setLink({ href })
    .run()

  closeLinkModal()
}

// Link keyboard removal
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === ' ' && editor.value?.isActive('link')) {
    editor.value.commands.unsetLink()
  }
}

onMounted(() => {
  editor.value?.view.dom?.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  editor.value?.view.dom?.removeEventListener('keydown', onKeydown)
  editor.value?.destroy()
})

// Dropdown menus
const headerList = ref<DropdownMenuItem[]>([
  { icon: 'i-material-symbols-format-h1-rounded', slot: 'h1', label: '' },
  { icon: 'i-material-symbols-format-h2-rounded', slot: 'h2', label: '' },
  { icon: 'i-material-symbols-format-h3-rounded', slot: 'h3', label: '' },
  { icon: 'i-material-symbols-format-h4-rounded', slot: 'h4', label: '' },
  { icon: 'i-material-symbols-format-h5-rounded', slot: 'h5', label: '' },
  { icon: 'i-material-symbols-format-h6-rounded', slot: 'h6', label: '' },
])

const tableList = ref<DropdownMenuItem[]>([
  { icon: 'i-mdi-table-plus', slot: 'insert-table', label: '' },
  { icon: 'i-mdi-table-check', slot: 'fix-tables', label: '' },
  { icon: 'i-mdi-table-remove', slot: 'delete-table', label: '' },
  { icon: '', slot: 'add-column-before', label: '' },
  { icon: '', slot: 'add-column-after', label: '' },
  { icon: '', slot: 'delete-column', label: '' },
  { icon: '', slot: 'add-row-before', label: '' },
  { icon: '', slot: 'add-row-after', label: '' },
  { icon: '', slot: 'delete-row', label: '' },
  { icon: '', slot: 'toggle-header-row', label: '' },
  { icon: '', slot: 'toggle-header-column', label: '' },
  { icon: '', slot: 'toggle-header-cell', label: '' },
  { icon: '', slot: 'merge-cells', label: '' },
  { icon: '', slot: 'split-cell', label: '' },
])
</script>

<template>
  <div class="w-full gap-1 text-gray-900">
    <!-- Editor loaded -->
    <template v-if="editor">
      <!-- Formatters -->
      <div class="mb-4 flex flex-row flex-wrap gap-2">
        <!-- Bold -->
        <TiptapButton
          tooltip="Bold"
          :disabled-binding="!editor.can().chain().focus().toggleBold().run()"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('bold'),
            'text-blue-600': editor.isActive('bold'),
          }"
          icon="i-material-symbols-format-bold-rounded"
          @click.stop="editor.chain().focus().toggleBold().run()"
        />

        <!-- Italic -->
        <TiptapButton
          tooltip="Italic"
          :disabled-binding="!editor.can().chain().focus().toggleItalic().run()"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('italic'),
            'text-blue-600': editor.isActive('italic'),
          }"
          icon="i-material-symbols-format-italic-rounded"
          @click="editor.chain().focus().toggleItalic().run()"
        />

        <!-- Underline -->
        <TiptapButton
          tooltip="Underline"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('underline'),
            'text-blue-600': editor.isActive('underline'),
          }"
          icon="i-material-symbols-format-underlined-rounded"
          @click="editor.chain().focus().toggleUnderline().run()"
        />

        <!-- Strikethrough -->
        <TiptapButton
          tooltip="Strikethrough"
          :disabled-binding="!editor.can().chain().focus().toggleStrike().run()"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('strike'),
            'text-blue-600': editor.isActive('strike'),
          }"
          icon="i-material-symbols-format-strikethrough-rounded"
          @click="editor.chain().focus().toggleStrike().run()"
        />

        <!-- Highlight -->
        <TiptapButton
          tooltip="Highlight"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('highlight'),
            'text-blue-600': editor.isActive('highlight'),
          }"
          icon="i-material-symbols-highlighter-size-4"
          @click="editor.chain().focus().toggleHighlight().run()"
        />

        <!-- ALIGNMENT -->

        <!-- Align Left -->
        <TiptapButton
          tooltip="Text Align Left"
          icon="i-material-symbols-format-align-left-rounded"
          :class-binding="{
            'bg-gray-300/50': editor.isActive({ textAlign: 'left' }),
            'text-blue-600': editor.isActive({ textAlign: 'left' }),
          }"
          @click="editor.chain().focus().setTextAlign('left').run()"
        />

        <!-- Align Center -->
        <TiptapButton
          tooltip="Text Align Center"
          icon="i-material-symbols-format-align-center-rounded"
          :class-binding="{
            'bg-gray-300/50': editor.isActive({ textAlign: 'center' }),
            'text-blue-600': editor.isActive({ textAlign: 'center' }),
          }"
          @click="editor.chain().focus().setTextAlign('center').run()"
        />

        <!-- Align Right -->
        <TiptapButton
          tooltip="Text Align Right"
          icon="i-material-symbols-format-align-right-rounded"
          :class-binding="{
            'bg-gray-300/50': editor.isActive({ textAlign: 'right' }),
            'text-blue-600': editor.isActive({ textAlign: 'right' }),
          }"
          @click="editor.chain().focus().setTextAlign('right').run()"
        />

        <!-- Superscript -->
        <TiptapButton
          tooltip="Superscript"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('superscript'),
            'text-blue-600': editor.isActive('superscript'),
          }"
          icon="i-material-symbols-superscript-rounded"
          @click="editor.chain().focus().toggleSuperscript().run()"
        />

        <!-- Subscript -->
        <TiptapButton
          tooltip="Subscript"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('subscript'),
            'text-blue-600': editor.isActive('subscript'),
          }"
          icon="i-material-symbols-subscript-rounded"
          @click="editor.chain().focus().toggleSubscript().run()"
        />

        <!-- Code -->
        <TiptapButton
          tooltip="Code"
          :disabled-binding="!editor.can().chain().focus().toggleCode().run()"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('code'),
            'text-blue-600': editor.isActive('code'),
          }"
          icon="i-material-symbols-code"
          @click="editor.chain().focus().toggleCode().run()"
        />

        <!-- Paragraph -->
        <TiptapButton
          tooltip="Paragraph"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('paragraph'),
            'text-blue-600': editor.isActive('paragraph'),
          }"
          icon="i-material-symbols-format-paragraph"
          @click="editor.chain().focus().setParagraph().run()"
        />
        <div v-if="showImage" class="flex items-center gap-2">
          <!--Images-->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageUpload"
          >
          <!--Insert-->
          <TiptapButton
            tooltip="Insert Image"
            icon="i-material-symbols-image-rounded"
            :class-binding="{}"
            @click="() => fileInput?.click()"
          />
          <!--Iamage right-->
          <TiptapButton
            tooltip="Align image left"
            icon="i-material-symbols-format-align-left-rounded"
            :class-binding="{
              'bg-gray-300/50': editor.isActive('heading'),
              'text-blue-600': editor.isActive('heading'),
            }"
            @click="
              editor
                .chain()
                .focus()
                .updateAttributes('image', { dataAlign: 'left' })
                .run()
            "
          />
          <!--Image center-->
          <TiptapButton
            tooltip="Align image center"
            icon="i-material-symbols-format-align-center-rounded"
            :class-binding="{
              'bg-gray-300/50': editor.isActive('heading'),
              'text-blue-600': editor.isActive('heading'),
            }"
            @click="
              editor
                .chain()
                .focus()
                .updateAttributes('image', { dataAlign: 'center' })
                .run()
            "
          />
          <!--Image right-->
          <TiptapButton
            tooltip="Align image right"
            icon="i-material-symbols-format-align-right-rounded"
            :class-binding="{
              'bg-gray-300/50': editor.isActive('heading'),
              'text-blue-600': editor.isActive('heading'),
            }"
            @click="
              editor
                .chain()
                .focus()
                .updateAttributes('image', { dataAlign: 'right' })
                .run()
            "
          />
        </div>

        <!-- Heading -->
        <UDropdownMenu
          :items="headerList"
          :content="{
            align: 'center',
            side: 'right',
            sideOffset: 0,
            positionStrategy: 'absolute',
          }"
          :ui="{
            group: 'flex ',
            item: 'hover:bg-white',
          }"
        >
          <!-- Main Heading Button -->
          <UButton
            icon="i-material-symbols-h-mobiledata-rounded"
            variant="ghost"
            class="text-2xl text-gray-900 hover:bg-gray-300/80"
            :class="{
              'bg-gray-300/50': editor.isActive('heading'),
              'text-blue-600': editor.isActive('heading'),
            }"
          />

          <!-- Heading Dropdown -->
          <template #h1>
            <UButton
              icon="i-material-symbols-format-h1-rounded"
              variant="ghost"
              class="flex w-full text-2xl text-gray-900"
              :class="{
                'bg-gray-300/50': editor?.isActive('heading', {
                  level: 1,
                }),
                'text-blue-600': editor?.isActive('heading', {
                  level: 1,
                }),
              }"
              @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
            />
          </template>

          <template #h2>
            <UButton
              icon="i-material-symbols-format-h2-rounded"
              variant="ghost"
              class="w-full text-2xl text-gray-900 hover:bg-gray-300/80"
              :class="{
                'bg-gray-300/50': editor?.isActive('heading', {
                  level: 2,
                }),
                'text-blue-600': editor?.isActive('heading', {
                  level: 2,
                }),
              }"
              @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
            />
          </template>

          <template #h3>
            <UButton
              icon="i-material-symbols-format-h3-rounded"
              variant="ghost"
              class="w-full text-2xl text-gray-900 hover:bg-gray-300/80"
              :class="{
                'bg-gray-300/50': editor?.isActive('heading', {
                  level: 3,
                }),
                'text-blue-600': editor?.isActive('heading', {
                  level: 3,
                }),
              }"
              @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
            />
          </template>

          <template #h4>
            <UButton
              icon="i-material-symbols-format-h4-rounded"
              variant="ghost"
              class="w-full text-2xl text-gray-900 hover:bg-gray-300/80"
              :class="{
                'bg-gray-300/50': editor?.isActive('heading', {
                  level: 4,
                }),
                'text-blue-600': editor?.isActive('heading', {
                  level: 4,
                }),
              }"
              @click="editor?.chain().focus().toggleHeading({ level: 4 }).run()"
            />
          </template>

          <template #h5>
            <UButton
              icon="i-material-symbols-format-h5-rounded"
              variant="ghost"
              class="w-full text-2xl text-gray-900 hover:bg-gray-300/80"
              :class="{
                'bg-gray-300/50': editor?.isActive('heading', {
                  level: 5,
                }),
                'text-blue-600': editor?.isActive('heading', {
                  level: 5,
                }),
              }"
              @click="editor?.chain().focus().toggleHeading({ level: 5 }).run()"
            />
          </template>

          <template #h6>
            <UButton
              icon="i-material-symbols-format-h6-rounded"
              variant="ghost"
              class="w-full text-2xl text-gray-900 hover:bg-gray-300/80"
              :class="{
                'bg-gray-300/50': editor?.isActive('heading', {
                  level: 6,
                }),
                'text-blue-600': editor?.isActive('heading', {
                  level: 6,
                }),
              }"
              @click="editor?.chain().focus().toggleHeading({ level: 6 }).run()"
            />
          </template>
        </UDropdownMenu>

        <!-- Lists -->

        <!-- Bullet List -->
        <TiptapButton
          tooltip="Bullet List"
          icon="i-material-symbols-format-list-bulleted-rounded"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('bulletList'),
            'text-blue-600': editor.isActive('bulletList'),
          }"
          @click="editor.chain().focus().toggleBulletList().run()"
        />

        <!-- Ordered List -->
        <TiptapButton
          tooltip="Ordered List"
          icon="i-material-symbols-format-list-numbered-rounded"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('orderedList'),
            'text-blue-600': editor.isActive('orderedList'),
          }"
          @click="editor.chain().focus().toggleOrderedList().run()"
        />

        <TiptapButton
          tooltip="Check List"
          icon="i-material-symbols-checklist-rounded"
          :class-binding="{
            'bg-gray-300/50': editor.isActive('taskList'),
            'text-blue-600': editor.isActive('taskList'),
          }"
          @click="editor.chain().focus().toggleTaskList().run()"
        />

        <!--modal-->
        <!--test modal-->
        <div class="relative inline-block">
          <TiptapButton
            tooltip="Link"
            icon="i-material-symbols-attachment-rounded"
            :class-binding="{
              'bg-gray-200': showLinkModal,
              'text-blue-600': showLinkModal,
            }"
            @click="showLinkModal = true"
          />
          <!-- Popup -->
          <div
            v-if="showLinkModal"
            ref="linkModal"
            class="absolute z-50 mt-2 w-80 rounded-xl bg-white p-6 shadow-xl"
          >
            <button
              class="absolute top-3 right-3 text-gray-500 hover:text-black"
              @click="closeLinkModal"
            >
              ✕
            </button>
            <h2 class="mb-4 text-lg font-bold">Wstaw lub edytuj link</h2>
            <label class="mb-2 block text-sm">Adres URL:</label>
            <input
              v-model="linkUrl"
              type="text"
              class="mb-4 w-full rounded border px-3 py-2"
              placeholder="https://example.com"
            >
            <div class="flex justify-end gap-2">
              <button
                v-if="isLinkSelected"
                class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                @click="unsetLink"
              >
                Usuń link
              </button>
              <button
                class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                @click="applyLink"
              >
                Zastosuj
              </button>
            </div>
          </div>
        </div>
        <UDropdownMenu
          :items="tableList"
          :content="{
            align: 'center',
            side: 'right',
            sideOffset: 0,
            positionStrategy: 'absolute',
          }"
          :ui="{
            group: 'flex',
          }"
        >
          <TiptapButton
            tooltip="Table"
            icon="i-material-symbols-table-chart"
            :class-binding="{ 'dark:bg-gray-700/50': editor.isActive('table') }"
          />
          <template #insert-table>
            <TiptapButton
              tooltip="Insert Table"
              icon="i-mdi-table-plus"
              :class-binding="{}"
              @click="
                editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
              "
            />
          </template>
          <template #delete-table>
            <TiptapButton
              tooltip="Delete Table"
              :class-binding="{}"
              icon="i-mdi-table-remove"
              @click="editor.chain().focus().deleteTable().run()"
            />
          </template>
          <template #fix-tables>
            <TiptapButton
              tooltip="Fix Tables"
              icon="i-mdi-table-check"
              :class-binding="{}"
              @click="editor.chain().focus().fixTables().run()"
            />
          </template>
          <template #add-column-before>
            <TiptapButton
              tooltip="Add Column Before"
              icon="i-material-symbols-add-column-left-rounded"
              :class-binding="{}"
              @click="editor.chain().focus().addColumnBefore().run()"
            />
          </template>
          <template #add-column-after>
            <TiptapButton
              tooltip="Add Column After"
              icon="i-material-symbols-add-column-right-rounded"
              :class-binding="{}"
              @click="editor.chain().focus().addColumnAfter().run()"
            />
          </template>
          <template #delete-column>
            <TiptapButton
              tooltip="Delete Column"
              icon="i-mdi-table-column-remove"
              :class-binding="{}"
              @click="editor.chain().focus().deleteColumn().run()"
            />
          </template>
          <template #add-row-before>
            <TiptapButton
              tooltip="Add Row Before"
              icon="i-material-symbols-add-row-above-rounded"
              :class-binding="{}"
              @click="editor.chain().focus().addRowBefore().run()"
            />
          </template>
          <template #add-row-after>
            <TiptapButton
              tooltip="Add Row After"
              icon="i-material-symbols-add-row-below-rounded"
              :class-binding="{}"
              @click="editor.chain().focus().addRowAfter().run()"
            />
          </template>
          <template #delete-row>
            <TiptapButton
              tooltip="Delete Row"
              icon="i-mdi-table-row-remove"
              :class-binding="{}"
              @click="editor.chain().focus().deleteRow().run()"
            />
          </template>
          <template #toggle-header-row>
            <TiptapButton
              tooltip="Toggle Header Row"
              icon="i-material-symbols-table-rows-rounded"
              :class-binding="{}"
              @click="editor.chain().focus().toggleHeaderRow().run()"
            />
          </template>
          <template #toggle-header-column>
            <TiptapButton
              tooltip="Toggle Header Column"
              icon="i-material-symbols-view-column-rounded"
              :class-binding="{}"
              @click="editor.chain().focus().toggleHeaderColumn().run()"
            />
          </template>
          <template #toggle-header-cell>
            <TiptapButton
              tooltip="Toggle Header Cell"
              icon="i-material-symbols-square-rounded"
              :class-binding="{}"
              @click="editor.chain().focus().toggleHeaderCell().run()"
            />
          </template>
          <template #merge-cells>
            <TiptapButton
              tooltip="Merge Cells"
              icon="i-mdi-table-merge-cells"
              :class-binding="{}"
              @click="editor.chain().focus().mergeCells().run()"
            />
          </template>

          <template #split-cell>
            <TiptapButton
              tooltip="Split Cells "
              icon="i-mdi-table-split-cell"
              :class-binding="{}"
              @click="editor.chain().focus().splitCell().run()"
            />
          </template>
        </UDropdownMenu>
        <!--end-->
      </div>
      <!-- Text editor -->
      <EditorContent
        :editor="editor"
        class="tiptap min-h-30 w-full rounded-lg border-2 border-gray-900 p-2"
      />
      <!-- Lista przesłanych obrazów 
      <div v-if="uploadedImageNames.length" class="mt-6">
        <h3 class="text-sm font-bold mb-2">Przesłane obrazy:</h3>
        <ul class="flex flex-wrap gap-4 list-none p-0">
          <li
            v-for="(name, index) in uploadedImageNames"
            :key="index"
            class="relative"
          >
            <img
              :src="`${backendBaseUrl}/uploads/bulletins/${name}`"
              alt="Miniatura"
              class="w-24 h-24 object-cover rounded shadow"
            >
            <UButton
              icon="typcn:delete"
              class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              @click="removeImage(name)"
            />
          </li>
        </ul>
      </div>
    -->
      <div v-if="uploadedImageNames.length" class="mt-6">
        <h3 class="mb-2 text-sm font-bold">Przesłane obrazy:</h3>
        <ul class="flex list-none flex-wrap gap-4 p-0">
          <li
            v-for="(name, index) in uploadedImageNames"
            :key="index"
            class="relative"
          >
            <img
              :src="`${API_URL}}/uploads/bulletins/${name}`"
              alt="Miniatura"
              class="h-24 w-24 rounded object-cover shadow"
            >
            <UButton
              icon="typcn:delete"
              class="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              @click="removeImage(name)"
            />
          </li>
        </ul>
      </div>
    </template>
    <!-- Editor loading -->
    <template v-else>
      <div class="flex justify-center">
        <span class="loading loading-spinner mr-3 text-blue-600" />
        Loading Editor...
      </div>
    </template>
  </div>
</template>

<style>
.tiptap img {
  max-width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
  cursor: grab;
  user-select: none;
  resize: both;
  overflow: hidden;
}

.tiptap div[draggable='true'] {
  display: inline-block;
}

.drag-handle {
  cursor: grab;
  width: 16px;
  height: 16px;
  background-color: #ccc;
  border-radius: 50%;
  margin-right: 8px;
}

.image-container:active {
  cursor: grabbing;
}

.tiptap img.align-left {
  display: block;
  margin: 0 auto 0 0;
}

.tiptap img.align-center {
  display: block;
  margin: 0 auto;
}

.tiptap img.align-right {
  display: block;
  margin: 0 0 0 auto;
}

.tiptap table {
  width: 100%;
  border-collapse: collapse;
  object-fit: contain;
  max-width: 100%;
  min-width: 100%;
  table-layout: auto;
}

.tiptap th,
td {
  border: 1px solid #000000;
  padding: 0.5rem;
  word-break: break-word;
  white-space: normal;
  vertical-align: top;
  padding: 0.5rem;
}

.tiptap thead {
  background-color: #f0f0f0;
}

.resizable-image-wrapper {
  display: inline-block;
}

.resizable-image-wrapper img {
  display: block;
  max-width: 100%;
}

.resizable-image-wrapper span {
  border-radius: 2px;
}

</style>
