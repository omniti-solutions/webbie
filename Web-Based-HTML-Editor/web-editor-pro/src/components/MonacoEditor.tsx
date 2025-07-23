'use client';

import { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { EditableFile } from '@/types/editor';

interface MonacoEditorProps {
  file: EditableFile;
  onChange: (content: string) => void;
  onError?: (error: Error) => void;
}

export default function MonacoEditor({ file, onChange, onError }: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    if (monacoRef.current) {
      configureMonaco(monacoRef.current);
    }
  }, []);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    configureMonaco(monaco);

    // Set up auto-formatting on save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  const configureMonaco = (monaco: Monaco) => {
    // Configure HTML language settings
    monaco.languages.html.htmlDefaults.setOptions({
      format: {
        tabSize: 2,
        insertSpaces: true,
        wrapLineLength: 120,
        unformatted: 'default": "a, abbr, acronym, b, bdo, big, br, button, cite, code, dfn, em, i, img, input, kbd, label, map, mark, meter, noscript, object, output, progress, q, ruby, s, samp, script, select, small, span, strong, sub, sup, textarea, time, tt, u, var, wbr',
        contentUnformatted: 'pre,code,textarea',
        indentInnerHtml: false,
        preserveNewLines: true,
        maxPreserveNewLines: 2,
        indentHandlebars: false,
        endWithNewline: true,
        extraLiners: 'head, body, /html',
        wrapAttributes: 'auto'
      }
    });

    // Configure CSS language settings
    monaco.languages.css.cssDefaults.setOptions({});

    // Configure JavaScript/TypeScript language settings
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      allowJs: true
    });

    // Set up custom themes
    monaco.editor.defineTheme('webEditorLight', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000' },
        { token: 'keyword', foreground: '0000FF' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
        { token: 'tag', foreground: '800000' },
        { token: 'attribute.name', foreground: 'FF0000' },
        { token: 'attribute.value', foreground: '0000FF' }
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F5F5F5',
        'editor.selectionBackground': '#ADD6FF',
        'editorCursor.foreground': '#000000'
      }
    });

    monaco.editor.defineTheme('webEditorDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' }
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2A2D2E',
        'editor.selectionBackground': '#264F78',
        'editorCursor.foreground': '#AEAFAD'
      }
    });

    // Enable HTML emmet
    if (file.language === 'html') {
      monaco.languages.registerCompletionItemProvider('html', {
        triggerCharacters: ['>'],
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          // Basic HTML autocomplete suggestions
          const suggestions = [
            {
              label: 'div',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<div>$1</div>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'HTML div element',
              range: range
            },
            {
              label: 'span',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<span>$1</span>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'HTML span element',
              range: range
            },
            {
              label: 'p',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<p>$1</p>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'HTML paragraph element',
              range: range
            },
            {
              label: 'a',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<a href="$1">$2</a>',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'HTML anchor element',
              range: range
            },
            {
              label: 'img',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '<img src="$1" alt="$2">',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'HTML image element',
              range: range
            }
          ];

          return { suggestions };
        }
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  // Get the appropriate theme based on system preference
  const getTheme = () => {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDark ? 'webEditorDark' : 'webEditorLight';
    }
    return 'webEditorLight';
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={file.language}
        value={file.content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={getTheme()}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: file.readOnly,
          automaticLayout: true,
          wordWrap: 'on',
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'always',
          unfoldOnClickAfterEndOfLine: true,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          trimAutoWhitespace: true,
          formatOnPaste: true,
          formatOnType: true,
          autoIndent: 'full',
          contextmenu: true,
          mouseWheelZoom: true,
          multiCursorModifier: 'ctrlCmd',
          accessibilitySupport: 'auto',
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: 'never',
            seedSearchStringFromSelection: 'always'
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          acceptSuggestionOnCommitCharacter: true,
          snippetSuggestions: 'top',
          emptySelectionClipboard: false,
          copyWithSyntaxHighlighting: true,
          wordBasedSuggestions: 'allDocuments',
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: 'on',
          cursorStyle: 'line',
          cursorWidth: 2,
          renderWhitespace: 'selection',
          renderControlCharacters: false,

          renderLineHighlight: 'line',
          codeLens: false,
          hideCursorInOverviewRuler: false,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            arrowSize: 11,
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 18,
            horizontalScrollbarSize: 18,
            verticalSliderSize: 18,
            horizontalSliderSize: 18
          }
        }}
      />
    </div>
  );
}
