-- Pet Rock Life ROCK gamemode.
-- First server-side migration slice from the original Fastify/Socket.IO backend.

local AREA_VILLAGE = "village"
local ROOM_VILLAGE = "village_1"
local PLAYER_SPEED = 0.55
local VISION_RADIUS = 140
local MAX_NAME_LENGTH = 24
local ANON_FID_BASE = 900000000000

local SPAWN = { x = -26, y = 4, z = -15 }
local ROCK_OFFSET = { x = 2, y = 0, z = 0 }

local DEFAULT_UNLOCKED_HATS = {
	"none",
	"baseball_cap",
	"toy_winder_hat",
	"traffic_cone_hat",
	"crown_hat",
	"sombrero_hat",
	"higher_crown_hat",
	"noggles_hat",
}

local DEFAULT_UNLOCKED_SKINS = { "seal", "warplet" }

local INTERACTION_POINTS = {
	wave = 1,
	admire_rock = 10,
	hug = 25,
	backflip = 100,
	ritual = 500,
	kiss = 1000,
}

local INTERACTION_REQUIREMENTS = {
	wave = 0,
	admire_rock = 5,
	hug = 50,
	backflip = 250,
	ritual = 2000,
	kiss = 5000,
}

local player_entities = {}
local rock_entities = {}
local profiles_by_pid = {}
local rocks_by_pid = {}
local fid_to_pid = {}
local pending_interactions = {}
local anonymous_guest_seq = 0

local function count_table(t)
	local count = 0
	for _ in pairs(t) do
		count = count + 1
	end
	return count
end

local function debug_state(label)
	print(
		string.format(
			"[prl:debug] %s players=%d rocks=%d profiles=%d fid_map=%d pending_interactions=%d",
			label,
			count_table(player_entities),
			count_table(rock_entities),
			count_table(profiles_by_pid),
			count_table(fid_to_pid),
			count_table(pending_interactions)
		)
	)
end

local function debug_player(label, pid, fid, extra)
	print(
		string.format(
			"[prl:debug] %s pid=%s fid=%s %s",
			label,
			tostring(pid),
			tostring(fid),
			extra or ""
		)
	)
end

local keyboard = Const.Input.Keyboard
local controller = Const.Input.Controller
local stick = Const.Input.Stick

input
	.vector()
	:defaults({
		keyboard = {
			up = { keyboard.KeyW, keyboard.ArrowUp },
			down = { keyboard.KeyS, keyboard.ArrowDown },
			left = { keyboard.KeyA, keyboard.ArrowLeft },
			right = { keyboard.KeyD, keyboard.ArrowRight },
		},
		controller = {
			up = { controller.DPadUp },
			down = { controller.DPadDown },
			left = { controller.DPadLeft },
			right = { controller.DPadRight },
		},
		stick = stick.LeftStick,
	})
	:register("Move")

input
	.button()
	:defaults({
		keyboard = { keyboard.KeyE },
		controller = { controller.ButtonA },
	})
	:register("PetRock")

local player_bp = entity
	.blueprint()
	:name("prl_player")
	:position({ x = SPAWN.x, y = SPAWN.z })
	:custom({
		kind = "player",
		id = "",
		fid = 0,
		username = "",
		displayName = "",
		pfpUrl = "",
		isAnonymous = false,
		skin = "seal",
		hat = "none",
		isConnected = true,
		isInteracting = false,
		y = SPAWN.y,
		rotationX = 0,
		rotationY = 0,
		rotationZ = 0,
		rotationW = 1,
		joystickType = "stop",
		joystickX = 0,
		joystickY = 0,
		joystickDirection = "",
		joystickDistance = 0,
	})

local rock_bp = entity
	.blueprint()
	:name("prl_rock")
	:position({ x = SPAWN.x + ROCK_OFFSET.x, y = SPAWN.z + ROCK_OFFSET.z })
	:custom({
		kind = "rock",
		id = "",
		userId = "",
		fid = 0,
		rockName = "Rocky",
		age = 0,
		happiness = 100,
		y = SPAWN.y,
		rotationX = 0,
		rotationY = 0,
		rotationZ = 0,
		rotationW = 1,
		passportMinted = false,
		passportName = "",
		passportRarity = "",
		passportChangedName = false,
	})

