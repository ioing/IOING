import { DETECT } from './detect'

// Prefix, default unit

const vendor_regEx = new RegExp("^" + DETECT.vendor, "ig")
const vendor_length = DETECT.vendor.length

export const VENDOR = function(w) {
  // 修正开发商前缀为W3C API

  for (let key in w) {
    let vendor = vendor_regEx.exec(key)

    if (vendor) {
      let start = key.charAt(vendor_length)
      let rekey = key.substr(vendor_length).replace(/(\w)/, function(v) {
        return v.toLowerCase()
      })

      if (start > 'A' || start < 'Z') {
        try {
          if (!w[rekey]) {
            Object.defineProperty(w, rekey, {
              configurable: true,
              writable: true
            })
            w[rekey] = w[key]
          }
        } catch (e) {}
      }
    }
  }
}
