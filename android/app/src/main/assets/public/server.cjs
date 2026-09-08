var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_multer = __toESM(require("multer"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var app = (0, import_express.default)();
var PORT = 3e3;
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var UPLOADS_DIR = import_path.default.join(process.cwd(), "uploads");
var VIDEOS_DIR = import_path.default.join(UPLOADS_DIR, "videos");
var AVATARS_DIR = import_path.default.join(UPLOADS_DIR, "avatars");
var GROUPS_DIR = import_path.default.join(UPLOADS_DIR, "group-images");
[DATA_DIR, UPLOADS_DIR, VIDEOS_DIR, AVATARS_DIR, GROUPS_DIR].forEach((dir) => {
  if (!import_fs.default.existsSync(dir)) {
    import_fs.default.mkdirSync(dir, { recursive: true });
  }
});
var DB_FILE = import_path.default.join(DATA_DIR, "nnecxy_db.json");
var defaultDB = {
  profiles: [],
  videos: [],
  likes: [],
  comments: [],
  follows: [],
  video_views: [],
  video_events: [],
  conversations: [],
  conversation_members: [],
  messages: [],
  groups: [],
  group_members: [],
  notifications: [],
  reports: [],
  sessions: {},
  credentials: {}
};
function readDB() {
  try {
    if (!import_fs.default.existsSync(DB_FILE)) {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
      return defaultDB;
    }
    const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB:", err);
    return defaultDB;
  }
}
function writeDB(db) {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Error writing DB:", err);
  }
}
var videoStorage = import_multer.default.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEOS_DIR),
  filename: (_req, file, cb) => {
    const ext = import_path.default.extname(file.originalname) || ".mp4";
    const unique = import_crypto.default.randomUUID();
    cb(null, `video_${unique}${ext}`);
  }
});
var avatarStorage = import_multer.default.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATARS_DIR),
  filename: (_req, file, cb) => {
    const ext = import_path.default.extname(file.originalname) || ".jpg";
    const unique = import_crypto.default.randomUUID();
    cb(null, `avatar_${unique}${ext}`);
  }
});
var uploadVideo = (0, import_multer.default)({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  // 100MB limit
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Veuillez s\xE9lectionner une vid\xE9o."));
    }
    cb(null, true);
  }
});
var uploadAvatar = (0, import_multer.default)({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});
app.use(import_express.default.json());
app.use(import_express.default.urlencoded({ extended: true }));
app.use("/uploads", import_express.default.static(UPLOADS_DIR));
function hashPassword(password, salt) {
  const s = salt || import_crypto.default.randomBytes(16).toString("hex");
  const hash = import_crypto.default.pbkdf2Sync(password, s, 1e3, 64, "sha512").toString("hex");
  return { hash, salt: s };
}
function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  const db = readDB();
  const userId = db.sessions[token];
  if (!userId) return null;
  return db.profiles.find((p) => p.id === userId) || null;
}
function requireAuth(req, res, next) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Session non valide ou expir\xE9e" });
  }
  req.user = user;
  next();
}
app.post("/api/auth/signup", (req, res) => {
  const { first_name, last_name, email, phone, birth_date, username, password, accept_terms } = req.body;
  if (!first_name || !last_name || !email && !phone || !username || !password) {
    return res.status(400).json({ error: "Tous les champs obligatoires doivent \xEAtre renseign\xE9s." });
  }
  if (accept_terms !== true && accept_terms !== "true") {
    return res.status(400).json({ error: "Vous devez accepter les conditions d'utilisation." });
  }
  const cleanUsername = username.replace(/^@/, "").toLowerCase().trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: "Le pseudo doit comporter au moins 3 caract\xE8res." });
  }
  const db = readDB();
  if (db.profiles.some((p) => p.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: "Ce pseudo est d\xE9j\xE0 utilis\xE9 par un autre compte." });
  }
  if (email && db.profiles.some((p) => p.email && p.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Cette adresse email est d\xE9j\xE0 associ\xE9e \xE0 un compte." });
  }
  const userId = import_crypto.default.randomUUID();
  const { hash, salt } = hashPassword(password);
  const newProfile = {
    id: userId,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    username: cleanUsername,
    email: email ? email.trim().toLowerCase() : void 0,
    phone: phone ? phone.trim() : void 0,
    birth_date: birth_date || null,
    bio: "",
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    followers_count: 0,
    following_count: 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const sessionToken = import_crypto.default.randomBytes(32).toString("hex");
  db.profiles.push(newProfile);
  db.credentials[userId] = { hash, salt };
  db.sessions[sessionToken] = userId;
  writeDB(db);
  return res.json({
    token: sessionToken,
    user: newProfile
  });
});
app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Identifiant et mot de passe requis." });
  }
  const db = readDB();
  const clean = identifier.trim().toLowerCase();
  const profile = db.profiles.find(
    (p) => p.username.toLowerCase() === clean || p.email && p.email.toLowerCase() === clean || p.phone && p.phone === clean
  );
  if (!profile) {
    return res.status(401).json({ error: "Identifiants incorrects ou compte inexistant." });
  }
  const creds = db.credentials[profile.id];
  if (!creds) {
    return res.status(401).json({ error: "Identifiants incorrects." });
  }
  const check = hashPassword(password, creds.salt);
  if (check.hash !== creds.hash) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }
  const sessionToken = import_crypto.default.randomBytes(32).toString("hex");
  db.sessions[sessionToken] = profile.id;
  writeDB(db);
  return res.json({
    token: sessionToken,
    user: profile
  });
});
app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = req.user;
  res.json({ user });
});
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const db = readDB();
    delete db.sessions[token];
    writeDB(db);
  }
  res.json({ success: true });
});
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Veuillez saisir votre adresse email." });
  }
  res.json({ success: true, message: "Si cette adresse existe, un lien de r\xE9initialisation vous a \xE9t\xE9 envoy\xE9." });
});
app.delete("/api/auth/delete-account", requireAuth, (req, res) => {
  const user = req.user;
  const db = readDB();
  const userVideos = db.videos.filter((v) => v.user_id === user.id);
  userVideos.forEach((v) => {
    if (v.video_url && v.video_url.startsWith("/uploads/")) {
      const filePath = import_path.default.join(process.cwd(), v.video_url);
      if (import_fs.default.existsSync(filePath)) {
        try {
          import_fs.default.unlinkSync(filePath);
        } catch (e) {
        }
      }
    }
  });
  db.videos = db.videos.filter((v) => v.user_id !== user.id);
  db.likes = db.likes.filter((l) => l.user_id !== user.id);
  db.comments = db.comments.filter((c) => c.user_id !== user.id);
  db.follows = db.follows.filter((f) => f.follower_id !== user.id && f.following_id !== user.id);
  db.profiles = db.profiles.filter((p) => p.id !== user.id);
  delete db.credentials[user.id];
  Object.keys(db.sessions).forEach((token) => {
    if (db.sessions[token] === user.id) {
      delete db.sessions[token];
    }
  });
  writeDB(db);
  res.json({ success: true });
});
app.get("/api/videos", (req, res) => {
  const currentUser = getAuthUser(req);
  const db = readDB();
  let list = db.videos.filter((v) => !v.is_shadow_banned && v.visibility === "public");
  list.sort((a, b) => {
    const scoreA = (a.boost_score || 0) + (a.likes_count || 0) * 2 + (a.comments_count || 0) * 3 + new Date(a.created_at).getTime() / 1e7;
    const scoreB = (b.boost_score || 0) + (b.likes_count || 0) * 2 + (b.comments_count || 0) * 3 + new Date(b.created_at).getTime() / 1e7;
    return scoreB - scoreA;
  });
  const enriched = list.map((v) => {
    const creator = db.profiles.find((p) => p.id === v.user_id) || {
      id: v.user_id,
      first_name: "Cr\xE9ateur",
      last_name: "NNECXY",
      username: "creator",
      bio: "",
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${v.user_id}`,
      followers_count: 0,
      following_count: 0
    };
    const hasLiked = currentUser ? db.likes.some((l) => l.video_id === v.id && l.user_id === currentUser.id) : false;
    const isFollowing = currentUser ? db.follows.some((f) => f.follower_id === currentUser.id && f.following_id === v.user_id) : false;
    return {
      ...v,
      creator,
      has_liked: hasLiked,
      is_following_creator: isFollowing
    };
  });
  res.json({ videos: enriched });
});
app.get("/api/videos/my", requireAuth, (req, res) => {
  const currentUser = req.user;
  const db = readDB();
  const userVideos = db.videos.filter((v) => v.user_id === currentUser.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ videos: userVideos });
});
app.get("/api/videos/user/:userId", (req, res) => {
  const { userId } = req.params;
  const db = readDB();
  const userVideos = db.videos.filter((v) => v.user_id === userId && v.visibility !== "private").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ videos: userVideos });
});
app.post("/api/videos/upload", requireAuth, (req, res) => {
  uploadVideo.single("video")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Erreur lors de la s\xE9lection du fichier vid\xE9o." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Veuillez s\xE9lectionner une vid\xE9o." });
    }
    const currentUser = req.user;
    const { title, description, allow_downloads } = req.body;
    const db = readDB();
    const videoId = import_crypto.default.randomUUID();
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    const newVideo = {
      id: videoId,
      user_id: currentUser.id,
      video_url: videoUrl,
      title: title ? title.trim() : "",
      description: description ? description.trim() : "",
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
      shares_count: 0,
      downloads_count: 0,
      is_download_allowed: allow_downloads !== "false" && allow_downloads !== false,
      is_shadow_banned: false,
      boost_score: 0,
      visibility: "public",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.videos.unshift(newVideo);
    writeDB(db);
    return res.json({
      success: true,
      video: {
        ...newVideo,
        creator: currentUser,
        has_liked: false,
        is_following_creator: false
      }
    });
  });
});
app.delete("/api/videos/:id", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { id } = req.params;
  const db = readDB();
  const video = db.videos.find((v) => v.id === id);
  if (!video) {
    return res.status(404).json({ error: "Vid\xE9o introuvable." });
  }
  if (video.user_id !== currentUser.id) {
    return res.status(403).json({ error: "Vous ne pouvez pas supprimer la vid\xE9o d\u2019un autre cr\xE9ateur." });
  }
  if (video.video_url && video.video_url.startsWith("/uploads/")) {
    const filePath = import_path.default.join(process.cwd(), video.video_url);
    if (import_fs.default.existsSync(filePath)) {
      try {
        import_fs.default.unlinkSync(filePath);
      } catch (e) {
      }
    }
  }
  db.videos = db.videos.filter((v) => v.id !== id);
  db.likes = db.likes.filter((l) => l.video_id !== id);
  db.comments = db.comments.filter((c) => c.video_id !== id);
  db.reports = db.reports.filter((r) => r.video_id !== id);
  db.video_views = db.video_views.filter((v) => v.video_id !== id);
  db.video_events = db.video_events.filter((e) => e.video_id !== id);
  writeDB(db);
  return res.json({ success: true, message: "Vid\xE9o supprim\xE9e avec succ\xE8s." });
});
app.post("/api/videos/:id/like", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { id } = req.params;
  const db = readDB();
  const video = db.videos.find((v) => v.id === id);
  if (!video) {
    return res.status(404).json({ error: "Vid\xE9o introuvable." });
  }
  const existingLikeIndex = db.likes.findIndex((l) => l.video_id === id && l.user_id === currentUser.id);
  let hasLiked = false;
  if (existingLikeIndex !== -1) {
    db.likes.splice(existingLikeIndex, 1);
    hasLiked = false;
  } else {
    db.likes.push({
      id: import_crypto.default.randomUUID(),
      video_id: id,
      user_id: currentUser.id,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    hasLiked = true;
    if (video.user_id !== currentUser.id) {
      db.notifications.unshift({
        id: import_crypto.default.randomUUID(),
        user_id: video.user_id,
        actor_id: currentUser.id,
        type: "like",
        title: "Nouveau J\u2019aime",
        message: `@${currentUser.username} a aim\xE9 votre vid\xE9o.`,
        data: { video_id: id },
        is_read: false,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  const realLikesCount = db.likes.filter((l) => l.video_id === id).length;
  video.likes_count = realLikesCount;
  writeDB(db);
  return res.json({ has_liked: hasLiked, likes_count: realLikesCount });
});
app.get("/api/videos/:id/comments", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const comments = db.comments.filter((c) => c.video_id === id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((c) => {
    const author = db.profiles.find((p) => p.id === c.user_id) || {
      id: c.user_id,
      first_name: "Utilisateur",
      last_name: "",
      username: "user",
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user_id}`
    };
    return { ...c, author };
  });
  res.json({ comments });
});
app.post("/api/videos/:id/comments", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Le commentaire ne peut pas \xEAtre vide." });
  }
  const db = readDB();
  const video = db.videos.find((v) => v.id === id);
  if (!video) {
    return res.status(404).json({ error: "Vid\xE9o introuvable." });
  }
  const newComment = {
    id: import_crypto.default.randomUUID(),
    video_id: id,
    user_id: currentUser.id,
    content: content.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.comments.push(newComment);
  video.comments_count = db.comments.filter((c) => c.video_id === id).length;
  if (video.user_id !== currentUser.id) {
    db.notifications.unshift({
      id: import_crypto.default.randomUUID(),
      user_id: video.user_id,
      actor_id: currentUser.id,
      type: "comment",
      title: "Nouveau commentaire",
      message: `@${currentUser.username} a comment\xE9 votre vid\xE9o: "${content.slice(0, 30)}..."`,
      data: { video_id: id, comment_id: newComment.id },
      is_read: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  writeDB(db);
  return res.json({ comment: { ...newComment, author: currentUser } });
});
app.delete("/api/videos/:id/comments/:commentId", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { id, commentId } = req.params;
  const db = readDB();
  const commentIndex = db.comments.findIndex((c) => c.id === commentId && c.video_id === id);
  if (commentIndex === -1) {
    return res.status(404).json({ error: "Commentaire introuvable." });
  }
  const comment = db.comments[commentIndex];
  if (comment.user_id !== currentUser.id) {
    return res.status(403).json({ error: "Vous ne pouvez supprimer que votre propre commentaire." });
  }
  db.comments.splice(commentIndex, 1);
  const video = db.videos.find((v) => v.id === id);
  if (video) {
    video.comments_count = db.comments.filter((c) => c.video_id === id).length;
  }
  writeDB(db);
  return res.json({ success: true });
});
var REPORT_REASONS = [
  "Harc\xE8lement et intimidation",
  "Spam et contenu ind\xE9sirable",
  "Contenu sexuel / Nudit\xE9 / Pornographie",
  "Abus sexuel / Exploitation sexuelle",
  "Mise en danger ou exploitation de mineur",
  "Contenu violent, sanglant ou choquant",
  "Discours haineux ou discriminatoire",
  "Informations fausses ou trompeuses",
  "Arnaque, escroquerie ou faux compte",
  "Atteinte \xE0 la propri\xE9t\xE9 intellectuelle (vol de vid\xE9o)",
  "Drogue, m\xE9dicaments ou substances illicites",
  "Suicide, automutilation ou troubles alimentaires",
  "Autre raison"
];
app.post("/api/reports", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { video_id, reason, description } = req.body;
  if (!video_id || !reason) {
    return res.status(400).json({ error: "Veuillez pr\xE9ciser la vid\xE9o et la raison du signalement." });
  }
  if (!REPORT_REASONS.includes(reason)) {
    return res.status(400).json({ error: "Raison de signalement non valide." });
  }
  const db = readDB();
  const video = db.videos.find((v) => v.id === video_id);
  if (!video) {
    return res.status(404).json({ error: "Vid\xE9o introuvable." });
  }
  if (video.user_id === currentUser.id) {
    return res.status(400).json({ error: "Vous ne pouvez pas signaler votre propre vid\xE9o." });
  }
  const existingReport = db.reports.find((r) => r.video_id === video_id && r.reporter_id === currentUser.id);
  if (existingReport) {
    return res.status(400).json({ error: "Vous avez d\xE9j\xE0 signal\xE9 cette vid\xE9o." });
  }
  const newReport = {
    id: import_crypto.default.randomUUID(),
    video_id,
    reporter_id: currentUser.id,
    reason,
    description: description ? description.trim() : null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.reports.push(newReport);
  const sameReasonCount = db.reports.filter((r) => r.video_id === video_id && r.reason === reason).length;
  if (sameReasonCount >= 3) {
    if (video.video_url && video.video_url.startsWith("/uploads/")) {
      const filePath = import_path.default.join(process.cwd(), video.video_url);
      if (import_fs.default.existsSync(filePath)) {
        try {
          import_fs.default.unlinkSync(filePath);
        } catch (e) {
        }
      }
    }
    db.videos = db.videos.filter((v) => v.id !== video_id);
    writeDB(db);
    return res.json({
      success: true,
      auto_moderated: "deleted",
      message: "Merci, votre signalement a \xE9t\xE9 re\xE7u."
    });
  }
  const distinctReasons = new Set(db.reports.filter((r) => r.video_id === video_id).map((r) => r.reason));
  if (distinctReasons.size >= 5) {
    video.is_shadow_banned = true;
    video.boost_score = 0;
    video.visibility = "demoted";
    writeDB(db);
    return res.json({
      success: true,
      auto_moderated: "demoted",
      message: "Merci, votre signalement a \xE9t\xE9 re\xE7u."
    });
  }
  writeDB(db);
  return res.json({
    success: true,
    message: "Merci, votre signalement a \xE9t\xE9 re\xE7u."
  });
});
app.post("/api/users/:id/follow", requireAuth, (req, res) => {
  const currentUser = req.user;
  const targetId = req.params.id;
  if (currentUser.id === targetId) {
    return res.status(400).json({ error: "Vous ne pouvez pas vous abonner \xE0 vous-m\xEAme." });
  }
  const db = readDB();
  const targetProfile = db.profiles.find((p) => p.id === targetId);
  if (!targetProfile) {
    return res.status(404).json({ error: "Cr\xE9ateur introuvable." });
  }
  const followIndex = db.follows.findIndex((f) => f.follower_id === currentUser.id && f.following_id === targetId);
  let isFollowing = false;
  if (followIndex !== -1) {
    db.follows.splice(followIndex, 1);
    isFollowing = false;
  } else {
    db.follows.push({
      id: import_crypto.default.randomUUID(),
      follower_id: currentUser.id,
      following_id: targetId,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    isFollowing = true;
    db.notifications.unshift({
      id: import_crypto.default.randomUUID(),
      user_id: targetId,
      actor_id: currentUser.id,
      type: "follow",
      title: "Nouvel abonn\xE9",
      message: `@${currentUser.username} s'est abonn\xE9(e) \xE0 votre profil.`,
      is_read: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  targetProfile.followers_count = db.follows.filter((f) => f.following_id === targetId).length;
  const myProfile = db.profiles.find((p) => p.id === currentUser.id);
  if (myProfile) {
    myProfile.following_count = db.follows.filter((f) => f.follower_id === currentUser.id).length;
  }
  writeDB(db);
  return res.json({
    is_following: isFollowing,
    followers_count: targetProfile.followers_count
  });
});
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const currentUser = getAuthUser(req);
  const db = readDB();
  const profile = db.profiles.find((p) => p.id === id);
  if (!profile) {
    return res.status(404).json({ error: "Profil introuvable." });
  }
  const isFollowing = currentUser ? db.follows.some((f) => f.follower_id === currentUser.id && f.following_id === id) : false;
  const userVideos = db.videos.filter((v) => v.user_id === id && v.visibility !== "private");
  const publicData = {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    username: profile.username,
    bio: profile.bio || "",
    avatar_url: profile.avatar_url,
    followers_count: db.follows.filter((f) => f.following_id === id).length,
    following_count: db.follows.filter((f) => f.follower_id === id).length,
    videos: userVideos,
    is_following: isFollowing
  };
  res.json({ profile: publicData });
});
app.put("/api/users/me", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { first_name, last_name, bio, avatar_url } = req.body;
  const db = readDB();
  const profile = db.profiles.find((p) => p.id === currentUser.id);
  if (!profile) {
    return res.status(404).json({ error: "Profil introuvable." });
  }
  if (first_name) profile.first_name = first_name.trim();
  if (last_name) profile.last_name = last_name.trim();
  if (bio !== void 0) profile.bio = bio.trim();
  if (avatar_url) profile.avatar_url = avatar_url;
  profile.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  writeDB(db);
  return res.json({ user: profile });
});
app.get("/api/search", (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  const db = readDB();
  if (!q) {
    return res.json({ users: [], videos: [] });
  }
  const users = db.profiles.filter(
    (p) => p.username.toLowerCase().includes(q) || p.first_name.toLowerCase().includes(q) || p.last_name.toLowerCase().includes(q)
  ).map((p) => ({
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    username: p.username,
    avatar_url: p.avatar_url,
    bio: p.bio,
    followers_count: db.follows.filter((f) => f.following_id === p.id).length
  }));
  const videos = db.videos.filter(
    (v) => !v.is_shadow_banned && v.visibility === "public" && (v.title && v.title.toLowerCase().includes(q) || v.description && v.description.toLowerCase().includes(q))
  ).map((v) => {
    const creator = db.profiles.find((p) => p.id === v.user_id);
    return { ...v, creator };
  });
  return res.json({ users, videos });
});
app.get("/api/conversations", requireAuth, (req, res) => {
  const currentUser = req.user;
  const db = readDB();
  const memberConvs = db.conversation_members.filter((cm) => cm.user_id === currentUser.id);
  const convIds = memberConvs.map((cm) => cm.conversation_id);
  const list = db.conversations.filter((c) => convIds.includes(c.id)).map((c) => {
    const members = db.conversation_members.filter((cm) => cm.conversation_id === c.id).map((cm) => db.profiles.find((p) => p.id === cm.user_id)).filter(Boolean);
    const msgs = db.messages.filter((m) => m.conversation_id === c.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return {
      ...c,
      members,
      last_message: msgs[0] || null
    };
  }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  res.json({ conversations: list });
});
app.post("/api/conversations", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { target_user_id } = req.body;
  if (!target_user_id) {
    return res.status(400).json({ error: "Destinataire requis." });
  }
  const db = readDB();
  const target = db.profiles.find((p) => p.id === target_user_id);
  if (!target) {
    return res.status(404).json({ error: "Utilisateur introuvable." });
  }
  const myConvs = db.conversation_members.filter((cm) => cm.user_id === currentUser.id).map((cm) => cm.conversation_id);
  const targetConvs = db.conversation_members.filter((cm) => cm.user_id === target_user_id).map((cm) => cm.conversation_id);
  const commonConvId = myConvs.find((id) => targetConvs.includes(id) && !db.conversations.find((c) => c.id === id)?.is_group);
  if (commonConvId) {
    const existing = db.conversations.find((c) => c.id === commonConvId);
    return res.json({ conversation: existing });
  }
  const newConvId = import_crypto.default.randomUUID();
  const newConv = {
    id: newConvId,
    is_group: false,
    title: null,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.conversations.push(newConv);
  db.conversation_members.push({ id: import_crypto.default.randomUUID(), conversation_id: newConvId, user_id: currentUser.id, role: "member" });
  db.conversation_members.push({ id: import_crypto.default.randomUUID(), conversation_id: newConvId, user_id: target_user_id, role: "member" });
  writeDB(db);
  return res.json({ conversation: newConv });
});
app.get("/api/conversations/:id/messages", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { id } = req.params;
  const db = readDB();
  const isMember = db.conversation_members.some((cm) => cm.conversation_id === id && cm.user_id === currentUser.id);
  if (!isMember) {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9 \xE0 cette conversation." });
  }
  const msgs = db.messages.filter((m) => m.conversation_id === id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((m) => {
    const sender = db.profiles.find((p) => p.id === m.sender_id);
    return { ...m, sender };
  });
  res.json({ messages: msgs });
});
app.post("/api/conversations/:id/messages", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Le message ne peut \xEAtre vide." });
  }
  const db = readDB();
  const isMember = db.conversation_members.some((cm) => cm.conversation_id === id && cm.user_id === currentUser.id);
  if (!isMember) {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9 \xE0 cette conversation." });
  }
  const newMsg = {
    id: import_crypto.default.randomUUID(),
    conversation_id: id,
    sender_id: currentUser.id,
    content: content.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.messages.push(newMsg);
  const conv = db.conversations.find((c) => c.id === id);
  if (conv) {
    conv.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  const otherMembers = db.conversation_members.filter((cm) => cm.conversation_id === id && cm.user_id !== currentUser.id);
  otherMembers.forEach((m) => {
    db.notifications.unshift({
      id: import_crypto.default.randomUUID(),
      user_id: m.user_id,
      actor_id: currentUser.id,
      type: "message",
      title: "Nouveau message",
      message: `@${currentUser.username}: ${content.slice(0, 35)}...`,
      data: { conversation_id: id },
      is_read: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  writeDB(db);
  return res.json({ message: { ...newMsg, sender: currentUser } });
});
app.get("/api/groups", requireAuth, (req, res) => {
  const currentUser = req.user;
  const db = readDB();
  const myGroupIds = db.group_members.filter((gm) => gm.user_id === currentUser.id).map((gm) => gm.group_id);
  const groups = db.groups.filter((g) => myGroupIds.includes(g.id)).map((g) => ({
    ...g,
    members_count: db.group_members.filter((gm) => gm.group_id === g.id).length
  }));
  res.json({ groups });
});
app.post("/api/groups", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Le nom du groupe est requis." });
  }
  const db = readDB();
  const groupId = import_crypto.default.randomUUID();
  const newGroup = {
    id: groupId,
    name: name.trim(),
    description: description ? description.trim() : "",
    image_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
    owner_id: currentUser.id,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.groups.push(newGroup);
  db.group_members.push({
    id: import_crypto.default.randomUUID(),
    group_id: groupId,
    user_id: currentUser.id,
    role: "owner",
    joined_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  writeDB(db);
  return res.json({ group: newGroup });
});
app.get("/api/notifications", requireAuth, (req, res) => {
  const currentUser = req.user;
  const db = readDB();
  const userNotifs = db.notifications.filter((n) => n.user_id === currentUser.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((n) => {
    const actor = n.actor_id ? db.profiles.find((p) => p.id === n.actor_id) : null;
    return { ...n, actor };
  });
  res.json({ notifications: userNotifs });
});
app.put("/api/notifications/:id/read", requireAuth, (req, res) => {
  const currentUser = req.user;
  const { id } = req.params;
  const db = readDB();
  const notif = db.notifications.find((n) => n.id === id && n.user_id === currentUser.id);
  if (notif) {
    notif.is_read = true;
    writeDB(db);
  }
  res.json({ success: true });
});
app.post("/api/events", (req, res) => {
  const currentUser = getAuthUser(req);
  const { video_id, event_type, metadata } = req.body;
  if (!video_id || !event_type) {
    return res.status(400).json({ error: "video_id et event_type requis." });
  }
  const db = readDB();
  const video = db.videos.find((v) => v.id === video_id);
  if (!video) {
    return res.status(404).json({ error: "Vid\xE9o introuvable." });
  }
  const eventRecord = {
    id: import_crypto.default.randomUUID(),
    video_id,
    user_id: currentUser ? currentUser.id : null,
    event_type,
    metadata: metadata || {},
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.video_events.push(eventRecord);
  if (event_type === "video_view_90" || event_type === "video_view_started") {
    video.views_count = (video.views_count || 0) + 1;
  } else if (event_type === "video_downloaded") {
    video.downloads_count = (video.downloads_count || 0) + 1;
  } else if (event_type === "video_shared") {
    video.shares_count = (video.shares_count || 0) + 1;
  }
  writeDB(db);
  return res.json({ success: true });
});
app.all(["/api/monetization", "/api/booster", "/api/creators/support", "/api/admob"], (_req, res) => {
  res.status(503).json({
    status: "unavailable",
    error: "Fonctionnalit\xE9 momentan\xE9ment indisponible.",
    message: "Le module de paiement s\xE9curis\xE9 sera activ\xE9 prochainement. Aucune transaction fictive n\u2019est simul\xE9e."
  });
});
app.get("/api/health", (_req, res) => {
  const db = readDB();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  res.json({
    status: "ok",
    app: "NNECXY",
    version: "1.0.0",
    backend: {
      connected: true,
      storage: "operational",
      database: "operational",
      counts: {
        profiles: db.profiles ? db.profiles.length : 0,
        videos: db.videos ? db.videos.length : 0,
        reports: db.reports ? db.reports.length : 0
      },
      supabase: {
        configured: Boolean(supabaseUrl && process.env.VITE_SUPABASE_ANON_KEY),
        project_url: supabaseUrl ? supabaseUrl.replace(/^https?:\/\//, "") : null
      }
    }
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`NNECXY Server running at http://0.0.0.0:${PORT}`);
  });
  const handleShutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on("SIGTERM", handleShutdown);
  process.on("SIGINT", handleShutdown);
}
startServer();
//# sourceMappingURL=server.cjs.map
