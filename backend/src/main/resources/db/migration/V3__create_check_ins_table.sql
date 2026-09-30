CREATE TABLE check_ins (
                           id          BIGSERIAL PRIMARY KEY,
                           goal_id     BIGINT       NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
                           check_date  DATE         NOT NULL,
                           done        BOOLEAN      NOT NULL,
                           note        VARCHAR(500),
                           created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
                           updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
                           CONSTRAINT uq_check_ins_goal_date UNIQUE (goal_id, check_date)
);

CREATE INDEX idx_check_ins_goal_id ON check_ins(goal_id);