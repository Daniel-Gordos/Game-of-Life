
export function b64EncodeUnicode(str:string) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(_, p1) {
      return String.fromCharCode(parseInt(p1, 16))
  }))
}

export function b64DecodeUnicode(str:string) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}
