FROM rust:1.72-slim-bullseye as builder
RUN apt-get update && apt install -y --no-install-recommends ca-certificates

WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim AS application
RUN apt-get update && apt install -y --no-install-recommends ca-certificates
COPY --from=builder /app/target/release/streaming-helper ./streaming-helper
CMD ["./streaming-helper"]
