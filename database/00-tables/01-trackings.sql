
CREATE TABLE IF NOT EXISTS raphaeldb.user_tracking_orders (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(64) NOT NULL,
    tracker_guild_member_id VARCHAR(64) NOT NULL,
    tracked_guild_member_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    CONSTRAINT uc_user_tracking UNIQUE (guild_id, tracker_guild_member_id, tracked_guild_member_id)
);

CREATE TABLE IF NOT EXISTS raphaeldb.role_tracking_orders (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(64) NOT NULL,
    tracker_guild_member_id VARCHAR(64) NOT NULL,
    tracked_guild_role_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    CONSTRAINT uc_role_tracking UNIQUE (guild_id, tracker_guild_member_id, tracked_guild_role_id)
);

CREATE TABLE IF NOT EXISTS raphaeldb.voice_channel_status_records (
    id SERIAL PRIMARY KEY,
    guild_member_id VARCHAR(64) NOT NULL,
    guild_id VARCHAR(64) NOT NULL,
    from_guild_channel_id VARCHAR(64),
    to_guild_channel_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

