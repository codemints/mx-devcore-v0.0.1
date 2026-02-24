export function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

export function toDash(str) {
  return str.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
}