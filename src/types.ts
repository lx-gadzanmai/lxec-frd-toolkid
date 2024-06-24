type Arrayable<T> = T | Array<T>

/**
 * 用户 snippet 配置
 */
export interface VSCodeSchemasGlobalSnippets {
  [k: string]: Snippet
}

export interface SnippetBodyOption {
  file: string
  text: string
}

export interface Snippet {
  /**
   * 在 intellisense 中选择 Snippet 时要使用的前缀
   */
  prefix?: Arrayable<string>
  /**
   * 可能是动态的
   */
  body: Arrayable<string> | ((opt: SnippetBodyOption) => Arrayable<string>)
  /**
   * Snippet 的描述。
   */
  description?: Arrayable<string>
  /**
   * 适用于此 Snippet 的语言名称列表，例如 'typescript,javascript'。
   */
  scope?: string
}