player_bp
	:sync()
	:only(function(c)
		return {
			c.position,
			c.owned_by,
			c.name,
			"kind",
			"id",
			"fid",
			"username",
			"displayName",
			"pfpUrl",
			"skin",
			"hat",
			"isConnected",
			"isInteracting",
			"y",
			"rotationX",
			"rotationY",
			"rotationZ",
			"rotationW",
			"joystickType",
			"joystickX",
			"joystickY",
			"joystickDirection",
			"joystickDistance",
		}
	end)
	:radius(VISION_RADIUS)
	:commit()

rock_bp
	:sync()
	:only(function(c)
		return {
			c.position,
			c.owned_by,
			c.name,
			"kind",
			"id",
			"userId",
			"fid",
			"rockName",
			"age",
			"happiness",
			"y",
			"rotationX",
			"rotationY",
			"rotationZ",
			"rotationW",
			"passportMinted",
			"passportName",
			"passportRarity",
			"passportChangedName",
		}
	end)
	:radius(VISION_RADIUS)
	:commit()

local function now()
	return os.time()
end

local function shallow_copy(source)
	local out = {}
	if type(source) ~= "table" then
		return out
	end

	for key, value in pairs(source) do
		out[key] = value
	end

	return out
end

local function merge_defaults(value, defaults)
	local out = shallow_copy(defaults)
	if type(value) == "table" then
		for key, item in pairs(value) do
			out[key] = item
		end
	end
	return out
end

local function clamp(value, min, max)
	if value < min then
		return min
	end
	if value > max then
		return max
	end
	return value
end

local function trim_name(name)
	if type(name) ~= "string" then
		return nil
	end

	name = name:gsub("^%s+", ""):gsub("%s+$", "")
	if #name == 0 then
		return nil
	end
	if #name > MAX_NAME_LENGTH then
		return name:sub(1, MAX_NAME_LENGTH)
	end

	return name
end

local function user_key(fid)
	return "prl/users/" .. tostring(fid) .. "/"
end

local function rock_key(fid)
	return "prl/rocks/" .. tostring(fid) .. "/"
end

local function relationship_key(source_fid, target_fid)
	return "prl/relationships/" .. tostring(source_fid) .. "/" .. tostring(target_fid) .. "/"
end

local function cooldown_key(fid, interaction_type)
	return "prl/cooldowns/" .. tostring(fid) .. "/" .. tostring(interaction_type) .. "/"
end

local function default_profile(fid, params)
	params = params or {}
	local username = params.username or params.name or ("rock" .. tostring(fid))
	local display_name = params.displayName or params.display_name or username

	return {
		id = tostring(fid),
		fid = fid,
		username = username,
		displayName = display_name,
		pfpUrl = params.pfpUrl or params.pfp_url or "",
		walletAddress = params.walletAddress or "",
		addedMiniApp = false,
		skin = "seal",
		hat = "none",
		unlockedHats = DEFAULT_UNLOCKED_HATS,
		unlockedSkins = DEFAULT_UNLOCKED_SKINS,
		notificationsEnabled = false,
		isAnonymous = false,
		createdAt = now(),
		updatedAt = now(),
	}
end

local function anonymous_profile(pid, params)
	params = params or {}
	local fid = ANON_FID_BASE + pid
	local guest_id = anonymous_guest_seq
	anonymous_guest_seq = anonymous_guest_seq + 1
	local profile = default_profile(fid, params)
	profile.username = "guest" .. tostring(guest_id)
	profile.displayName = params.displayName or params.display_name or profile.username
	profile.isAnonymous = true
	return profile
end

local function default_rock(fid)
	local ts = now()
	return {
		id = "rock:" .. tostring(fid),
		userId = tostring(fid),
		name = "Rocky",
		age = 0,
		happiness = 100,
		createdAt = ts,
		updatedAt = ts,
		passportMinted = false,
		passportName = "",
		passportRarity = "",
		passportChangedName = false,
	}
end

local function load_or_create_profile(fid, params)
	local profile = merge_defaults(memory.fetch(user_key(fid)), default_profile(fid, params or {}))
	profile.fid = fid
	profile.id = tostring(fid)
	profile.updatedAt = now()
	memory.store(user_key(fid), profile)
	return profile
end

