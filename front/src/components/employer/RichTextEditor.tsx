'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Quote } from 'lucide-react'

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        // Yeh line error ko fix karegi
        immediatelyRender: false, 
        editorProps: {
            attributes: {
                class: 'prose prose-indigo focus:outline-none min-h-[200px] p-6 max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) return null

    const ToolbarButton = ({ onClick, isActive, children }: any) => (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            {children}
        </button>
    )

    return (
        <div className="border border-gray-100 rounded-[1.5rem] overflow-hidden bg-gray-50/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
                    <Bold size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
                    <Italic size={18} />
                </ToolbarButton>
                <div className="w-[1px] h-6 bg-gray-100 mx-1 self-center" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
                    <List size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
                    <ListOrdered size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
                    <Quote size={18} />
                </ToolbarButton>
            </div>
            
            {/* Editor Area */}
            <EditorContent editor={editor} />
        </div>
    )
}

export default RichTextEditor