// TypeScript 声明文件：支持 .md 文件导入
declare module '*.md' {
  const content: string;
  export default content;
}
