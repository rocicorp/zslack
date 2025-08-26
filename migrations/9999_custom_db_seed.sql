-- Seed users referenced by sample messages
INSERT INTO "user" ("id", "name", "email", "email_verified") VALUES
	('user_ada', 'Ada Lovelace', 'ada@example.com', true),
	('user_grace', 'Grace Hopper', 'grace@example.com', true),
	('user_alan', 'Alan Turing', 'alan@example.com', true),
	('user_katherine', 'Katherine Johnson', 'katherine@example.com', true),
	('user_margaret', 'Margaret Hamilton', 'margaret@example.com', true);
--> statement-breakpoint

-- Seed channels from previous in-memory data
INSERT INTO "channel" ("id", "name") VALUES
	('general', 'general'),
	('random', 'random'),
	('product', 'product');
--> statement-breakpoint

-- Seed messages per channel using the user ids above
INSERT INTO "message" ("id", "sender_id", "channel_id", "body") VALUES
	('m1', 'user_ada', 'general', 'Welcome to #general. Keep it friendly.'),
	('m2', 'user_grace', 'general', 'Standup at 10:00. Post blockers here.'),
	('m3', 'user_alan', 'general', 'Pushing a small UI update later today.'),
	('r1', 'user_katherine', 'random', 'Coffee recommendations?'),
	('p1', 'user_margaret', 'product', 'Beta feedback thread starts here.');
--> statement-breakpoint
