use std::{convert::Infallible, net::SocketAddr, time::Duration};

use async_channel::{bounded, Receiver, Sender};
use axum::{
    extract::Path,
    http::{HeaderValue, Method},
    response::{sse::Event, Sse},
    routing::get,
    Extension, Router,
};
use color_eyre::{eyre::eyre, Result};
use futures::{stream::Stream, StreamExt};
use lazy_static::lazy_static;
use tokio::sync::Mutex;
use tower_http::cors::CorsLayer;

mod models;
use models::RoomUpdate;

lazy_static! {
    static ref ROOM_UPDATE_SENDER: Mutex<Option<Sender<RoomUpdate>>> = Mutex::new(None);
}

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install()?;

    tracing_subscriber::fmt::init();

    let cors_urls: Vec<String> = std::env::var("CORS_URLS")
        .map_err(|e| eyre!(e))
        .and_then(|x| serde_json::from_str(&x).map_err(|e| eyre!(e)))
        .unwrap_or(vec!["http://localhost:3000".to_string()]);
    let listen_addr = std::env::var("LISTEN_ADDR").unwrap_or("0.0.0.0:4000".to_string());
    let redis_url = std::env::var("REDIS_URL").unwrap_or("redis://localhost:6379".to_string());

    dbg!(&cors_urls);
    dbg!(&listen_addr);
    dbg!(&redis_url);

    let (sender, receiver) = bounded::<RoomUpdate>(128);
    *ROOM_UPDATE_SENDER.lock().await = Some(sender.clone());

    let redis_client = redis::Client::open(redis_url)?;
    let mut pubsub_conn = redis_client.get_async_connection().await?.into_pubsub();
    pubsub_conn.subscribe("roomUpdates").await?;

    let redis_sub_task_join_handle = tokio::spawn(async move {
        let pubsub_stream = pubsub_conn.into_on_message();
        pubsub_stream
            .for_each(move |msg| {
                let payload: String = msg.get_payload().unwrap();
                let sender = sender.clone();
                async move {
                    let parsed_payload: RoomUpdate = serde_json::from_str(&payload).unwrap();
                    sender.send(parsed_payload).await.unwrap();
                }
            })
            .await;
    });

    let cors_urls = cors_urls
        .into_iter()
        .map(|url| url.parse::<HeaderValue>())
        .collect::<Result<Vec<_>, _>>()?;

    let app = Router::new()
        .route("/sse/roomUpdates/:id", get(sse_handler))
        .layer(
            CorsLayer::new()
                .allow_origin(cors_urls)
                .allow_methods([Method::GET]),
        )
        .layer(Extension(receiver));

    let addr: SocketAddr = listen_addr.parse()?;

    tracing::info!("listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    redis_sub_task_join_handle.await?;

    Ok(())
}

async fn sse_handler(
    Path(room_id): Path<u32>,
    Extension(receiver): Extension<Receiver<RoomUpdate>>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let stream = async_stream::stream! {
        while let Ok(item) = receiver.recv().await {
            if item.room_id == room_id {
                yield Ok(Event::default().json_data(item).unwrap());
            }
        }
    };

    Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(5))
            .text("keep-alive-text"),
    )
}
