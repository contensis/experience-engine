import { usePersonalizationContext } from "@contensis/personalization-react";
import Editor from "@monaco-editor/react";

const Manifest = () => {
  const { manifest } = usePersonalizationContext();
  return !manifest ? null : (
    <div>
      <Editor
        height="90vh"
        language="json"
        theme="vs-dark"
        value={JSON.stringify(manifest, null, 2)}
      />
    </div>
  );
};
export default Manifest;
