import { useExperienceEngineContext } from "@contensis/experience-engine-react";
import Editor from "@monaco-editor/react";

const Manifest = () => {
  const { manifest } = useExperienceEngineContext();
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
