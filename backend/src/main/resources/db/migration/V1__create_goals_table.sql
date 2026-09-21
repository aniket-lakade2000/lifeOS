CREATE TABLE goals (
                       id          BIGSERIAL PRIMARY KEY,
                       title       VARCHAR(120) NOT NULL,
                       description TEXT,
                       area        VARCHAR(20)  NOT NULL,
                       priority    SMALLINT     NOT NULL CHECK (priority BETWEEN 1 AND 3),
                       status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
                       next_action VARCHAR(255),
                       created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
                       updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);