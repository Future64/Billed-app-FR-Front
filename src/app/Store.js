// Store 

const jsonOrThrowIfError = async (response) => { 
  if(!response.ok) throw new Error((await response.json()).message) 
  return response.json()
}

// API
class Api { // jsonOrThrowIfError
  constructor({baseUrl}) {
    this.baseUrl = baseUrl;
  }
  async get({url, headers}) { 
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'GET'})) 
  }
  async post({url, data, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'POST', body: data})) 
  }
  async delete({url, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'DELETE'}))
  }
  async patch({url, data, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'PATCH', body: data}))
  }
}

const getHeaders = (headers) => { // Encryption
  const h = { }
  if (!headers.noContentType) h['Content-Type'] = 'application/json'
  const jwt = localStorage.getItem('jwt')
  if (jwt && !headers.noAuthorization) h['Authorization'] = `Bearer ${jwt}` 
  return {...h, ...headers}
}

class ApiEntity { 
  constructor({key, api}) { 
    this.key = key; 
    this.api = api; 
  }
  // ApiEntity.select
  async select({selector, headers = {}}) { // headers for invisble parts of the request (≠ body visible)
    return await (this.api.get({url: `/${this.key}/${selector}`, headers: getHeaders(headers)}))
  }
  // ApiEntity.list
  async list({headers = {}} = {}) {
    return await (this.api.get({url: `/${this.key}`, headers: getHeaders(headers)}))
  }
  // ApiEntity.update
  async update({data, selector, headers = {}}) {
    return await (this.api.patch({url: `/${this.key}/${selector}`, headers: getHeaders(headers), data}))
  }
  // ApiEntity.create
  async create({data, headers = {}}) {
    return await (this.api.post({url: `/${this.key}`, headers: getHeaders(headers), data}))
  }
  // ApiEntity.delete
  async delete({selector, headers = {}}) {
    return await (this.api.delete({url: `/${this.key}/${selector}`, headers: getHeaders(headers)}))
  }
}

// Store
class Store {
  constructor() {
    this.api = new Api({baseUrl: 'http://localhost:5678'}) // API accessible on port `5678` locally
  }

  user = uid => (new ApiEntity({key: 'users', api: this.api})).select({selector: uid}) // uid = unique id 
  users = () => new ApiEntity({key: 'users', api: this.api})
  login = (data) => this.api.post({url: '/auth/login', data, headers: getHeaders({noAuthorization: true})})

  ref = (path) => this.store.doc(path)

  bill = bid => (new ApiEntity({key: 'bills', api: this.api})).select({selector: bid})
  bills = () => new ApiEntity({key: 'bills', api: this.api})
}

export default new Store()