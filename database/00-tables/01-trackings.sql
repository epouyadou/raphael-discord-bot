
CREATE IF NOT EXISTS TABLE raphaeldb.user_trackings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    guild_channel_id INT NOT NULL,
    guild_member_id INT NOT NULL,
    CONSTRAINT uc_tracked_user UNIQUE (user_id, guild_channel_id, guild_member_id)
);

CREATE IF NOT EXISTS TABLE raphaeldb.role_trackings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    guild_channel_id INT NOT NULL,
    guild_role_id INT NOT NULL,
    CONSTRAINT uc_tracked_role UNIQUE (user_id, guild_channel_id, guild_role_id)
);

CREATE IF NOT EXISTS TABLE raphaeldb.voice_channel_status_records (
    id SERIAL PRIMARY KEY,
    guild_member_id INT NOT NULL,
    guild_channel_id INT NOT NULL,
    is_connected BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

