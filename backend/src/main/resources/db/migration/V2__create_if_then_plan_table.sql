CREATE TABLE if_then_plans (
                               id           BIGSERIAL PRIMARY KEY,
                               goal_id      BIGINT       NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
                               plan_trigger VARCHAR(255) NOT NULL,
                               response     VARCHAR(255) NOT NULL,
                               created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
                               updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_if_then_plans_goal_id ON if_then_plans(goal_id);