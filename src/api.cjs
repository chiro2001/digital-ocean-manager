const vscode = require('vscode');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function urlEncode(param, key, encode) {
  if (param == null) return '';
  var paramStr = '';
  var t = typeof (param);
  if (t === 'string' || t === 'number' || t === 'boolean') {
    paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
  } else {
    for (var i in param) {
      var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
      paramStr += urlEncode(param[i], k, encode);
    }
  }
  return paramStr;
};

class DoAPI {
  constructor(api_endoint, token) {
    this.url = api_endoint;
    this.token = token;
  }
  set_token(token) { this.token = token; }
  request_key(router, key, method = "GET", data) {
    return this.request(`${router}/${key}`, method, data);
  }
  get_headers() {
    let headers = {
      'Content-Type': 'application/json',
    };
    headers['Token'] = this.token;
    return headers;
  }
  async request(router, method = "GET", data) {
    const payload = {
      method: method,
      body: method === 'GET' ? undefined : (data ? JSON.stringify(data) : undefined),
      headers: this.get_headers(),
    };
    // console.log('request', router, method, data, payload);
    const url = (method !== 'GET' || !data) ? `${this.url}/${router === '/' ? '' : router}` : `${this.url}/${router}?${urlEncode(data).slice(1)}`;
    const resp = await fetch(url, payload);
    let js = null;
    try { js = await resp.json(); } catch (e) {
      console.error(e);
      vscode.window.showErrorMessage(`API Error: ${e}`);
      return { code: resp.status, error: resp.statusText };
    }
    console.log('raw js:', js);
    if (!js) {
      js = {
        message: resp.statusText,
        code: undefined
      };
    }
    if (js.code !== 200) {
      vscode.window.showErrorMessage(`API Error ${js.error}: ${js.message}`);
    }
    // @ts-ignore
    if (js.code === undefined) js.code = resp.status;
    return js;
  }
}

exports.DoAPI = DoAPI;