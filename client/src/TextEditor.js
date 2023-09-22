import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const SAVE_INTERVAL_MS = 2000;

export default function TextEditor() {
  let navigate = useNavigate();
  const location = useLocation();

  const [socket, setSocket] = useState();
  const [editorQuill, setEditorQuill] = useState();
  const [compilerQuill, setCompilerQuill] = useState();
  const [compile, setCompile] = useState(false);

  //Make socket.io connection
  useEffect(() => {
    const s = io("https://codev-space-api.onrender.com");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  //Load document or create one
  useEffect(() => {
    if (socket == null || editorQuill == null) return;

    const queryParams = new URLSearchParams(location.search);
    const room = queryParams.get("room");
    console.log(room);
    socket.once("load-document", (document) => {
      editorQuill.setContents(document);
      editorQuill.enable();
    });

    socket.emit("get-document", room);
  }, [socket, editorQuill, location]);

  //Save document to MongoDB
  useEffect(() => {
    if (socket == null || editorQuill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", editorQuill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, editorQuill]);

  //Receive changes from socket.io
  useEffect(() => {
    if (socket == null || editorQuill == null) return;

    const handler = (delta) => {
      editorQuill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, editorQuill]);

  //Send changes to socket.io
  useEffect(() => {
    if (socket == null || editorQuill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    editorQuill.on("text-change", handler);

    return () => {
      editorQuill.off("text-change", handler);
    };
  }, [socket, editorQuill]);

  //Receive code result from socket.io
  useEffect(() => {
    if (socket == null || compilerQuill == null) return;

    const handler = (result) => {
      const output =
        result["stderr"] === "" ? result["stdout"] : result["stderr"];
      const length = compilerQuill.getLength();
      compilerQuill.deleteText(0, length);
      compilerQuill.insertText(0, `Output:\n\n${output}`, "bold", true);
    };
    socket.on("receive-code-result", handler);

    return () => {
      socket.off("receive-code-result", handler);
    };
  }, [socket, compilerQuill, editorQuill]);

  //Send code to socket.io for compilation
  useEffect(() => {
    if (socket == null || editorQuill == null) return;

    if (compile === true) {
      const code = editorQuill.getContents()["ops"][0]["insert"];
      socket.emit("send-code", code);
    }

    setCompile(false);

    return () => {};
  }, [compile, compilerQuill, editorQuill, socket]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");

    wrapper.append(editor);

    const q = new Quill(editor, { theme: "snow" });

    q.disable();

    if (wrapper.className === "editor-container") {
      q.setText("Loading...");
      setEditorQuill(q);
    } else {
      q.insertText(0, "Output: ", "bold", true);
      setCompilerQuill(q);
    }
  }, []);

  return (
    <div className="container">
      <p className="button new-file" onClick={() => navigate("/")}>
        New Room
      </p>

      <div className="code-container">
        <div className="editor-container" ref={wrapperRef}></div>
        <div className="compiler-container" ref={wrapperRef}></div>
      </div>

      <div className="button-container">
        <CopyToClipboard
          text={window.location.href}
          onCopy={() => alert("Link copird to clipboard")}
        >
          <p className="button">Copy Room Link</p>
        </CopyToClipboard>

        <p className="button" onClick={() => setCompile(true)}>
          Run
        </p>
      </div>
    </div>
  );
}
