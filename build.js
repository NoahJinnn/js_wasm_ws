// pkg/wasm_ws.js
var getObject = function(idx) {
  return heap[idx];
};
var dropObject = function(idx) {
  if (idx < 132)
    return;
  heap[idx] = heap_next;
  heap_next = idx;
};
var takeObject = function(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
};
var getUint8Memory0 = function() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
};
var getStringFromWasm0 = function(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
};
var addHeapObject = function(obj) {
  if (heap_next === heap.length)
    heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
};
var passStringToWasm0 = function(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8Memory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8Memory0();
  let offset = 0;
  for (;offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127)
      break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);
    offset += ret.written;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
};
var isLikeNone = function(x) {
  return x === undefined || x === null;
};
var getInt32Memory0 = function() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
};
var debugString = function(val) {
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1;i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    return toString.call(val);
  }
  if (className == "Object") {
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  return className;
};
var makeMutClosure = function(arg0, arg1, dtor, f) {
  const state = { a: arg0, b: arg1, cnt: 1, dtor };
  const real = (...args) => {
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
      } else {
        state.a = a;
      }
    }
  };
  real.original = state;
  return real;
};
var __wbg_adapter_20 = function(arg0, arg1, arg2) {
  wasm.wasm_bindgen__convert__closures__invoke1_mut__h343cffe03f67898a(arg0, arg1, addHeapObject(arg2));
};
var __wbg_adapter_27 = function(arg0, arg1, arg2) {
  wasm.wasm_bindgen__convert__closures__invoke1_mut__he381cf16eb809268(arg0, arg1, addHeapObject(arg2));
};
function ws_ping(endpoint, message) {
  const ptr0 = passStringToWasm0(endpoint, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.ws_ping(ptr0, len0, ptr1, len1);
  return takeObject(ret);
}
var handleError = function(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
};
var __wbg_adapter_53 = function(arg0, arg1, arg2, arg3) {
  wasm.wasm_bindgen__convert__closures__invoke2_mut__h8ad33c7e53e0bcfb(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
};
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}
var __wbg_get_imports = function() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_log_f4a836b0828ae7ee = function(arg0, arg1) {
    console.log(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "string" ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_data_624fd2b6a4a5ac9e = function(arg0) {
    const ret = getObject(arg0).data;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_setonopen_b2a170d59c1abe88 = function(arg0, arg1) {
    getObject(arg0).onopen = getObject(arg1);
  };
  imports.wbg.__wbg_setonerror_e72476002c2f519a = function(arg0, arg1) {
    getObject(arg0).onerror = getObject(arg1);
  };
  imports.wbg.__wbg_setonmessage_eb44f51ef6e7e0e8 = function(arg0, arg1) {
    getObject(arg0).onmessage = getObject(arg1);
  };
  imports.wbg.__wbg_new_b9b318679315404f = function() {
    return handleError(function(arg0, arg1) {
      const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_send_c1cc1284964b7434 = function() {
    return handleError(function(arg0, arg1, arg2) {
      getObject(arg0).send(getStringFromWasm0(arg1, arg2));
    }, arguments);
  };
  imports.wbg.__wbindgen_cb_drop = function(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
      obj.a = 0;
      return true;
    }
    const ret = false;
    return ret;
  };
  imports.wbg.__wbg_queueMicrotask_e5949c35d772a669 = function(arg0) {
    queueMicrotask(getObject(arg0));
  };
  imports.wbg.__wbg_queueMicrotask_2be8b97a81fe4d00 = function(arg0) {
    const ret = getObject(arg0).queueMicrotask;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_is_function = function(arg0) {
    const ret = typeof getObject(arg0) === "function";
    return ret;
  };
  imports.wbg.__wbg_newnoargs_ccdcae30fd002262 = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_call_669127b9d730c650 = function() {
    return handleError(function(arg0, arg1) {
      const ret = getObject(arg0).call(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_self_3fad056edded10bd = function() {
    return handleError(function() {
      const ret = self.self;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_window_a4f46c98a61d4089 = function() {
    return handleError(function() {
      const ret = window.window;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_globalThis_17eff828815f7d84 = function() {
    return handleError(function() {
      const ret = globalThis.globalThis;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_global_46f939f6541643c5 = function() {
    return handleError(function() {
      const ret = global.global;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_is_undefined = function(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
  };
  imports.wbg.__wbg_call_53fc3abd42e24ec8 = function() {
    return handleError(function(arg0, arg1, arg2) {
      const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_new_feb65b865d980ae2 = function(arg0, arg1) {
    try {
      var state0 = { a: arg0, b: arg1 };
      var cb0 = (arg02, arg12) => {
        const a = state0.a;
        state0.a = 0;
        try {
          return __wbg_adapter_53(a, state0.b, arg02, arg12);
        } finally {
          state0.a = a;
        }
      };
      const ret = new Promise(cb0);
      return addHeapObject(ret);
    } finally {
      state0.a = state0.b = 0;
    }
  };
  imports.wbg.__wbg_reject_e4f6a4fa90f72e0f = function(arg0) {
    const ret = Promise.reject(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_resolve_a3252b2860f0a09e = function(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_then_89e1c559530b85cf = function(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbindgen_closure_wrapper33 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 3, __wbg_adapter_20);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_closure_wrapper35 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 3, __wbg_adapter_20);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_closure_wrapper37 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 3, __wbg_adapter_20);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_closure_wrapper149 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 41, __wbg_adapter_27);
    return addHeapObject(ret);
  };
  return imports;
};
var __wbg_init_memory = function(imports, maybe_memory) {
};
var __wbg_finalize_init = function(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedInt32Memory0 = null;
  cachedUint8Memory0 = null;
  return wasm;
};
async function __wbg_init(input) {
  if (wasm !== undefined)
    return wasm;
  if (typeof input === "undefined") {
    input = new URL("wasm_ws_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof input === "string" || typeof Request === "function" && input instanceof Request || typeof URL === "function" && input instanceof URL) {
    input = fetch(input);
  }
  __wbg_init_memory(imports);
  const { instance, module } = await __wbg_load(await input, imports);
  return __wbg_finalize_init(instance, module);
}
var wasm;
var heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);
var heap_next = heap.length;
var cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: () => {
  throw Error("TextDecoder not available");
} };
if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode();
}
var cachedUint8Memory0 = null;
var WASM_VECTOR_LEN = 0;
var cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : { encode: () => {
  throw Error("TextEncoder not available");
} };
var encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function(arg, view) {
  const buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};
var cachedInt32Memory0 = null;
var wasm_ws_default = __wbg_init;

// index.ts
window.init = wasm_ws_default;
window.ws_ping = ws_ping;
window.addEventListener("load", async () => {
  await wasm_ws_default("./pkg/wasm_ws_bg.wasm");
  const endpoint = "ws://localhost:8080";
  const message = "Hello, WebSocket!";
  ws_ping(endpoint, message).then((response) => console.log("Received: " + response)).catch((error) => console.error("Error: " + error));
});
