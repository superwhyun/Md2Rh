declare namespace __WebpackModuleApi {
  interface RequireContext {
    keys(): string[]
    (id: string): any
    <T>(id: string): T
    resolve(id: string): string
    id: string
  }
}

declare var require: {
  context(
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp,
    mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once'
  ): __WebpackModuleApi.RequireContext
} & NodeRequire