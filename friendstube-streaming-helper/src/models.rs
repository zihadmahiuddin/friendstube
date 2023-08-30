use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RoomUpdate {
    #[serde(flatten)]
    kind: RoomUpdateKind,
    pub room_id: u32,
    timestamp: u64,
    position: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(tag = "updateType", rename_all = "camelCase")]
pub enum RoomUpdateKind {
    #[serde(rename_all = "camelCase")]
    Play {
        video_link: String,
    },
    Pause,
    Resume,
    PositionChange,
}

#[cfg(test)]
mod tests {
    use crate::models::{RoomUpdate, RoomUpdateKind};

    #[test]
    fn room_update_play_works() {
        let parsed_room_update = serde_json::from_str::<RoomUpdate>(
            r#"
            {
                "roomId": 1,
                "timestamp": 1693352476432,
                "position": 1443,
                "updateType": "play",
                "videoLink": "https://www.youtube.com/watch?v=6OViBJR1Hwk"
            }
            "#,
        )
        .unwrap();

        assert_eq!(parsed_room_update.room_id, 1);
        assert_eq!(parsed_room_update.timestamp, 1693352476432);
        assert_eq!(parsed_room_update.position, 1443);
        assert_eq!(
            parsed_room_update.kind,
            RoomUpdateKind::Play {
                video_link: "https://www.youtube.com/watch?v=6OViBJR1Hwk".to_string()
            }
        );
    }

    // if "pause" works, the rest should too, since they share the same structure
    // except "play" which is handled above
    #[test]
    fn room_update_pause_works() {
        let parsed_room_update = serde_json::from_str::<RoomUpdate>(
            r#"
            {
                "roomId": 1,
                "timestamp": 1693352476432,
                "position": 1443,
                "updateType": "pause"
            }
            "#,
        )
        .unwrap();
        assert_eq!(parsed_room_update.room_id, 1);
        assert_eq!(parsed_room_update.timestamp, 1693352476432);
        assert_eq!(parsed_room_update.position, 1443);
        assert_eq!(parsed_room_update.kind, RoomUpdateKind::Pause);
    }
}
