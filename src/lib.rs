use wasm_bindgen::prelude::*;
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
#[wasm_bindgen]
pub fn ws_ping(endpoint: String, message: String) -> Promise {
    let ws = match WebSocket::new(&endpoint) {
        Ok(ws) => ws,
        Err(err) => {
            console_log!("error creating WebSocket: {:?}", err);
            return Promise::reject(&JsValue::from_str("Error creating WebSocket"));
        }
    };


    // On ws open, send message
    let cloned_ws = ws.clone();
    let onopen_callback = Closure::wrap(Box::new(move |_| {
        console_log!("socket opened");
        match cloned_ws.send_with_str(message.as_str()) {
            Ok(_) => console_log!("ws open"),
            Err(err) => console_log!("error sending message: {:?}", err),
        }
    }) as Box<dyn FnMut(JsValue)>);
    ws.set_onopen(Some(onopen_callback.as_ref().unchecked_ref()));
    onopen_callback.forget();

    // On message, log it and send message to channel
    let (sender, mut receiver) = mpsc::unbounded::<JsValue>();
    // create callback
    let onmessage_callback = Closure::wrap(Box::new(move |e: MessageEvent| {
        // handle message
        let response = match e.data().as_string() {
            Some(data) => data,
            None => {
                console_log!("error converting data to string");
                return;
            }
        };
        console_log!("message event, received data: {:?}", response);

        match sender.unbounded_send(e.data()) {
            Ok(_) => console_log!("channel sent success"),
            Err(err) => console_log!("channel send fail: {:?}", err),
        };
    }) as Box<dyn FnMut(MessageEvent)>);
    ws.set_onmessage(Some(onmessage_callback.as_ref().unchecked_ref()));
    onmessage_callback.forget();

    // On receive message from channel, return it to JS
    future_to_promise(async move {
        match receiver.next().await {
            Some(value) => Ok(value),
            None => Err(JsValue::from_str("No response received")),
        }
    })
