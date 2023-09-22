const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
const CodeSpace = require("./CodeSpace");

dotenv.config();

mongoose.connect(process.env.MONGO_URL);

const defaultValue = "";

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await CodeSpace.findByIdAndUpdate(documentId, { data });
    });

    socket.on("send-code", async (code) => {
      const result = await compileCode(code);
      io.in(documentId).emit("receive-code-result", result);
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await CodeSpace.findById(id);
  if (document) return document;

  return await CodeSpace.create({ _id: id, data: defaultValue });
}

async function compileCode(code) {
  const URL = "https://glot.io/api/run/python/latest";
  const data = {
    files: [
      {
        name: "main.py",
        content: code,
      },
    ],
  };
  const headers = {
    headers: {
      Authorization: process.env.GLOT_API_TOKEN,
      "Content-type": "application/json",
    },
  };
  const response = await axios.post(URL, data, headers);

  return response.data;
}
