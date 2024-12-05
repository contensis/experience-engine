import { Link } from "react-router";
import Audiences from "~/audiences";

const page1 = () => {
  return (
    <>
      <h1>Page 1</h1>
      <p>
        <Link to={"/"}>Navigate to Home Page</Link>
      </p>
      <Audiences />
    </>
  );
};
export default page1;
