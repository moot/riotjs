export const
  COMPONENTS_IMPLEMENTATION_MAP = new Map(),
  DOM_COMPONENT_INSTANCE_PROPERTY = Symbol('riot-component'),
  PLUGINS_SET = new Set(),
  IS_DIRECTIVE = 'is',
  VALUE_ATTRIBUTE = 'value',
  IS_PURE_SYMBOL = Symbol.for('pure'),
  PARENT_KEY_SYMBOL = Symbol('parent'),
  ATTRIBUTES_KEY_SYMBOL = Symbol('attributes'),
  TEMPLATE_KEY_SYMBOL = Symbol('template')