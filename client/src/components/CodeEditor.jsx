import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';

export function CodeEditor({ value, onChange, readOnly, language = 'javascript' }) {
  const { theme } = useTheme();
  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      language={language}
      theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
      value={value}
      onChange={(v) => onChange?.(v ?? '')}
      options={{
        readOnly: !!readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
        fontLigatures: true,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        renderLineHighlight: 'gutter',
        padding: { top: 8 },
        automaticLayout: true,
      }}
    />
  );
}
