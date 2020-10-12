const express = require("express");
const app = express();
const server = require("http").Server(app);

const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userID) => {
    // current socket to join room with room id
    socket.join(roomId);
    // boardcast message to other member of just conneted room
    // by emit user - connected event with user id
    socket.to(roomId).broadcast.emit("user-connected", userID);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnect", userID);
    });
  });
});

server.listen(3000);
