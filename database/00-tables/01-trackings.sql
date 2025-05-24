
CREATE TABLE IF NOT EXISTS raphaeldb.user_tracking_orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    guild_id VARCHAR(64) NOT NULL,
    guild_member_id VARCHAR(64) NOT NULL,
    CONSTRAINT uc_tracked_user UNIQUE (user_id, guild_member_id)
);

CREATE TABLE IF NOT EXISTS raphaeldb.role_tracking_orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    guild_id VARCHAR(64) NOT NULL,
    guild_role_id VARCHAR(64) NOT NULL,
    CONSTRAINT uc_tracked_role UNIQUE (user_id, guild_role_id)
);

CREATE TABLE IF NOT EXISTS raphaeldb.voice_channel_status_records (
    id SERIAL PRIMARY KEY,
    guild_member_id VARCHAR(64) NOT NULL,
    guild_id VARCHAR(64) NOT NULL,
    from_guild_channel_id VARCHAR(64),
    to_guild_channel_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

