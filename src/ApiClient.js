// This class is a reference implementation. If you desire additional
// functionality, you can work with the config options here, or copy this code
// into your project and customize the ApiClient to your needs.

// You can pass in config using `action.payload.fetchConfig`, or using passedConfig
// when you first initialize your ApiClient. Some keys will be used internally, and
// all other config keys will be passed on to the fetch `init` parameter. See
// https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch for details.
//
// See below for how the three config objects are merged: fetchConfig takes precedence
// over passedConfig, which takes precedence over baseConfig. The headers key of
// the three objects is merged, to allow more fine-grained header setup.
//
// `methods` will be ignored if passed to fetchConfig. Pass an array to passedConfig
// to allow more HTTP methods to be used via the fetch API.
//
// `basePath` is the basePath of your API. It must be passed to passedConfig, and can
// be overwritten in fetchConfig.
//
// `format` is the format to be requested from the Response. It can be any of arrayBuffer,
// blob, formData, json (the default), or text.
//
// `bodyEncoder` is the function that encodes the data parameter before passing to fetch
//
// All other keys are passed directly to the fetch `init` parameter.

class ApiClient {
  constructor(passedConfig) {
    const baseConfig = {
      bodyEncoder: JSON.stringify,
      credentials: 'same-origin',
      format: 'json',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      methods: ['get', 'post', 'put', 'patch', 'delete']
    }

    if (!config.basePath) {
      // e.g. 'https://example.com/api/v3'
      throw new Error('You must pass a base path to the ApiClient')
    }

    const methods = passedConfig.methods || baseConfig.methods
    methods.forEach(method => {
      this[method] = (path, { params, data, fetchConfig } = {}) => {
        const config = {
          ...baseConfig,
          ...passedConfig,
          ...fetchConfig,
          headers: {
            ...baseConfig.headers,
            ...passedConfig.headers,
            ...fetchConfig.headers
          }
        }
        const {
          methods: _methods, basePath, headers, format, bodyEncoder,
          ...otherConfig
        } = config
        const requestPath = basePath + path + this.queryString()
        const body = data ? bodyEncoder(data) : undefined

        return fetch(requestPath, {
          ...otherConfig,
          method,
          headers,
          body
        }).then(response => {
          return response[format]()
        })
      }
    })
  }

  queryString(params) {
    const q = new URLSearchParams()
    Object.keys(params).forEach(key => {
      q.set(key, params[key])
    })
    const s = String(q)
    return s ? `?${s}` : ''
  }
}

export default ApiClient
