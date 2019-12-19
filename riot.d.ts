// This interface is only exposed and any Riot component will receive the following properties
export interface RiotCoreComponent<P = object, S = object> {
  // automatically generated on any component instance
  readonly props: P
  readonly root: HTMLElement
  readonly name?: string
  // TODO: add the @riotjs/dom-bindings types
  readonly slots: any[]
  mount(
    element: HTMLElement,
    initialState?: S,
    parentScope?: object
  ): RiotComponent<P, S>
  update(
    newState?: Partial<S>,
    parentScope?: object
  ): RiotComponent<P, S>
  unmount(keepRootElement: boolean): RiotComponent<P, S>

  // Helpers
  $(selector: string): HTMLElement
  $$(selector: string): [HTMLElement]
}

// Riot Pure Component interface that should be used together with riot.pure
export interface RiotPureComponent<C = object> {
  mount(
    element: HTMLElement,
    context?: C,
  ): any
  update(
    context?: C,
  ): any
  unmount(keepRootElement: boolean): any
}

// This object interface is created anytime a riot file will be compiled into javascript
export interface RiotComponentShell<P = object, S = object> {
  readonly css?: string
  readonly exports?: () => RiotComponentExport<P, S>|object
  readonly name?: string
  // TODO: add the @riotjs/dom-bindings types
  template(): any
}

// Interface that can be used when creating the components export
export interface RiotComponentExport<P = object, S = object> {
  // optional on the component object
  state?: S

  // optional alias to map the children component names
  components?: {
    [key: string]: RiotComponentShell<P, S>
  }

  // state handling methods
  shouldUpdate?(newProps: P, currentProps: P): boolean

  // lifecycle methods
  onBeforeMount?(currentProps: P, currentState: S): void
  onMounted?(currentProps: P, currentState: S): void
  onBeforeUpdate?(currentProps: P, currentState: S): void
  onUpdated?(currentProps: P, currentState: S): void
  onBeforeUnmount?(currentProps: P, currentState: S): void
  onUnmounted?(currentProps: P, currentState: S): void
  [key: string]: any
}

// All the RiotComponent Public interface properties are optional
export interface RiotComponent<P = object, S = object> extends RiotCoreComponent<P, S>, RiotComponentExport<P, S> {}

export type RegisteredComponentsMap = Map<string, () => RiotComponent>
export type ComponentEnhancer = <P, S>(component: RiotComponent<P, S>) => RiotComponent<P, S>
export type InstalledPluginsSet = Set<ComponentEnhancer>

export function register<P, S>(componentName: string, shell: RiotComponentShell<P, S>): RegisteredComponentsMap
export function unregister(componentName: string): RegisteredComponentsMap
export function mount<P = object, S = object>(selector: string, initialProps?: P, componentName?: string): RiotComponent<P, S>[]
export function unmount(selector: string, keepRootElement: boolean):HTMLElement[]
export function install(plugin: ComponentEnhancer):InstalledPluginsSet
export function uninstall(plugin: ComponentEnhancer):InstalledPluginsSet
export function component<P , S>(shell: RiotComponentShell<P, S>):(
  el: HTMLElement,
  initialProps?: P,
  meta?: { slots: any[]; attributes: any[]; }
) => RiotComponent<P, S>
export function pure<
  C = object,
  F = ({ slots?: any[]; attributes?: any[]; props?: C; }) => RiotPureComponent<C>>(func: F): F
export const version: string
