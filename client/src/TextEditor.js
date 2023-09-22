import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import Navbar from "./Navbar";
// import Dropdown from "./Dropdown";
// import languages from "./data";

const SAVE_INTERVAL_MS = 2000;
// const options = Object.keys(languages);

export default function TextEditor() {
  const { id: documentId } = useParams();
  let navigate = useNavigate();

  const [socket, setSocket] = useState();
  const [editorQuill, setEditorQuill] = useState();
  const [compilerQuill, setCompilerQuill] = useState();
  const [compile, setCompile] = useState(false);
  // const [progLanguage, setProgLanguage] = useState("Javascript");

  //Make socket.io connection
  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  //Load document or create one
  useEffect(() => {
    if (socket == null || editorQuill == null) return;

    socket.once("load-document", (document) => {
      editorQuill.setContents(document);
      editorQuill.enable();
    });

    socket.emit("get-document", documentId);
  }, [socket, editorQuill, documentId]);

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
    <>
      <Navbar />
      <div className="container">
        <p
          className="button new-file"
          onClick={() => navigate(`/documents/${uuidV4()}`)}
        >
          New Space
        </p>
        {/* <Dropdown
        options={options}
        progLanguage={progLanguage}
        setProgLanguage={setProgLanguage}
      /> */}

        <div className="code-container">
          <div className="editor-container" ref={wrapperRef}></div>
          <div className="compiler-container" ref={wrapperRef}></div>
        </div>

        <div className="button-container">
          <CopyToClipboard
            text={window.location.href}
            onCopy={() => alert("Link copird to clipboard")}
          >
            <p className="button">Copy Link</p>
          </CopyToClipboard>

          <p className="button" onClick={() => setCompile(true)}>
            Run
          </p>
        </div>
      </div>
    </>
  );
}