local function enrich_profile_from_farcaster(profile)
	local users = fc.user({ profile.fid }):get()
	local user = users and users[1]
	if not user then
		return profile
	end

	profile.username = user.username or profile.username
	profile.displayName = user.display_name or profile.displayName or profile.username
	profile.pfpUrl = user.pfp_url or profile.pfpUrl or ""
	profile.updatedAt = now()
	memory.store(user_key(profile.fid), profile)

	return profile
end

local function load_or_create_rock(fid)
	local rock_data = merge_defaults(memory.fetch(rock_key(fid)), default_rock(fid))
	local elapsed = math.max(0, now() - (rock_data.updatedAt or now()))
	if elapsed > 0 then
		rock_data.age = (rock_data.age or 0) + elapsed
		rock_data.happiness = clamp((rock_data.happiness or 100) - math.floor(elapsed / 3600), 0, 100)
		rock_data.updatedAt = now()
		memory.store(rock_key(fid), rock_data)
	end
	return rock_data
end

local function room_players(room_id)
	local players = {}
	for pid, profile in pairs(profiles_by_pid) do
		if profile.room == room_id then
			players[#players + 1] = profile
		end
	end
	return players
end

local function signal_room(room_id, name, data)
	player.broadcast():signal(name):room(room_id):data(data or {}):send()
end

local function spawn_player(p, params, profile, rock_data)
	local pid = p:id()
	local fid = profile.fid
	local room_id = params.room or ROOM_VILLAGE
	debug_player(
		"spawn.begin",
		pid,
		fid,
		string.format(
			"room=%s who=%s anonymous=%s",
			tostring(room_id),
			tostring(p:who()),
			tostring(profile.isAnonymous)
		)
	)
	debug_state("spawn.before")

	profile.room = room_id
	profile.area = AREA_VILLAGE
	profile.isConnected = true
	profile.isInteracting = false
	profile.lastUpdate = now() * 1000

	local player_ent = player_bp
		:spawn()
		:owned_by(pid)
		:name("player_" .. tostring(fid))
		:position({ x = SPAWN.x, y = SPAWN.z })
		:custom(function(c)
			c.id = tostring(fid)
			c.fid = fid
			c.username = profile.username
			c.displayName = profile.displayName
			c.pfpUrl = profile.pfpUrl
			c.isAnonymous = profile.isAnonymous
			c.skin = profile.skin
			c.hat = profile.hat
			c.isConnected = true
			c.isInteracting = false
			c.y = SPAWN.y
			return c
		end)
		:room(room_id)
	debug_player("spawn.player_entity", pid, fid, "entity=created")

	local rock_ent = rock_bp
		:spawn()
		:owned_by(pid)
		:name("rock_" .. tostring(fid))
		:position({ x = SPAWN.x + ROCK_OFFSET.x, y = SPAWN.z + ROCK_OFFSET.z })
		:custom(function(c)
			c.id = rock_data.id
			c.userId = tostring(fid)
			c.fid = fid
			c.rockName = rock_data.name
			c.age = rock_data.age
			c.happiness = rock_data.happiness
			c.y = SPAWN.y + ROCK_OFFSET.y
			c.passportMinted = rock_data.passportMinted
			c.passportName = rock_data.passportName
			c.passportRarity = rock_data.passportRarity
			c.passportChangedName = rock_data.passportChangedName
			return c
		end)
		:room(room_id)
	debug_player("spawn.rock_entity", pid, fid, "entity=created")

	player_entities[pid] = player_ent
	rock_entities[pid] = rock_ent
	profiles_by_pid[pid] = profile
	rocks_by_pid[pid] = rock_data
	fid_to_pid[fid] = pid
	debug_state("spawn.after_tables")

	p:presence():enter(room_id)
	debug_player("spawn.presence_enter", pid, fid, "ok")
	p:vision():attach(player_ent)
	debug_player("spawn.vision_attach", pid, fid, "ok")

	p:signal("Identity"):data({
		pid = pid,
		fid = fid,
		room = room_id,
		identity = p:who(),
	}):send()
	debug_player("spawn.identity_sent", pid, fid, "ok")

	p:signal("RoomJoin"):data({
		player = profile,
		rock = rock_data,
		room = room_id,
		roomPlayers = room_players(room_id),
	}):send()
	debug_player(
		"spawn.room_join_sent",
		pid,
		fid,
		"room_players=" .. tostring(#room_players(room_id))
	)

	signal_room(room_id, "PlayerJoined", {
		player = profile,
		rock = rock_data,
	})
	debug_player("spawn.player_joined_broadcast", pid, fid, "ok")

	print(string.format("[prl] fid %d joined %s as pid %d", fid, room_id, pid))
	debug_state("spawn.done")
end

local function despawn_player(pid)
	local player_ent = player_entities[pid]
	local rock_ent = rock_entities[pid]
	local profile = profiles_by_pid[pid]
	debug_player(
		"despawn.begin",
		pid,
		profile and profile.fid or nil,
		string.format(
			"has_player_ent=%s has_rock_ent=%s room=%s",
			tostring(player_ent ~= nil),
			tostring(rock_ent ~= nil),
			tostring(profile and profile.room or nil)
		)
	)
	debug_state("despawn.before")

	if player_ent then
		player_ent:despawn()
		debug_player("despawn.player_entity", pid, profile and profile.fid or nil, "ok")
	end
	if rock_ent then
		rock_ent:despawn()
		debug_player("despawn.rock_entity", pid, profile and profile.fid or nil, "ok")
	end

	if profile then
		fid_to_pid[profile.fid] = nil
		signal_room(profile.room or ROOM_VILLAGE, "PlayerLeft", {
			fid = profile.fid,
			id = profile.id,
			username = profile.username,
		})
		debug_player("despawn.player_left_broadcast", pid, profile.fid, "ok")
	end

	player_entities[pid] = nil
	rock_entities[pid] = nil
	profiles_by_pid[pid] = nil
	rocks_by_pid[pid] = nil
	debug_state("despawn.done")
end

local function update_style(pid, skin, hat)
	local profile = profiles_by_pid[pid]
	local ent = player_entities[pid]
	if not profile or not ent then
		return
	end

	if type(skin) == "string" then
		profile.skin = skin
	end
	if type(hat) == "string" then
		profile.hat = hat
	end
	profile.updatedAt = now()

	ent:custom(function(c)
		c.skin = profile.skin
		c.hat = profile.hat
		return c
	end)

	signal_room(profile.room or ROOM_VILLAGE, "PlayerStyleUpdate", {
		fid = profile.fid,
		skin = profile.skin,
		hat = profile.hat,
	})

	if not profile.isAnonymous then
		scene.run(function()
			memory.store(user_key(profile.fid), profile)
		end)
	end
end

local function update_rock(pid, patch)
	local rock_data = rocks_by_pid[pid]
	local rock_ent = rock_entities[pid]
	local profile = profiles_by_pid[pid]
	if not rock_data or not rock_ent or not profile then
		return nil
	end

	for key, value in pairs(patch) do
		rock_data[key] = value
	end
	rock_data.updatedAt = now()

	rock_ent:custom(function(c)
		for key, value in pairs(patch) do
			if key == "name" then
				c.rockName = value
			else
				c[key] = value
			end
		end
		return c
	end)

	if not profile.isAnonymous then
		scene.run(function()
			memory.store(rock_key(profile.fid), rock_data)
		end)
	end

	return rock_data
end

local function relationship_defaults(source_fid, target_fid)
	return {
		id = tostring(source_fid) .. ":" .. tostring(target_fid),
		sourceFid = source_fid,
		targetFid = target_fid,
		relationshipType = "acquaintance",
		points = 0,
		status = "active",
		createdAt = now(),
		updatedAt = now(),
	}
end

local function perform_interaction(interaction_id, interaction)
	local source_pid = fid_to_pid[interaction.sourceFid]
	local target_pid = fid_to_pid[interaction.targetFid]
	if not source_pid or not target_pid then
		return
	end

	local source = profiles_by_pid[source_pid]
	local target = profiles_by_pid[target_pid]
	if not source or not target then
		return
	end

	local points = INTERACTION_POINTS[interaction.type] or 0

	if source.isAnonymous or target.isAnonymous then
		local source_rel = relationship_defaults(source.fid, target.fid)
		source_rel.points = (source_rel.points or 0) + points
		source_rel.updatedAt = now()

		local payload = {
			updatedRelationship = source_rel,
			performedInteraction = {
				id = interaction_id,
				sourceFid = source.fid,
				targetFid = target.fid,
				type = interaction.type,
				pointsAwarded = points,
			},
			updatedCooldown = {
				id = tostring(source.fid) .. ":" .. tostring(interaction.type),
				userFid = source.fid,
				interactionType = interaction.type,
				lastUsed = now(),
				usageCount = 1,
			},
		}

		local source_player = player.get(source_pid)
		local target_player = player.get(target_pid)
		if source_player then
			source_player:signal("InteractionPerform"):data(payload):send()
		end
		if target_player then
			target_player:signal("InteractionPerform"):data(payload):send()
		end
		return
	end

	scene.run(function()
		local source_rel = merge_defaults(
			memory.fetch(relationship_key(source.fid, target.fid)),
			relationship_defaults(source.fid, target.fid)
		)
		local target_rel = merge_defaults(
			memory.fetch(relationship_key(target.fid, source.fid)),
			relationship_defaults(target.fid, source.fid)
		)

		local required = INTERACTION_REQUIREMENTS[interaction.type] or 0
		if (source_rel.points or 0) < required then
			local p = player.get(source_pid)
			if p then
				p:signal("InteractionRejected"):data({
					reason = "not_enough_points",
					required = required,
					points = source_rel.points or 0,
				}):send()
			end
			return
		end

		source_rel.points = (source_rel.points or 0) + points
		target_rel.points = (target_rel.points or 0) + points
		source_rel.updatedAt = now()
		target_rel.updatedAt = now()

		local cooldown = {
			id = tostring(source.fid) .. ":" .. tostring(interaction.type),
			userFid = source.fid,
			interactionType = interaction.type,
			lastUsed = now(),
			usageCount = 1,
		}

		memory.store(relationship_key(source.fid, target.fid), source_rel)
		memory.store(relationship_key(target.fid, source.fid), target_rel)
		memory.store(cooldown_key(source.fid, interaction.type), cooldown)

		local payload = {
			updatedRelationship = source_rel,
			performedInteraction = {
				id = interaction_id,
				sourceFid = source.fid,
				targetFid = target.fid,
				type = interaction.type,
				pointsAwarded = points,
			},
			updatedCooldown = cooldown,
		}

		local source_player = player.get(source_pid)
		local target_player = player.get(target_pid)
		if source_player then
			source_player:signal("InteractionPerform"):data(payload):send()
		end
		if target_player then
			target_player:signal("InteractionPerform"):data(payload):send()
		end
	end)
end

timer.create():interval(60):register("prl.age")

on.world.awake():take(1):each(function()
	print("[prl] Pet Rock Life ROCK gamemode booted")
end)

on.player.online():each(function(p, params)
	local pid = p:id()
	local fid = p:fid()
	debug_player(
		"online.event",
		pid,
		fid,
		"who=" .. tostring(p:who()) .. " params_room=" .. tostring(params and params.room or nil)
	)
	debug_state("online.before_scene")
	scene.run(function()
		debug_player("online.scene.begin", pid, fid, "player_get=before")
		local live_player = player.get(pid)
		if not live_player then
			debug_player("online.scene.no_live_player", pid, fid, "abort")
			return
		end
		debug_player("online.scene.live_player", pid, fid, "ok")

		local profile
		local rock_data
		if fid then
			debug_player("online.scene.load_profile", pid, fid, "farcaster")
			profile = enrich_profile_from_farcaster(load_or_create_profile(fid, params or {}))
			rock_data = load_or_create_rock(fid)
		else
			debug_player("online.scene.load_profile", pid, fid, "anonymous")
			profile = anonymous_profile(pid, params or {})
			rock_data = default_rock(profile.fid)
		end
		debug_player(
			"online.scene.profile_ready",
			pid,
			profile and profile.fid or fid,
			"username=" .. tostring(profile and profile.username or nil)
		)

		spawn_player(live_player, params or {}, profile, rock_data)
		debug_player("online.scene.spawn_returned", pid, profile and profile.fid or fid, "ok")
	end)
	debug_player("online.scene.scheduled", pid, fid, "ok")
end)

on.player.offline():each(function(snapshot)
	local fid = snapshot:fid()
	local pid = (fid and fid_to_pid[fid]) or snapshot:id()
	debug_player(
		"offline.event",
		snapshot:id(),
		fid,
		"mapped_pid=" .. tostring(pid) .. " who=" .. tostring(snapshot:who())
	)
	debug_state("offline.before")
	if not pid then
		debug_player("offline.no_pid", snapshot:id(), fid, "abort")
		return
	end

	local profile = profiles_by_pid[pid]
	local rock_data = rocks_by_pid[pid]
	debug_player(
		"offline.profile_lookup",
		pid,
		profile and profile.fid or fid,
		string.format(
			"profile=%s rock=%s anonymous=%s",
			tostring(profile ~= nil),
			tostring(rock_data ~= nil),
			tostring(profile and profile.isAnonymous or nil)
		)
	)
	if rock_data and profile and not profile.isAnonymous then
		rock_data.updatedAt = now()
		debug_player("offline.persist.schedule", pid, profile.fid, "rock")
		scene.run(function()
			debug_player("offline.persist.begin", pid, profile.fid, "rock")
			memory.store(rock_key(profile.fid), rock_data)
			debug_player("offline.persist.done", pid, profile.fid, "rock")
		end)
	end

	despawn_player(pid)
	print(string.format("[prl] player %d left", pid))
	debug_state("offline.done")
end)

on.player.input()
	:bind_action("Move")
	:each(function(p, input_data)
		local pid = p:id()
		local ent = player_entities[pid]
		if not ent then
			return
		end

		local pos = ent:position()
		local dx = tonumber(input_data.x) or 0
		local dy = tonumber(input_data.y) or 0

		ent:position({
			x = pos.x + dx * PLAYER_SPEED,
			y = pos.y + dy * PLAYER_SPEED,
		})

		local rock_ent = rock_entities[pid]
		if rock_ent then
			local rock_pos = rock_ent:position()
			rock_ent:position({
				x = rock_pos.x + dx * PLAYER_SPEED,
				y = rock_pos.y + dy * PLAYER_SPEED,
			})
		end
	end)

on.player.input()
	:bind_action("PetRock")
	:each(function(p, pressed)
		if not pressed then
			return
		end

		local pid = p:id()
		local profile = profiles_by_pid[pid]
		local rock_data = rocks_by_pid[pid]
		if not profile or not rock_data then
			return
		end

		local next_happiness = clamp((rock_data.happiness or 100) + 3, 0, 100)
		update_rock(pid, { happiness = next_happiness })
		signal_room(profile.room or ROOM_VILLAGE, "RockTalk", {
			fid = profile.fid,
			rockMessage = "❤️",
			isBouncing = true,
		})
	end)

on.player.signal():each(function(p, signal)
	local pid = p:id()
	local profile = profiles_by_pid[pid]
	local data = signal.data or {}

	if signal.name == "ChatMessage" then
		if not profile or type(data.text) ~= "string" then
			return
		end

		local text = data.text:gsub("^%s+", ""):gsub("%s+$", "")
		if #text == 0 or #text > 500 then
			return
		end

		signal_room(profile.room or ROOM_VILLAGE, "ChatMessage", {
			message = {
				id = tostring(now()) .. ":" .. tostring(math.random(100000, 999999)),
				fid = profile.fid,
				name = profile.username,
				message = text,
				timestamp = now() * 1000,
			},
		})
	elseif signal.name == "PlayerMove" then
		if not profile then
			return
		end

		local position = data.position or {}
		local rotation = data.rotation or {}
		local rock_position = data.rockPosition or {}
		local rock_rotation = data.rockRotation or {}
		local joystick = data.joystick or {}

		local ent = player_entities[pid]
		if ent and type(position.x) == "number" and type(position.z) == "number" then
			ent:position({ x = position.x, y = position.z })
			ent:custom(function(c)
				c.y = tonumber(position.y) or c.y
				c.rotationX = tonumber(rotation.x) or c.rotationX
				c.rotationY = tonumber(rotation.y) or c.rotationY
				c.rotationZ = tonumber(rotation.z) or c.rotationZ
				c.rotationW = tonumber(rotation.w) or c.rotationW
				c.joystickType = joystick.type or c.joystickType
				c.joystickX = tonumber(joystick.x) or c.joystickX
				c.joystickY = tonumber(joystick.y) or c.joystickY
				c.joystickDirection = joystick.direction or c.joystickDirection
				c.joystickDistance = tonumber(joystick.distance) or c.joystickDistance
				return c
			end)
		end

		local rock_ent = rock_entities[pid]
		if rock_ent and type(rock_position.x) == "number" and type(rock_position.z) == "number" then
			rock_ent:position({ x = rock_position.x, y = rock_position.z })
			rock_ent:custom(function(c)
				c.y = tonumber(rock_position.y) or c.y
				c.rotationX = tonumber(rock_rotation.x) or c.rotationX
				c.rotationY = tonumber(rock_rotation.y) or c.rotationY
				c.rotationZ = tonumber(rock_rotation.z) or c.rotationZ
				c.rotationW = tonumber(rock_rotation.w) or c.rotationW
				return c
			end)
		end
	elseif signal.name == "StyleChange" then
		update_style(pid, data.skin, data.hat)
	elseif signal.name == "RockPet" then
		local target_fid = tonumber(data.to) or (profile and profile.fid)
		local target_pid = target_fid and fid_to_pid[target_fid]
		if not target_pid then
			return
		end

		local target_profile = profiles_by_pid[target_pid]
		local target_rock = rocks_by_pid[target_pid]
		if not target_profile or not target_rock then
			return
		end

		if data.rubState == "start" then
			signal_room(target_profile.room or ROOM_VILLAGE, "RockTalk", {
				fid = target_profile.fid,
				rockMessage = "❤️",
				isBouncing = true,
			})
		elseif data.rubState == "end" then
			local next_happiness = clamp((target_rock.happiness or 100) + 3, 0, 100)
			update_rock(target_pid, { happiness = next_happiness })
			signal_room(target_profile.room or ROOM_VILLAGE, "RockUpdate", {
				fid = target_profile.fid,
				rock = { happiness = next_happiness },
			})
		end
	elseif signal.name == "RockRename" then
		if not profile then
			return
		end

		local name = trim_name(data.name)
		if not name then
			return
		end

		local rock_data = update_rock(pid, {
			name = name,
			passportChangedName = true,
		})
		if rock_data then
			signal_room(profile.room or ROOM_VILLAGE, "RockRename", {
				id = tostring(profile.fid),
				name = name,
			})
		end
	elseif signal.name == "InteractionStart" then
		if not profile then
			return
		end

		local target_fid = tonumber(data.targetFid)
		local target_pid = target_fid and fid_to_pid[target_fid]
		if not target_pid then
			return
		end

		local interaction_id = tostring(now()) .. ":" .. tostring(math.random(100000, 999999))
		local interaction = {
			sourceFid = profile.fid,
			targetFid = target_fid,
			type = data.type or "wave",
			createdAt = now(),
		}
		pending_interactions[interaction_id] = interaction

		local target_player = player.get(target_pid)
		if target_player then
			target_player:signal("InteractionRequest"):data({
				interactionId = interaction_id,
				sourceFid = interaction.sourceFid,
				targetFid = interaction.targetFid,
				type = interaction.type,
			}):send()
		end
	elseif signal.name == "InteractionAccept" then
		local interaction_id = data.interactionId
		local interaction = pending_interactions[interaction_id]
		if not interaction or not profile or interaction.targetFid ~= profile.fid then
			return
		end

		pending_interactions[interaction_id] = nil
		perform_interaction(interaction_id, interaction)
	elseif signal.name == "InteractionReject" then
		local interaction_id = data.interactionId
		local interaction = pending_interactions[interaction_id]
		if not interaction or not profile or interaction.targetFid ~= profile.fid then
			return
		end

		pending_interactions[interaction_id] = nil

		local source_pid = fid_to_pid[interaction.sourceFid]
		local source_player = source_pid and player.get(source_pid)
		if source_player then
			source_player:signal("InteractionReject"):data(interaction):send()
		end
	end
end)

on.timer.fire()
	:named("prl.age")
	:each(function()
		for pid, rock_data in pairs(rocks_by_pid) do
			local profile = profiles_by_pid[pid]
			if profile then
				rock_data.age = (rock_data.age or 0) + 60
				rock_data.updatedAt = now()

				local rock_ent = rock_entities[pid]
				if rock_ent then
					rock_ent:custom(function(c)
						c.age = rock_data.age
						return c
					end)
				end

				if not profile.isAnonymous then
					scene.run(function()
						memory.store(rock_key(profile.fid), rock_data)
					end)
				end
			end
		end
	end)
