import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

const editorStyles = `
  .ProseMirror a {
    color: #2563eb !important;
    background-color: #dbeafe !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    text-decoration: none !important;
    cursor: pointer;
    border-bottom: none !important;
    transition: all 0.15s ease;
  }
  .ProseMirror a:hover {
    color: #1d4ed8 !important;
    background-color: #bfdbfe !important;
  }
  .tiptap-editor-content .ProseMirror {
    padding: 12px;
  }
`;

const PRESET_COLORS = [
  '#000000', '#374151', '#6b7280', '#9ca3af', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

const ColorButton: React.FC<{
  editor: ReturnType<typeof useEditor>;
}> = ({ editor }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#000000');
  const currentColor = editor?.getAttributes('textStyle').color;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        title="Text Color"
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>
      {showPicker && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  editor?.chain().focus().setColor(color).run();
                  setShowPicker(false);
                }}
                className={`w-5 h-5 rounded-full border border-gray-300 hover:scale-110 transition-transform ${currentColor === color ? 'ring-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                editor?.chain().focus().setColor(e.target.value).run();
              }}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <button
              onClick={() => editor?.chain().focus().unsetColor().run()}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TooltipButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  tooltip: string;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, isActive, tooltip, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={tooltip}
    className={`p-1.5 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3 border border-gray-200 rounded-md',
      },
    },
  });

  const setLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const { from, to } = editor.state.selection;
    if (from === to) {
      editor.chain().focus().insertContent(`<a href="${url}" target="_blank">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <style>{editorStyles}</style>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <TooltipButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          tooltip="Bold (Ctrl+B)"
        >
          <span className="font-bold text-sm">B</span>
        </TooltipButton>

        <TooltipButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          tooltip="Italic (Ctrl+I)"
        >
          <span className="italic text-sm">I</span>
        </TooltipButton>

        <ColorButton editor={editor} />

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <TooltipButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          tooltip="Heading 1"
        >
          <span className="font-bold text-xs">H1</span>
        </TooltipButton>

        <TooltipButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          tooltip="Heading 2"
        >
          <span className="font-bold text-xs">H2</span>
        </TooltipButton>

        <TooltipButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          tooltip="Heading 3"
        >
          <span className="font-bold text-xs">H3</span>
        </TooltipButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <TooltipButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          tooltip="Bullet List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </TooltipButton>

        <TooltipButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          tooltip="Numbered List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </TooltipButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <TooltipButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          tooltip="Insert Link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </TooltipButton>

        <TooltipButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          isActive={false}
          tooltip="Remove Link"
          disabled={!editor.isActive('link')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m4.899-.758a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19L19 5" />
          </svg>
        </TooltipButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <TooltipButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          tooltip="Undo (Ctrl+Z)"
          disabled={!editor.can().undo()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </TooltipButton>

        <TooltipButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          tooltip="Redo (Ctrl+Y)"
          disabled={!editor.can().redo()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </TooltipButton>
      </div>

      <div className="tiptap-editor-content overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor;
